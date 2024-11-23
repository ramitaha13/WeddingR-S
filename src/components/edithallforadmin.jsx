import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDatabase, ref, update, get } from "firebase/database";
import emailjs from "@emailjs/browser";
import {
  ArrowRight,
  X,
  Calendar,
  Phone,
  Mail,
  Building,
  Users,
  Tag,
  FileText,
} from "lucide-react";

const EditHallForAdmin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const database = getDatabase();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    emailForOwner: "",
    date: "",
    hallName: "",
    eventType: "",
    numberOfGuests: "",
    notes: "",
  });

  useEffect(() => {
    if (location.state?.booking) {
      const { booking } = location.state;
      setBooking(booking);
      const numberOfGuestsValue =
        booking.numberOfGuests !== undefined && booking.numberOfGuests !== null
          ? String(booking.numberOfGuests)
          : "";

      setFormData({
        name: booking.name || "",
        phone: booking.phone || "",
        email: booking.email || "",
        date: booking.date || "",
        emailForOwner: booking.emailForOwner || "",
        hallName: booking.hallName || "",
        eventType: booking.eventType || "",
        numberOfGuests: numberOfGuestsValue,
        notes: booking.notes || "",
      });
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "numberOfGuests") {
      if (value === "" || /^\d+$/.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const requiredFields = [
      "name",
      "phone",
      "email",
      "hallName",
      "emailForOwner",
      "date",
      "eventType",
      "numberOfGuests",
    ];

    // Check if any required field is empty
    const emptyField = requiredFields.find(
      (field) => !formData[field] || formData[field].trim() === "",
    );

    if (emptyField) {
      setError(`يرجى ملء جميع الحقول المطلوبة`);
      return false;
    }
    if (!formData.hallName || !formData.date) {
      setError("اسم القاعة والتاريخ مطلوبان");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const updates = {};

      // Generate keys for both old and new bookings
      const newBookingKey = `${formData.date}_${formData.hallName}`;
      const oldBookingKey = `${booking.date}_${booking.hallName}`;

      // Prepare updated booking data
      const updatedBooking = {
        ...formData,
        id: booking.id,
        numberOfGuests: formData.numberOfGuests
          ? parseInt(formData.numberOfGuests, 10)
          : 0,
        updatedAt: new Date().toISOString(),
      };

      // Check if we're changing the date or hall name
      if (
        booking.hallName !== formData.hallName ||
        booking.date !== formData.date
      ) {
        // First, check if the new date and hall combination is available
        const newDateRef = ref(
          database,
          `HallNames/${formData.hallName}/${formData.date}`,
        );
        const snapshot = await get(newDateRef);

        if (snapshot.exists() && oldBookingKey !== newBookingKey) {
          setError("هذا التاريخ محجوز مسبقاً لهذه القاعة");
          setLoading(false);
          return;
        }

        // Delete old booking from both locations
        updates[`HallNames/${booking.hallName}/${booking.date}`] = null;
        updates[`HallsBookings/${oldBookingKey}`] = null;

        // Add new booking to both locations
        updates[`HallNames/${formData.hallName}/${formData.date}`] =
          updatedBooking;
        updates[`HallsBookings/${newBookingKey}`] = updatedBooking;
      } else {
        // If we're not changing date or hall, just update the existing booking in both locations
        updates[`HallNames/${formData.hallName}/${formData.date}`] =
          updatedBooking;
        updates[`HallsBookings/${oldBookingKey}`] = updatedBooking;
      }

      // Perform all updates atomically
      await update(ref(database), updates);

      // Send email notification
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
        "service_3zv9u4t", // Replace with your EmailJS service ID
        "template_aibye9b", // Replace with your EmailJS template ID
        emailParams,
        "KlXmmdPsapLmtt6Pk", // Replace with your EmailJS public key
      );
      await emailjs.send(
        "service_3zv9u4t", // Replace with your EmailJS service ID
        "template_cgvx3qu", // Replace with your EmailJS template ID
        emailParams,
        "KlXmmdPsapLmtt6Pk", // Replace with your EmailJS public key
      );

      // Navigate back after successful update
      navigate(-1);
    } catch (error) {
      console.error("Error updating booking:", error);
      setError("حدث خطأ أثناء تحديث الحجز");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (!booking && !error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-pink-600 transition-colors duration-200 bg-white rounded-lg px-4 py-2 shadow-sm hover:shadow-md"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            <span>العودة إلى قائمة الحجوزات</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">تعديل حجز القاعة</h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-500" />
              </div>
              <div className="mr-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Customer Information Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                    معلومات العميل
                  </h3>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      اسم العميل
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      required
                    />
                    <div className="absolute left-3 top-9 text-gray-400">
                      <FileText className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      required
                    />
                    <div className="absolute left-3 top-9 text-gray-400">
                      <Phone className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      required
                    />
                    <div className="absolute left-3 top-9 text-gray-400">
                      <Mail className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      البريد الإلكتروني للمالك
                    </label>
                    <input
                      type="email"
                      name="emailForOwner"
                      value={formData.emailForOwner}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                    <div className="absolute left-3 top-9 text-gray-400">
                      <Mail className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* Booking Details Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                    تفاصيل الحجز
                  </h3>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      اسم القاعة
                    </label>
                    <input
                      type="text"
                      name="hallName"
                      value={formData.hallName}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      required
                    />
                    <div className="absolute left-3 top-9 text-gray-400">
                      <Building className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نوع المناسبة
                    </label>
                    <input
                      type="text"
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      required
                    />
                    <div className="absolute left-3 top-9 text-gray-400">
                      <Tag className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      تاريخ الحجز
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      required
                    />
                    <div className="absolute left-3 top-9 text-gray-400">
                      <Calendar className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      عدد الضيوف
                    </label>
                    <input
                      type="text"
                      name="numberOfGuests"
                      value={formData.numberOfGuests}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="أدخل عدد الضيوف"
                      required
                    />
                    <div className="absolute left-3 top-9 text-gray-400">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                  ملاحظات
                </h3>
                <div className="relative">
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="4"
                    className="block w-full pr-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="أدخل أي ملاحظات إضافية هنا..."
                  ></textarea>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-4 space-x-reverse mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className={`bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-3 rounded-lg hover:from-pink-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 shadow-lg transform transition hover:-translate-y-0.5 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="bg-white text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-md border border-gray-300"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditHallForAdmin;
