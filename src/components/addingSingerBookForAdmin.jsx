import { useState, useEffect } from "react";
import {
  ArrowRight,
  Calendar as CalendarIcon,
  AlertCircle,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";

const firebaseConfig = {
  databaseURL: "https://booking-appointments-4c1b0-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const BookSingerAppointment = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [bookedDatesMessage, setBookedDatesMessage] = useState("");
  const [singers, setSingers] = useState([]);
  const [singerEmail, setSingerEmail] = useState("");
  const navigate = useNavigate();
  const [isUser, setIsUser] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    singerPreference: "",
    occasion: "",
    specialRequirements: "",
    price: "",
  });

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
      setIsUser(false);
    } else {
      setIsUser(true);
    }
  }, []);

  useEffect(() => {
    const singersRef = ref(db, "Singer");
    onValue(singersRef, (snapshot) => {
      if (snapshot.exists()) {
        const singersData = snapshot.val();
        const singersList = Object.keys(singersData);
        setSingers(singersList);
      }
    });
  }, []);

  const fetchSingerEmail = async (singerName) => {
    try {
      const singerRef = ref(db, `Singer/${singerName}`);
      const snapshot = await get(singerRef);

      if (snapshot.exists()) {
        const singerData = snapshot.val();
        setSingerEmail(singerData.email || "");
      } else {
        setSingerEmail("");
      }
    } catch (error) {
      console.error("Error fetching singer email:", error);
      setSingerEmail("");
    }
  };

  const checkBookedDates = async (singerPreference, selectedDate) => {
    if (!singerPreference || !selectedDate) return "";

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

      let message = "التواريخ المحجوزة في نفس الشهر والسنة هي:";
      bookedDatesInSameMonthYear.forEach((date) => {
        message += `\n- ${date}`;
      });

      return message;
    }
    return "";
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "singerPreference") {
      if (selectedDate) {
        const message = await checkBookedDates(value, selectedDate);
        setBookedDatesMessage(message);
      }
      await fetchSingerEmail(value);
    }
  };

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (formData.singerPreference) {
      const message = await checkBookedDates(formData.singerPreference, date);
      setBookedDatesMessage(message);
    }
  };

  const sendConfirmationEmail = async (bookingData) => {
    try {
      await emailjs.send(
        "service_b2fp82e",
        "template_9w1rqqe",
        {
          user_name: bookingData.name,
          to_email: bookingData.email,
          singer_preference: bookingData.singerPreference,
          event_date: bookingData.date,
          event_type: bookingData.occasion,
          phone: bookingData.phoneNumber,
        },
        "8W_dUcqNmH-sc-pYJ",
      );
      console.log("Email sent successfully");
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  };

  const sendConfirmationOwnerEmail = async (bookingData) => {
    try {
      await emailjs.send(
        "service_b2fp82e",
        "template_rr8mg4m",
        {
          user_name: bookingData.name,
          owner_email: singerEmail,
          singer_preference: bookingData.singerPreference,
          event_date: bookingData.date,
          event_type: bookingData.occasion,
          phone: bookingData.phoneNumber,
        },
        "8W_dUcqNmH-sc-pYJ",
      );
      console.log("Email sent successfully");
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate) {
      alert("الرجاء اختيار التاريخ");
      return;
    }

    const bookedMessage = await checkBookedDates(
      formData.singerPreference,
      selectedDate,
    );

    if (bookedMessage) {
      alert(`التاريخ محجوز في هذا الشهر والسنة. \n${bookedMessage}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingId = `${selectedDate}`;
      const bookingData = {
        ...formData,
        date: selectedDate,
        emailOfOwner: singerEmail,
        createdAt: new Date().toISOString(),
      };

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

      await sendConfirmationEmail(bookingData);
      await sendConfirmationOwnerEmail(bookingData);

      alert("تم الحجز بنجاح!");

      setFormData({
        name: "",
        phoneNumber: "",
        email: "",
        singerPreference: "",
        occasion: "",
        specialRequirements: "",
        price: "",
      });
      setSelectedDate("");
      setBookedDatesMessage("");
    } catch (error) {
      console.error("Error saving booking:", error);
      alert("حدث خطأ أثناء الحجز. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("home");
    localStorage.clear();
  };

  if (!isUser) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-gray-100 p-6 flex items-center justify-center"
      >
        <div className="max-w-md w-full">
          <div className="bg-red-50 border border-red-400 rounded-lg p-4 flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <p className="text-center text-red-700 text-lg">
              عذراً، لا يمكنك الوصول إلى هذه الصفحة. يجب أن تكون مسؤولاً للوصول
              إليها.
            </p>
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={handleBack}
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              العودة إلى الصفحة الرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => window.history.back()}
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
                  <select
                    name="singerPreference"
                    value={formData.singerPreference}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                    required
                  >
                    <option value="">اختر المغني</option>
                    {singers.map((singer) => (
                      <option key={singer} value={singer}>
                        {singer}
                      </option>
                    ))}
                  </select>
                </div>

                {singerEmail && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      البريد الإلكتروني للمغني
                    </label>
                    <input
                      type="text"
                      value={singerEmail}
                      className="w-full border p-2 rounded bg-gray-50"
                      readOnly
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    السعر
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                    required
                    placeholder="ادخل السعر بالشيكل"
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
                    onChange={handleDateChange}
                    className="w-full border p-2 rounded"
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                {bookedDatesMessage && (
                  <div className="text-red-600 whitespace-pre-line">
                    {bookedDatesMessage}
                  </div>
                )}
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
