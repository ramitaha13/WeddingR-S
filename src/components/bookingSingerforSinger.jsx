import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Calendar as CalendarIcon } from "lucide-react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database";
import emailjs from "@emailjs/browser";

const firebaseConfig = {
  databaseURL: "https://booking-appointments-4c1b0-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// EmailJS configuration
// const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
// const EMAILJS_TEMPLATE_ID_SINGER = "YOUR_SINGER_TEMPLATE_ID";
// const EMAILJS_TEMPLATE_ID_CLIENT = "YOUR_CLIENT_TEMPLATE_ID";
// const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";

const sendEmails = async (bookingData) => {
  try {
    // Send email to client
    await emailjs.send(
      "service_b2fp82e",
      "template_9w1rqqe",
      // EMAILJS_SERVICE_ID,
      // EMAILJS_TEMPLATE_ID_CLIENT,
      {
        user_name: bookingData.name,
        to_email: bookingData.email,
        singer_preference: bookingData.singerPreference,
        event_date: bookingData.date,
        event_type: bookingData.occasion,
        phone: bookingData.phoneNumber,
      },
      "8W_dUcqNmH-sc-pYJ",
      //EMAILJS_PUBLIC_KEY,
    );

    return true;
  } catch (error) {
    console.error("Error sending emails:", error);
    throw error;
  }
};

const checkBookedDates = async (singerPreference, selectedDate) => {
  const singerNameRef = ref(
    db,
    `SingerNames/${singerPreference}/${selectedDate}`,
  );
  const snapshot = await get(singerNameRef);

  if (snapshot.exists()) {
    const bookedDates = await get(ref(db, `SingerNames/${singerPreference}`));
    const bookedDatesInSameMonthYear = Object.keys(bookedDates.val())
      .filter((date) => {
        const [year, month] = date.split("-");
        const selectedYear = selectedDate.split("-")[0];
        const selectedMonth = selectedDate.split("-")[1];
        return year === selectedYear && month === selectedMonth;
      })
      .sort();

    let bookedDatesMessage = "التواريخ المحجوزة في نفس الشهر والسنة هي:";
    bookedDatesInSameMonthYear.forEach((date) => {
      bookedDatesMessage += `\n- ${date}`;
    });

    return bookedDatesMessage;
  } else {
    return "";
  }
};

const BookSingerAppointment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { singerData } = location.state || {};

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [bookedDatesMessage, setBookedDatesMessage] = useState("");
  const [singerEmail, setSingerEmail] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    singerPreference: singerData?.name || "",
    occasion: "",
    specialRequirements: "",
    price: singerData?.price || "",
  });

  const fetchSingerEmail = async (singerName) => {
    try {
      const singerRef = ref(db, `Singer/${singerName}`);
      const snapshot = await get(singerRef);

      if (snapshot.exists()) {
        const singerData = snapshot.val();
        setSingerEmail(singerData.email || "");
      } else {
        setSingerEmail("");
        console.log("No singer data found");
      }
    } catch (error) {
      console.error("Error fetching singer email:", error);
      setSingerEmail("");
    }
  };

  useEffect(() => {
    if (singerData) {
      setFormData((prev) => ({
        ...prev,
        singerPreference: singerData.name,
        price: singerData.price,
      }));
      fetchSingerEmail(singerData.name);
    }
  }, [singerData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckBookedDates = async (singerPreference, selectedDate) => {
    const message = await checkBookedDates(singerPreference, selectedDate);
    setBookedDatesMessage(message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate) {
      setError("الرجاء اختيار التاريخ");
      return;
    }

    const bookedDatesMessage = await checkBookedDates(
      formData.singerPreference,
      selectedDate,
    );

    if (bookedDatesMessage) {
      setError(`التاريخ محجوز، يرجى اختيار تاريخ آخر. ${bookedDatesMessage}`);
      alert(`التاريخ محجوز في هذا الشهر والسنة. \n${bookedDatesMessage}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const bookingId = `${selectedDate}`;
      const bookingData = {
        ...formData,
        date: selectedDate,
        createdAt: new Date().toISOString(),
        emailOfOwner: singerEmail,
      };

      // Save booking to Firebase
      const bookingRef = ref(
        db,
        `SingerBookings/${bookingId}_${formData.singerPreference}`,
      );
      await set(bookingRef, bookingData);

      const singerBookingRef = ref(
        db,
        `SingerNames/${formData.singerPreference}/${bookingId}`,
      );
      await set(singerBookingRef, bookingData);

      // Send confirmation emails
      try {
        await sendEmails(bookingData);
        alert(
          "تم الحجز بنجاح وتم إرسال رسائل التأكيد! سيتم تحويلك إلى صفحة التواصل.",
        );
      } catch (emailError) {
        console.error("Error sending confirmation emails:", emailError);
        alert(
          "تم الحجز بنجاح ولكن فشل إرسال رسائل التأكيد. سيتم تحويلك إلى صفحة التواصل.",
        );
      }

      setFormData({
        name: "",
        phoneNumber: "",
        email: "",
        singerPreference: "",
        occasion: "",
        specialRequirements: "",
      });
      setSelectedDate("");

      navigate(`/Login/${formData.singerPreference}`);
    } catch (error) {
      console.error("Error saving booking:", error);
      setError("حدث خطأ أثناء الحجز. يرجى المحاولة مرة أخرى.");
      alert("حدث خطأ أثناء الحجز. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowRight className="w-5 h-5 ml-2" />
          العودة إلى القائمة
        </button>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-6">
            <CalendarIcon className="w-8 h-8 text-pink-600 ml-3" />
            <h1 className="text-2xl font-bold text-gray-800">حجز مغني</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                معلومات شخصية
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    اسم العميل
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    رقم الجوال
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                تفاصيل الحجز
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    نوع المناسبة
                  </label>
                  <select
                    name="occasion"
                    value={formData.occasion}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                    required
                  >
                    <option value="">اختر المناسبة</option>
                    <option value="سهرة عريس">سهرة عريس</option>
                    <option value="سهرة عروس">سهرة عروس</option>
                    <option value="سهرة مشتركة">سهرة مشتركة</option>
                    <option value="خطبة عريس">خطبة عريس</option>
                    <option value="خطبة عروس">خطبة عروس</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    المغني المفضل
                  </label>
                  <input
                    type="text"
                    name="singerPreference"
                    value={formData.singerPreference}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded bg-gray-100"
                    required
                    readOnly
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    البريد الإلكتروني للمغني
                  </label>
                  <input
                    type="email"
                    value={singerEmail}
                    className="w-full border p-2 rounded bg-gray-100"
                    readOnly
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    السعر
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={`${formData.price} شيكل`}
                    className="w-full border p-2 rounded bg-gray-100"
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                التاريخ
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    اختر التاريخ
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      handleCheckBookedDates(
                        formData.singerPreference,
                        e.target.value,
                      );
                    }}
                    className="w-full border p-2 rounded"
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                معلومات إضافية
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    متطلبات خاصة
                  </label>
                  <textarea
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border p-2 rounded"
                    placeholder="أي متطلبات خاصة..."
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
                {error}
              </div>
            )}

            {bookedDatesMessage && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 rounded">
                {bookedDatesMessage}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`p-2 rounded-lg ${
                  isSubmitting
                    ? "bg-pink-400 cursor-not-allowed"
                    : "bg-pink-600 hover:bg-pink-700"
                } text-white px-6 transition-colors duration-300`}
              >
                {isSubmitting ? "جاري الحجز..." : "تأكيد الحجز"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookSingerAppointment;
