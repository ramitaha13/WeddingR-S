import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { getDatabase, ref, set, get, onValue } from "firebase/database";
import emailjs from "@emailjs/browser";

const AppointmentBooking = () => {
  const [halls, setHalls] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    hallName: "",
    phone: "",
    emailForOwner: "",
    date: "",
    numberOfGuests: "",
    notes: "",
    eventType: "",
  });

  const [bookedDatesMessage, setBookedDatesMessage] = useState("");

  // Fetch halls from Firebase on component mount
  useEffect(() => {
    const db = getDatabase();
    const hallsRef = ref(db, "halls");
    onValue(hallsRef, (snapshot) => {
      if (snapshot.exists()) {
        const hallsData = snapshot.val();
        const hallsList = Object.keys(hallsData);
        setHalls(hallsList);
      }
    });
  }, []);

  const checkBookedDates = async (hallName, selectedDate) => {
    if (!hallName || !selectedDate)
      return { isBooked: false, bookedDatesMessage: "" };

    const db = getDatabase();
    const hallNameRef = ref(db, `HallNames/${hallName}/${selectedDate}`);
    const snapshot = await get(hallNameRef);

    if (snapshot.exists()) {
      const bookedDates = await get(ref(db, `HallNames/${hallName}`));
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

      return {
        isBooked: true,
        bookedDatesMessage,
      };
    }
    return {
      isBooked: false,
      bookedDatesMessage: "",
    };
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === "date" || name === "hallName") {
      const { bookedDatesMessage } = await checkBookedDates(
        name === "hallName" ? value : formData.hallName,
        name === "date" ? value : formData.date,
      );
      setBookedDatesMessage(bookedDatesMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      "name",
      "email",
      "hallName",
      "phone",
      "emailForOwner",
      "date",
      "numberOfGuests",
      "eventType",
    ];

    const isValidReservation = requiredFields.every((field) => formData[field]);

    if (!isValidReservation) {
      alert("Please fill in all required fields before submitting.");
      return;
    }

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

    const db = getDatabase();
    const hallNameRef = ref(
      db,
      `HallNames/${formData.hallName}/${formData.date}`,
    );

    try {
      // Save to Firebase
      await set(hallNameRef, {
        ...formData,
        date: formData.date,
      });

      const bookingRef = ref(
        db,
        `HallsBookings/${formData.date}_${formData.hallName}`,
      );
      await set(bookingRef, formData);

      // Send email using EmailJS
      const emailParams = {
        from_name: "Hall Booking System",
        to_name: formData.name,
        to_email: formData.email,
        to_emailOwener: formData.emailForOwner,
        hall_name: formData.hallName,
        event_type: formData.eventType,
        event_date: formData.date,
        phone: formData.phone,
        number_of_guests: formData.numberOfGuests,
        notes: formData.notes || "No additional notes",
      };

      await emailjs.send(
        "service_3zv9u4t",
        "template_aibye9b",
        emailParams,
        "KlXmmdPsapLmtt6Pk",
      );
      await emailjs.send(
        "service_3zv9u4t",
        "template_cgvx3qu",
        emailParams,
        "KlXmmdPsapLmtt6Pk",
      );

      alert("تم الحجز بنجاح وإرسال البريد الإلكتروني!");
      setFormData({
        name: "",
        email: "",
        hallName: "",
        phone: "",
        date: "",
        emailForOwner: "",
        numberOfGuests: "",
        notes: "",
        eventType: "",
      });
    } catch (error) {
      console.error("Error saving reservation or sending email:", error);
      alert(
        "حدث خطأ أثناء حفظ الحجز أو إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى.",
      );
    }
  };

  const eventTypes = [
    "سهرة عروس",
    "سهرة عريس",
    "سهره مشتركة",
    "خطبة عروس",
    "خطبة عريس",
    "عشاء",
    "سهره + عشاء",
  ];

  const guestOptions = [
    { label: "0 - 400", value: "0-400" },
    { label: "401 - 700", value: "401-700" },
    { label: "701 - 1000", value: "701-1000" },
    { label: "اكثر من 1000", value: "اكثر من-1000" },
  ];

  const today = new Date().toISOString().split("T")[0];

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-8"
    >
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors duration-300"
        >
          العودة
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-pink-900 mb-8 text-center">
            حجز موعد
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                اسم الشخصي
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
                البريد الإلكتروني للقاعة
              </label>
              <input
                type="email"
                name="emailForOwner"
                value={formData.emailForOwner}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                اسم القاعة
              </label>
              <select
                name="hallName"
                value={formData.hallName}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="">اختر القاعة</option>
                {halls.map((hall) => (
                  <option key={hall} value={hall}>
                    {hall}
                  </option>
                ))}
              </select>
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
                min={today}
              />
              {bookedDatesMessage && (
                <div className="text-red-500 text-sm mt-2 whitespace-pre-line">
                  {bookedDatesMessage}
                </div>
              )}
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
