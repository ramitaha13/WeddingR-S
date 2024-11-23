import React, { useState, useEffect } from "react";
import { ArrowRight, Mic, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, remove } from "firebase/database";

// Initialize Firebase
const firebaseConfig = {
  databaseURL: "https://booking-appointments-4c1b0-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const EditSinger = () => {
  const navigate = useNavigate();
  const { singerName } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
      setIsAdmin(false);
    } else {
      setIsAdmin(true);
    }
  }, []);

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
    const fetchSingerData = async () => {
      try {
        const singerRef = ref(db, `Singer/${singerName}`);
        const snapshot = await get(singerRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          setFormData({
            name: data.name || "",
            phoneNumber: data.phoneNumber || "",
            price: data.price ? String(data.price) : "",
            instagram: data.instagram || "",
            tiktok: data.tiktok || "",
            email: data.email || "",
            specialties: data.specialties || [],
          });
        } else {
          setError("لم يتم العثور على بيانات المطرب");
        }
      } catch (error) {
        console.error("Error fetching singer data:", error);
        setError("حدث خطأ أثناء جلب بيانات المطرب");
      } finally {
        setIsLoading(false);
      }
    };

    if (singerName) {
      fetchSingerData();
    }
  }, [singerName]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSpecialtiesChange = (e) => {
    const { value } = e.target;
    const specialties = value.split(",").map((specialty) => specialty.trim());
    setFormData((prev) => ({
      ...prev,
      specialties,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Reference to the existing singer data
      const singerRef = ref(db, `Singer/${singerName}`);

      // Prepare the updated singer data
      const singerData = {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        price: Number(formData.price),
        instagram: formData.instagram,
        tiktok: formData.tiktok,
        email: formData.email,
        specialties: formData.specialties,
        updatedAt: new Date().toISOString(),
      };

      // Update the singer data
      await set(singerRef, singerData);

      // If the name has changed, update the names list and singer key
      if (formData.name !== singerName) {
        await updateSingerKey(singerName, formData.name, db);
      }

      navigate("/admin");
    } catch (error) {
      console.error("Error updating singer:", error);
      setError("حدث خطأ أثناء تحديث بيانات المطرب. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to update the key in Firebase
  const updateSingerKey = async (oldKey, newKey, db) => {
    try {
      const oldSingerRef = ref(db, `Singer/${oldKey}`);
      const snapshot = await get(oldSingerRef);

      if (snapshot.exists()) {
        const singerData = snapshot.val();

        // Write the data to the new key
        const newSingerRef = ref(db, `Singer/${newKey}`);
        await set(newSingerRef, singerData);

        // Delete the old key
        await remove(oldSingerRef);

        // Update the singer name in SingerNames
        const oldNameRef = ref(db, `SingerNames/${oldKey}`);
        const newNameRef = ref(db, `SingerNames/${newKey}`);
        await Promise.all([
          set(newNameRef, newKey), // Add new name
          remove(oldNameRef), // Remove old name
        ]);

        console.log("Singer key updated successfully");
      } else {
        console.error("Singer data not found");
      }
    } catch (error) {
      console.error("Error updating singer key:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-gray-600">جاري تحميل البيانات...</div>
      </div>
    );
  }

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
              تعديل بيانات المطرب
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
                  readOnly
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
                {isSubmitting ? "جاري التحديث..." : "تحديث البيانات"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSinger;
