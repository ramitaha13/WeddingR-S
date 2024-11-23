import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getDatabase, ref, set, get } from "firebase/database";

const checkBookedDates = async (hallName, selectedDate) => {
  const db = getDatabase();
  const hallNameRef = ref(db, `HallNames/${hallName}/${selectedDate}`);
  const snapshot = await get(hallNameRef);

  if (snapshot.exists()) {
    // Get all booked dates in the same month and year as the selected date
    const bookedDates = await get(ref(db, `HallNames/${hallName}`));
    const bookedDatesInSameMonthYear = Object.keys(bookedDates.val())
      .filter((date) => {
        const [year, month, day] = date.split("-");
        const selectedYear = selectedDate.split("-")[0];
        const selectedMonth = selectedDate.split("-")[1];
        return year === selectedYear && month === selectedMonth;
      })
      .sort();

    let bookedDatesMessage = "التواريخ المحجوزة في نفس الشهر والسنة هي:";
    bookedDatesInSameMonthYear.forEach((date) => {
      bookedDatesMessage += `\n- ${date}`;
    });

    return {
      isBooked: true,
      bookedDatesMessage,
    };
  } else {
    return {
      isBooked: false,
      bookedDatesMessage: "",
    };
  }
};

const AppointmentBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hallName } = location.state || { hallName: "" };
  const { email_owner } = location.state || { email_owner: "" };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    emailForOwner: email_owner,
    hallName: hallName,
    phone: "",
    date: "",
    numberOfGuests: "",
    notes: "",
    eventType: "",
  });

  const [bookedDatesMessage, setBookedDatesMessage] = useState("");

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === "date") {
      const { isBooked, bookedDatesMessage } = await checkBookedDates(
        formData.hallName,
        value,
      );
      setBookedDatesMessage(bookedDatesMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all required fields
    const requiredFields = [
      "name",
      "email",
      "emailForOwner",
      "phone",
      "date",
      "numberOfGuests",
      "eventType",
    ];
    const isValidReservation = requiredFields.every((field) => formData[field]);

    if (!isValidReservation) {
      alert("Please fill in all required fields before submitting.");
      return;
    }

    // Check if the selected date is already booked for the chosen hall
    const { isBooked } = await checkBookedDates(
      formData.hallName,
      formData.date,
    );

    if (isBooked) {
      alert(
        `هذه القاعة محجوزة في هذا التاريخ، يرجى اختيار تاريخ آخر. ${bookedDatesMessage}`,
      );
      return;
    }

    // Save the new booking to the HallNames node
    const db = getDatabase();
    const hallNameRef = ref(
      db,
      `HallNames/${formData.hallName}/${formData.date}`,
    );
    try {
      await set(hallNameRef, {
        date: formData.date,
        hallName: formData.hallName,
        name: formData.name,
        emailForOwner: formData.emailForOwner,
        email: formData.email,
        phone: formData.phone,
        numberOfGuests: formData.numberOfGuests,
        eventType: formData.eventType,
        notes: formData.notes,
      });

      // Save the booking to the HallsBookings node
      const bookingRef = ref(
        db,
        `HallsBookings/${formData.date}_${formData.hallName}`,
      );
      await set(bookingRef, formData);

      console.log("Reservation saved successfully!");

      // Navigate to contact page with booking data
      navigate("/PaymentForm", { state: formData });
      // navigate("/PaymentForm");
    } catch (error) {
      console.error("Error saving reservation:", error);
      alert(
        "An error occurred while saving the reservation. Please try again later.",
      );
    }
  };

  // Event type options
  const eventTypes = [
    "سهرة عروس",
    "سهرة عريس",
    "سهره مشتركة",
    "خطبة عروس",
    "خطبة عريس",
    "عشاء",
    "سهره + عشاء",
  ];

  // New number of guests options
  const guestOptions = [
    { label: "0 - 400", value: "0-400" },
    { label: "401 - 700", value: "401-700" },
    { label: "701 - 1000", value: "701-1000" },
    { label: "اكثر من 1000", value: "اكثر من-1000" },
  ];

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-8"
    >
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/contact")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors duration-300"
        >
          العودة إلى القائمة
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-pink-900 mb-8 text-center">
            حجز موعد
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                اسم الشخصي الثلاثي
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                اسم القاعة
              </label>
              <input
                type="text"
                name="hallName"
                value={formData.hallName}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 bg-gray-50"
                readOnly
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                البريد الإلكتروني للقاعة
              </label>
              <input
                type="text"
                name="emailForOwner"
                value={formData.emailForOwner}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 bg-gray-50"
                readOnly
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                نوع المناسبة
              </label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="">اختر نوع المناسبة</option>
                {eventTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                رقم الجوال
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                تاريخ المناسبة
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
                min={today} // Prevent selecting past dates
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                عدد الضيوف
              </label>
              <select
                name="numberOfGuests"
                value={formData.numberOfGuests}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="">اختر عدد الضيوف</option>
                {guestOptions.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                ملاحظات إضافية
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                rows="4"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-pink-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-pink-700 transition-colors duration-300"
              >
                تأكيد الحجز
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;
