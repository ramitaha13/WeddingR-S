import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { getDatabase, ref, set } from "firebase/database";

const PaymentIsOkay = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [emailError, setEmailError] = useState(null);
  const bookingData = location.state || {};

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

  const saveToFirebase = async () => {
    try {
      const db = getDatabase();

      // Save to HallNames path
      const hallNameRef = ref(
        db,
        `HallNames/${bookingData.hallName}/${bookingData.date}`,
      );

      await set(hallNameRef, {
        date: bookingData.date,
        hallName: bookingData.hallName,
        name: bookingData.name,
        emailForOwner: bookingData.emailForOwner,
        email: bookingData.email,
        phone: bookingData.phone,
        numberOfGuests: bookingData.numberOfGuests,
        eventType: bookingData.eventType,
        notes: bookingData.notes || "",
      });

      // Save to HallsBookings path
      const bookingRef = ref(
        db,
        `HallsBookings/${bookingData.date}_${bookingData.hallName}`,
      );

      await set(bookingRef, bookingData);

      console.log("Booking data saved successfully to Firebase!");
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      throw new Error("Failed to save booking data to Firebase");
    }
  };

  const sendConfirmationEmail = async () => {
    try {
      const templateParams = {
        to_email: bookingData.email.trim().toLowerCase(),
        owner_email: bookingData.emailForOwner || "",
        user_name: bookingData.name || "عميل",
        hall_name: bookingData.hallName || "قاعة غير محددة",
        event_type: bookingData.eventType || "مناسبة",
        event_date: bookingData.date || "تاريخ غير محدد",
        number_of_guests: bookingData.numberOfGuests || "غير محدد",
        phone: bookingData.phone || "غير محدد",
      };

      const response = await emailjs.send(
        "service_jsdevfx",
        "template_0y89jsi",
        templateParams,
      );

      console.log("Customer email confirmation sent:", response);
    } catch (error) {
      console.error("Customer email error:", error);
      setEmailError(error);
      throw error;
    }
  };

  const sendOwnerEmail = async () => {
    try {
      const templateParams = {
        owner_email: bookingData.emailForOwner || "",
        user_name: bookingData.name || "عميل",
        hall_name: bookingData.hallName || "قاعة غير محددة",
        event_date: bookingData.date || "تاريخ غير محدد",
        phone: bookingData.phone || "غير محدد",
      };

      const response = await emailjs.send(
        "service_jsdevfx",
        "template_uvruslb",
        templateParams,
      );

      console.log("Owner email confirmation sent:", response);
    } catch (error) {
      console.error("Owner email error:", error);
      setEmailError(error);
      throw error;
    }
  };

  useEffect(() => {
    const processPayment = async () => {
      emailjs.init({
        publicKey: "LGxW6QBt5TMuKxaej",
      });

      try {
        if (!validateBookingData()) {
          alert("الرجاء التأكد من اكتمال جميع بيانات الحجز");
          navigate("/");
          return;
        }

        // Save to Firebase first
        await saveToFirebase();

        // Then send confirmation emails
        await sendConfirmationEmail();
        await sendOwnerEmail();

        alert("تمت عملية الدفع والحجز بنجاح. شكراً لك!");
        navigate("/");
      } catch (error) {
        console.error("Error in payment/booking process:", error);

        if (error.status === 400) {
          alert("خطأ في إعدادات البريد الإلكتروني. يرجى مراجعة الإعدادات.");
        } else if (error.status === 401) {
          alert("مشكلة في المصادقة. تحقق من مفاتيح API الخاصة بك.");
        } else {
          alert(
            `حدث خطأ أثناء معالجة الدفع والحجز: ${error.message || "خطأ غير معروف"}`,
          );
        }

        navigate("/");
      }
    };

    processPayment();
  }, []); // Dependencies handled inside the effect

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
              <strong>البريد الإلكتروني للقاعة:</strong>{" "}
              {bookingData.emailForOwner}
            </p>

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
