import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { getDatabase, ref, update, remove, get } from "firebase/database";
import emailjs from "@emailjs/browser";
import {
  ArrowRight,
  X,
  Calendar,
  Phone,
  Mail,
  Music2,
  Tag,
  DollarSign,
  FileText,
  User,
} from "lucide-react";

const EditSingerforAdmin = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    phoneNumber: "",
    email: "",
    singerPreference: "",
    occasion: "",
    price: "",
    specialRequirements: "",
    emailOfOwner: "",
  });
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const database = getDatabase();
  const navigate = useNavigate();

  useEffect(() => {
    if (!booking && bookingId) {
      const bookingRef = ref(database, `SingerBookings/${bookingId}`);
      get(bookingRef)
        .then((snapshot) => {
          const data = snapshot.val();
          console.log("Loaded booking data:", data);
          if (data) {
            setBooking(data);
            setFormData({
              name: data.name || "",
              date: data.date || "",
              phoneNumber: data.phone || "",
              email: data.email || "",
              singerPreference: data.singerPreference || "",
              occasion: data.occasion || "",
              price: data.price || "",
              specialRequirements: data.specialRequirements || "",
              emailOfOwner: data.emailOfOwner || "",
            });
          } else {
            setError("لم يتم العثور على الحجز");
          }
        })
        .catch((error) => {
          console.error("Error loading booking:", error);
          setError("حدث خطأ أثناء تحميل بيانات الحجز");
        });
    }
  }, [bookingId, booking, database]);

  useEffect(() => {
    if (booking) {
      setFormData({
        name: booking.name || "",
        date: booking.date || "",
        phoneNumber: booking.phone || "",
        email: booking.email || "",
        singerPreference: booking.singerName || "",
        occasion: booking.occasion || "",
        price: booking.price || "",
        specialRequirements: booking.specialRequirements || "",
        emailOfOwner: booking.emailOfOwner || "",
      });
    }
  }, [booking]);

  const validateForm = () => {
    const errors = {};
    const requiredFields = {
      name: "اسم الزبون",
      date: "تاريخ الحجز",
      phoneNumber: "رقم الهاتف",
      email: "البريد الإلكتروني",
      singerPreference: "المطرب",
      occasion: "المناسبة",
      price: "السعر",
      emailOfOwner: "البريد الإلكتروني للمالك",
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData[field].trim()) {
        errors[field] = `${label} مطلوب`;
      }
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = "البريد الإلكتروني غير صالح";
    }
    if (formData.emailOfOwner && !emailRegex.test(formData.emailOfOwner)) {
      errors.emailOfOwner = "البريد الإلكتروني للمالك غير صالح";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const sendNotificationEmail = async (updatedBooking) => {
    try {
      const emailTemplate = {
        to_name: updatedBooking.name,
        to_email: updatedBooking.email,
        singer_name: updatedBooking.singerPreference,
        booking_date: updatedBooking.date,
        occasion: updatedBooking.occasion,
        price: updatedBooking.price,
        special_requirements: updatedBooking.specialRequirements || "لا يوجد",
        owner_email: updatedBooking.emailOfOwner,
        phone: updatedBooking.phoneNumber,
      };

      // Send email to customer
      await emailjs.send(
        "service_jsdevfx",
        "template_0y89jsi",
        emailTemplate,
        "LGxW6QBt5TMuKxaej",
      );

      // Send email to owner
      // const ownerTemplate = {
      //   ...emailTemplate,
      //   to_email: updatedBooking.emailOfOwner,
      //   to_name: "Owner",
      // };

      // await emailjs.send(
      //   process.env.REACT_APP_EMAILJS_SERVICE_ID,
      //   process.env.REACT_APP_EMAILJS_OWNER_TEMPLATE_ID,
      //   ownerTemplate,
      //   process.env.REACT_APP_EMAILJS_PUBLIC_KEY,
      // );
    } catch (error) {
      console.error("Error sending email notification:", error);
      throw new Error("فشل في إرسال البريد الإلكتروني للإشعار");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!validateForm()) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      setIsLoading(false);
      return;
    }

    try {
      const oldDate = bookingId.split("_")[0];
      const newDate = formData.date;

      if (oldDate !== newDate) {
        const existingBookingRef = ref(
          database,
          `SingerNames/${formData.singerPreference}/${newDate}`,
        );
        const existingBookingSnapshot = await get(existingBookingRef);

        if (existingBookingSnapshot.exists()) {
          setError(
            "هذا التاريخ محجوز مسبقًا لهذا المطرب. يرجى اختيار تاريخ آخر.",
          );
          setIsLoading(false);
          return;
        }

        const newBookingId = `${newDate}_${formData.singerPreference}`;
        await remove(
          ref(database, `SingerNames/${formData.singerPreference}/${oldDate}`),
        );
        await remove(ref(database, `SingerBookings/${bookingId}`));

        const updates = {
          ...formData,
          updatedAt: new Date().toISOString(),
        };

        await update(
          ref(database, `SingerNames/${formData.singerPreference}/${newDate}`),
          updates,
        );
        await update(ref(database, `SingerBookings/${newBookingId}`), updates);

        await sendNotificationEmail(updates);
      } else {
        const updates = {
          ...formData,
          updatedAt: new Date().toISOString(),
        };

        await update(
          ref(database, `SingerNames/${formData.singerPreference}/${oldDate}`),
          updates,
        );
        await update(ref(database, `SingerBookings/${bookingId}`), updates);

        await sendNotificationEmail(updates);
      }

      navigate("/alltheevents");
    } catch (error) {
      console.error("Error updating booking:", error);
      setError(error.message || "حدث خطأ أثناء تحديث بيانات الحجز.");
    } finally {
      setIsLoading(false);
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

  const renderInput = (name, label, icon, type = "text", readonly = false) => (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        className={`block w-full pl-10 pr-3 py-2 rounded-lg border ${
          validationErrors[name]
            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300 focus:ring-pink-500 focus:border-pink-500"
        } shadow-sm focus:ring-2`}
        readOnly={readonly}
      />
      <div className="absolute left-3 top-9 text-gray-400">{icon}</div>
      {validationErrors[name] && (
        <p className="mt-1 text-sm text-red-600">{validationErrors[name]}</p>
      )}
    </div>
  );

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
          <h1 className="text-3xl font-bold text-gray-900">تعديل حجز مطرب</h1>
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
                  {renderInput(
                    "name",
                    "اسم الزبون",
                    <FileText className="h-5 w-5" />,
                  )}
                  {renderInput(
                    "phoneNumber",
                    "رقم الهاتف",
                    <Phone className="h-5 w-5" />,
                  )}
                  {renderInput(
                    "email",
                    "البريد الإلكتروني",
                    <Mail className="h-5 w-5" />,
                    "email",
                  )}
                  {renderInput(
                    "emailOfOwner",
                    "البريد الإلكتروني للمالك",
                    <User className="h-5 w-5" />,
                    "email",
                  )}
                </div>

                {/* Booking Details Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                    تفاصيل الحجز
                  </h3>
                  {renderInput(
                    "singerPreference",
                    "المطرب",
                    <Music2 className="h-5 w-5" />,
                    "text",
                    true,
                  )}
                  {renderInput(
                    "occasion",
                    "المناسبة",
                    <Tag className="h-5 w-5" />,
                  )}
                  {renderInput(
                    "date",
                    "تاريخ الحجز",
                    <Calendar className="h-5 w-5" />,
                    "date",
                  )}
                  {renderInput(
                    "price",
                    "السعر",
                    <DollarSign className="h-5 w-5" />,
                    "text",
                    true,
                  )}
                </div>
              </div>

              {/* Special Requirements Section */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                  متطلبات خاصة
                </h3>
                <div className="relative">
                  <textarea
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleInputChange}
                    rows="4"
                    className="block w-full pr-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="أدخل أي متطلبات خاصة هنا..."
                  ></textarea>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-4 space-x-reverse mt-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-3 rounded-lg hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 shadow-lg transform transition hover:-translate-y-0.5 flex items-center ${
                    isLoading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                      جاري الحفظ...
                    </>
                  ) : (
                    "حفظ التغييرات"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className={`bg-white text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-md border border-gray-300 ${
                    isLoading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
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

export default EditSingerforAdmin;
