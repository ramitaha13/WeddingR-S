import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Calendar as CalendarIcon } from "lucide-react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database";

const firebaseConfig = {
  databaseURL: "https://booking-appointments-4c1b0-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

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
  const singerData = location.state?.singerData;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [bookedDatesMessage, setBookedDatesMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    emailOfOwner: singerData?.email || "",
    singerPreference: singerData?.name || "",
    date: "",
    occasion: "",
    specialRequirements: "",
    price: singerData?.price || "",
  });

  useEffect(() => {
    if (singerData) {
      setFormData((prev) => ({
        ...prev,
        singerPreference: singerData.name,
        price: singerData.price,
      }));
    }
  }, [singerData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date) {
      setError("الرجاء اختيار التاريخ");
      return;
    }

    const bookedDatesMessage = await checkBookedDates(
      formData.singerPreference,
      formData.date,
    );

    if (bookedDatesMessage) {
      setError(`التاريخ محجوز، يرجى اختيار تاريخ آخر. ${bookedDatesMessage}`);
      alert(`التاريخ محجوز في هذا الشهر والسنة. \n${bookedDatesMessage}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const bookingId = `${formData.date}`;

      const bookingData = {
        ...formData,
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

      setFormData({
        name: "",
        phoneNumber: "",
        email: "",
        emailOfOwner: "",
        date: "",
        singerPreference: "",
        occasion: "",
        specialRequirements: "",
      });

      navigate("/PaymentForSinger", { state: formData });
    } catch (error) {
      console.error("Error saving booking:", error);
      setError("حدث خطأ أثناء الحجز. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/singersPage")}
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
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    البريد الإلكتروني للقاعة
                  </label>
                  <input
                    type="email"
                    name="emailOfOwner"
                    value={formData.emailOfOwner}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                    readOnly
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
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
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
