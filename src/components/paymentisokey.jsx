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
        // await sendConfirmationEmail();
        // await sendOwnerEmail();

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
};

export default PaymentIsOkay;
