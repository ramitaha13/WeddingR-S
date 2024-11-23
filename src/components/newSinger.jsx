import { useState, useEffect } from "react";
import { ArrowRight, Mic, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

// Initialize Firebase
const firebaseConfig = {
  databaseURL: "https://booking-appointments-4c1b0-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const NewSinger = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    price: "",
    instagram: "",
    tiktok: "",
    email: "",
    specialties: [],
  });

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
      setIsAdmin(false);
    } else {
      setIsAdmin(true);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // const handleSpecialtiesChange = (e) => {
  //   const { value } = e.target;
  //   const specialties = value.split(",").map((specialty) => specialty.trim());
  //   setFormData((prev) => ({
  //     ...prev,
  //     specialties,
  //   }));
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Create a reference to the specific singer using the singer's name
      const singerRef = ref(db, `Singer/${formData.name}`);

      // Create a reference for the simple names list
      const nameRef = ref(db, `SingerNames/${formData.name}`);

      // Prepare the detailed singer data
      const singerData = {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        price: Number(formData.price),
        instagram: formData.instagram,
        tiktok: formData.tiktok,
        email: formData.email,
        specialties: formData.specialties,
        createdAt: new Date().toISOString(),
      };

      // Write operations to perform
      const writes = [
        // Write the full singer data
        set(singerRef, singerData),
        // Write just the name to the names list
        set(nameRef, formData.name),
      ];

      // Execute all writes
      await Promise.all(writes);

      // Reset form
      setFormData({
        name: "",
        phoneNumber: "",
        price: "",
        instagram: "",
        tiktok: "",
        email: "",
        specialties: [],
      });

      // Navigate to the admin page
      navigate("/admin");
    } catch (error) {
      console.error("Error saving singer:", error);
      setError("حدث خطأ أثناء تسجيل المطرب. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/"); // العودة إلى صفحة الاتصال
    localStorage.clear();
  };

  if (!isAdmin) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-gray-100 p-6 flex items-center justify-center"
      >
        <div className="max-w-md w-full">
          <div className="bg-red-50 border border-red-400 rounded-lg p-4 flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <p className="text-center text-red-700 text-lg">
              عذراً، لا يمكنك الوصول إلى هذه الصفحة. يجب أن تكون مسؤولاً للوصول
              إليها.
            </p>
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={handleBack}
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              العودة إلى الصفحة الرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowRight className="w-5 h-5 ml-2" />
          العودة إلى القائمة
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            <Mic className="w-8 h-8 text-pink-600 ml-3" />
            <h1 className="text-2xl font-bold text-gray-800">
              تسجيل مطرب جديد
            </h1>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المطرب
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الجوال
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السعر للحفلة (ريال)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  حساب الإنستقرام
                </label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="مثال: @username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  حساب التيكتوك
                </label>
                <input
                  type="text"
                  name="tiktok"
                  value={formData.tiktok}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="مثال: @username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  e-mail
                </label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${
                  isSubmitting ? "bg-pink-400" : "bg-pink-600 hover:bg-pink-700"
                } text-white px-6 py-3 rounded-lg transition-colors duration-200`}
              >
                {isSubmitting ? "جاري التسجيل..." : "تسجيل المطرب"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewSinger;
