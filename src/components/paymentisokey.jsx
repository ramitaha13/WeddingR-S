import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";

const PaymentIsOkay = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [emailError, setEmailError] = useState(null);
  const bookingData = location.state || {};

  useEffect(() => {
    // Configure EmailJS once when component mounts
    emailjs.init({
      publicKey: "LGxW6QBt5TMuKxaej",
    });

    const confirmPayment = async () => {
      try {
        // Validate required data before sending email
        if (!validateBookingData()) {
          alert("الرجاء التأكد من اكتمال جميع بيانات الحجز");
          return;
        }

        alert("تمت عملية الدفع بنجاح. شكراً لك!");
        await sendConfirmationEmail();
        await sendConfirmationEmail1();
      } catch (error) {
        console.error("Error in payment confirmation:", error);
        alert("حدث خطأ أثناء معالجة الدفع.");
      }
    };

    confirmPayment();
  }, []);

  // Data validation function
  const validateBookingData = () => {
    const requiredFields = [
      "name",
      "email",
      "hallName",
      "emailForOwner",
      "eventType",
      "date",
      "numberOfGuests",
      "phone",
    ];

    return requiredFields.every(
      (field) => bookingData[field] && bookingData[field].trim() !== "",
    );
  };

  const sendConfirmationEmail = async () => {
    try {
      // Sanitize the email address
      const cleanedEmail = bookingData.email.trim().toLowerCase();

      // Detailed template parameters
      const templateParams = {
        to_email: cleanedEmail,
        owner_email: bookingData.emailForOwner || "",
        user_name: bookingData.name || "عميل",
        hall_name: bookingData.hallName || "قاعة غير محددة",
        event_type: bookingData.eventType || "مناسبة",
        event_date: bookingData.date || "تاريخ غير محدد",
        number_of_guests: bookingData.numberOfGuests || "غير محدد",
        phone: bookingData.phone || "غير محدد",
      };

      // Send email with comprehensive error handling
      const response = await emailjs.send(
        "service_jsdevfx", // Service ID
        "template_0y89jsi", // Template ID
        templateParams,
      );

      console.log("Full email response:", response);
      alert("تم إرسال بريد تأكيد الحجز بنجاح.");
    } catch (error) {
      console.error("Detailed email error:", error);

      // Comprehensive error logging
      setEmailError(error);

      // More detailed error messages
      if (error.status === 400) {
        alert("خطأ في إعدادات البريد الإلكتروني. يرجى مراجعة الإعدادات.");
      } else if (error.status === 401) {
        alert("مشكلة في المصادقة. تحقق من مفاتيح API الخاصة بك.");
      } else {
        alert(`خطأ في إرسال البريد: ${error.text || "خطأ غير معروف"}`);
      }
    }
  };

  const sendConfirmationEmail1 = async () => {
    try {
      // Sanitize the email address
      const cleanedEmail = bookingData.email.trim().toLowerCase();

      // Detailed template parameters
      const templateParams = {
        owner_email: bookingData.emailForOwner || "",
        user_name: bookingData.name || "عميل",
        hall_name: bookingData.hallName || "قاعة غير محددة",
        event_date: bookingData.date || "تاريخ غير محدد",
        phone: bookingData.phone || "غير محدد",
      };

      // Send email with comprehensive error handling
      const response = await emailjs.send(
        "service_jsdevfx", // Service ID
        "template_uvruslb", // Template ID
        templateParams,
      );

      console.log("Full email response:", response);
      alert("تم إرسال بريد تأكيد الحجز بنجاح.");
    } catch (error) {
      console.error("Detailed email error:", error);

      // Comprehensive error logging
      setEmailError(error);

      // More detailed error messages
      if (error.status === 400) {
        alert("خطأ في إعدادات البريد الإلكتروني. يرجى مراجعة الإعدادات.");
      } else if (error.status === 401) {
        alert("مشكلة في المصادقة. تحقق من مفاتيح API الخاصة بك.");
      } else {
        alert(`خطأ في إرسال البريد: ${error.text || "خطأ غير معروف"}`);
      }
    }
  };

  return (
    <div dir="rtl" className="container mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">تفاصيل الحجز</h2>
        {bookingData ? (
          <div className="space-y-2">
            <p>
              <strong>اسم العميل:</strong> {bookingData.name}
            </p>
            <p>
              <strong>اسم القاعة:</strong> {bookingData.hallName}
            </p>
            <p>
              <strong>نوع المناسبة:</strong> {bookingData.eventType}
            </p>
            <p>
              <strong>تاريخ المناسبة:</strong> {bookingData.date}
            </p>
            <p>
              <strong>عدد الضيوف:</strong> {bookingData.numberOfGuests}
            </p>
            <p>
              <strong>رقم الهاتف:</strong> {bookingData.phone}
            </p>
            <p>
              <strong>البريد الإلكتروني:</strong> {bookingData.email}
            </p>
            <p>
              <strong>البريد الإلكتروني:</strong> {bookingData.emailForOwner}
            </p>

            {/* Debug information */}
            {emailError && (
              <div className="bg-red-100 p-4 mt-4 rounded">
                <strong>تفاصيل الخطأ:</strong>
                <pre>{JSON.stringify(emailError, null, 2)}</pre>
              </div>
            )}
          </div>
        ) : (
          <p>لا توجد تفاصيل حجز متاحة</p>
        )}
      </div>
    </div>
  );
};

export default PaymentIsOkay;
