import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getDatabase, ref, update, remove, get } from "firebase/database";
import { initializeApp } from "firebase/app";
import {
  ArrowRight,
  X,
  Phone,
  FileText,
  Music2,
  Tag,
  Mail,
  Trash2,
  AlertCircle,
  DollarSign,
} from "lucide-react";

const EditBookSinger = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hallId, orderId } = useParams();
  const orderData = location.state?.order;

  const [formData, setFormData] = useState({
    name: orderData?.name || "",
    phoneNumber: orderData?.phoneNumber || "",
    date: orderData?.date || "",
    price: orderData?.price || "",
    email: orderData?.email || "",
    occasion: orderData?.occasion || "",
    singerPreference: orderData?.singerPreference || "",
    specialRequirements: orderData?.specialRequirements || "",
  });

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState("");
  const [priceError, setPriceError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (name === "email") {
      setEmailError("");
    }
    if (name === "price") {
      setPriceError("");
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePrice = (price) => {
    return price && !isNaN(price) && parseFloat(price) > 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Email validation
    if (!formData.email) {
      setEmailError("البريد الإلكتروني مطلوب");
      return;
    }

    if (!validateEmail(formData.email)) {
      setEmailError("الرجاء إدخال بريد إلكتروني صحيح");
      return;
    }

    // Price validation
    if (!formData.price) {
      setPriceError("السعر مطلوب");
      return;
    }

    if (!validatePrice(formData.price)) {
      setPriceError("الرجاء إدخال سعر صحيح");
      return;
    }

    const firebaseConfig = {
      databaseURL:
        "https://booking-appointments-4c1b0-default-rtdb.firebaseio.com",
    };

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    const updates = {
      ...formData,
      updatedAt: new Date().toISOString(),
    };

    try {
      // Get original date from orderId
      const oldDate = orderId.split("-").slice(0, 3).join("-");

      // Format new date for the key (YYYY-MM-DD format)
      const newDate = formData.date.split("/").reverse().join("-");

      // Check if the new date already exists for the singer
      const existingBookingRef = ref(
        db,
        `SingerNames/${formData.singerPreference}/${newDate}`,
      );
      const existingBookingSnapshot = await get(existingBookingRef);

      if (
        existingBookingSnapshot.exists() &&
        existingBookingSnapshot.val().orderId !== orderId
      ) {
        setError(
          "هذا التاريخ محجوز مسبقًا لهذا المطرب. يرجى اختيار تاريخ آخر.",
        );
        return;
      }

      // Create new booking ID with date and singer name
      const newBookingId = `${newDate}_${formData.singerPreference}`;

      if (oldDate !== newDate) {
        // Delete old entries
        await remove(
          ref(db, `SingerNames/${formData.singerPreference}/${orderId}`),
        );
        await remove(
          ref(db, `SingerBookings/${orderId}_${formData.singerPreference}`),
        );

        // Create new entries with new date
        // Update in SingerNames
        await update(
          ref(db, `SingerNames/${formData.singerPreference}/${newDate}`),
          updates,
        );

        // Update in SingerBookings with new format (YYYY-MM-DD_singerName)
        await update(ref(db, `SingerBookings/${newBookingId}`), {
          ...updates,
          hallId,
        });
      } else {
        // If date hasn't changed, just update the existing entries
        await update(
          ref(db, `SingerNames/${formData.singerPreference}/${oldDate}`),
          updates,
        );

        // Update in SingerBookings with existing format
        await update(
          ref(db, `SingerBookings/${oldDate}_${formData.singerPreference}`),
          {
            ...updates,
            hallId,
          },
        );
      }

      navigate(`/Login/${hallId}`);
    } catch (error) {
      console.error("Error updating booking:", error);
      setError("حدث خطأ أثناء تحديث الحجز");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("هل أنت متأكد من حذف هذا الحجز؟")) {
      setIsDeleting(true);
      const firebaseConfig = {
        databaseURL:
          "https://booking-appointments-4c1b0-default-rtdb.firebaseio.com",
      };

      const app = initializeApp(firebaseConfig);
      const db = getDatabase(app);

      try {
        // Get the date from orderId
        const date = orderId.split("-").slice(0, 3).join("-");

        // Delete from both locations
        await remove(
          ref(db, `SingerNames/${formData.singerPreference}/${orderId}`),
        );
        await remove(
          ref(db, `SingerBookings/${date}_${formData.singerPreference}`),
        );

        navigate(`/Login/${hallId}`);
      } catch (error) {
        console.error("Error deleting booking:", error);
        setError("حدث خطأ أثناء حذف الحجز");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-pink-600 transition-colors duration-200 bg-white rounded-lg px-4 py-2 shadow-sm hover:shadow-md"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            <span>رجوع</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">تعديل حجز المطرب</h1>
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
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                <Trash2 className="ml-2" size={16} />
                <span>{isDeleting ? "جارٍ الحذف..." : "حذف الحجز"}</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Customer Information Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                    معلومات العميل
                  </h3>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      اسم الزبون
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
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
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      required
                    />
                    <div className="absolute left-3 top-9 text-gray-400">
                      <Phone className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      البريد الإلكتروني<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                        emailError ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                    />
                    <div className="absolute left-3 top-9 text-gray-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    {emailError && (
                      <div className="mt-1 flex items-center text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4 ml-1" />
                        <span>{emailError}</span>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      السعر<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                        priceError ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                      min="0"
                      step="0.01"
                    />
                    <div className="absolute left-3 top-9 text-gray-400">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    {priceError && (
                      <div className="mt-1 flex items-center text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4 ml-1" />
                        <span>{priceError}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Details Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                    تفاصيل الحجز
                  </h3>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      تاريخ الحجز
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
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نوع السهره
                    </label>
                    <input
                      type="text"
                      name="occasion"
                      value={formData.occasion}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      required
                    />
                    <div className="absolute left-3 top-9 text-gray-400">
                      <Tag className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      المطرب
                    </label>
                    <input
                      type="text"
                      name="singerPreference"
                      value={formData.singerPreference}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      readOnly
                    />
                    <div className="absolute left-3 top-9 text-gray-400">
                      <Music2 className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-4 space-x-reverse mt-8">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-3 rounded-lg hover:from-pink-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 shadow-lg transform transition hover:-translate-y-0.5"
                >
                  حفظ التغييرات
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/Login/${hallId}`)}
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

export default EditBookSinger;
