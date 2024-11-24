import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  databaseURL: "https://booking-appointments-4c1b0-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const PaymentIsOkay = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [emailError, setEmailError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const bookingData = location.state || {};

  const validateBookingData = () => {
    const requiredFields = [
      "name",
      "email",
      "singerPreference",
      "emailOfOwner",
      "occasion",
      "date",
      "phoneNumber",
    ];

    return requiredFields.every(
      (field) => bookingData[field] && bookingData[field].trim() !== "",
    );
  };

  const saveToFirebase = async () => {
    try {
      const bookingId = `${bookingData.date}`;

      // Save to SingerBookings
      const bookingRef = ref(
        db,
        `SingerBookings/${bookingId}_${bookingData.singerPreference}`,
      );

      const bookingDataWithTimestamp = {
        ...bookingData,
        createdAt: new Date().toISOString(),
        paymentStatus: "completed",
      };

      await set(bookingRef, bookingDataWithTimestamp);

      // Save to SingerNames
      const singerBookingRef = ref(
        db,
        `SingerNames/${bookingData.singerPreference}/${bookingId}`,
      );
      await set(singerBookingRef, bookingDataWithTimestamp);
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      setSaveError(error);
      throw error;
    }
  };

  const sendConfirmationEmail = async () => {
    try {
      const cleanedEmail = bookingData.email.trim().toLowerCase();

      const templateParams = {
        to_email: cleanedEmail,
        owner_email: bookingData.emailOfOwner || "",
        user_name: bookingData.name || "عميل",
        hall_name: bookingData.singerPreference || "قاعة غير محددة",
        event_type: bookingData.occasion || "مناسبة",
        event_date: bookingData.date || "تاريخ غير محدد",
        phone: bookingData.phoneNumber || "غير محدد",
      };

      const response = await emailjs.send(
        "service_jsdevfx",
        "template_0y89jsi",
        templateParams,
      );

      console.log("Customer email response:", response);
    } catch (error) {
      console.error("Customer email error:", error);
      setEmailError(error);
      throw error;
    }
  };

  const sendOwnerConfirmationEmail = async () => {
    try {
      const templateParams = {
        owner_email: bookingData.emailOfOwner || "",
        user_name: bookingData.name || "عميل",
        hall_name: bookingData.singerPreference || "قاعة غير محددة",
        event_date: bookingData.date || "تاريخ غير محدد",
        phone: bookingData.phoneNumber || "غير محدد",
      };

      const response = await emailjs.send(
        "service_jsdevfx",
        "template_uvruslb",
        templateParams,
      );

      console.log("Owner email response:", response);
    } catch (error) {
      console.error("Owner email error:", error);
      setEmailError(error);
      throw error;
    }
  };

  useEffect(() => {
    emailjs.init({
      publicKey: "LGxW6QBt5TMuKxaej",
    });

    const processPayment = async () => {
      try {
        if (!validateBookingData()) {
          alert("الرجاء التأكد من اكتمال جميع بيانات الحجز");
          return;
        }

        // First save to Firebase
        await saveToFirebase();

        // Then send confirmation emails
        await sendConfirmationEmail();
        await sendOwnerConfirmationEmail();

        alert("تمت عملية الدفع والحجز بنجاح. تم إرسال رسائل التأكيد!");
      } catch (error) {
        console.error("Error in payment process:", error);

        if (error.status === 400) {
          alert("خطأ في إعدادات البريد الإلكتروني. يرجى مراجعة الإعدادات.");
        } else if (error.status === 401) {
          alert("مشكلة في المصادقة. تحقق من مفاتيح API الخاصة بك.");
        } else {
          alert("حدث خطأ أثناء معالجة الدفع والحجز. يرجى المحاولة مرة أخرى.");
        }
      }

      navigate("/");
    };

    processPayment();
  }, [bookingData]);
};

export default PaymentIsOkay;
