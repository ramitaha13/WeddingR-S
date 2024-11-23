import { useState, useEffect } from "react";
import { ArrowRight, Building2, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getDatabase, ref as dbRef, get, set, remove } from "firebase/database";

// Initialize Firebase
const firebaseConfig = {
  databaseURL: "https://booking-appointments-4c1b0-default-rtdb.firebaseio.com",
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const EditHall = () => {
  const navigate = useNavigate();
  const { hallId } = useParams();
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
    capacity: "",
    description: "",
    location: "",
    locationUrl: "",
    phoneNumber: "",
    email: "",
    features: "",
    imageUrl: "",
    instagram: "",
    tiktok: "",
  });

  useEffect(() => {
    const fetchHallData = async () => {
      try {
        const hallRef = dbRef(db, `halls/${hallId}`);
        const snapshot = await get(hallRef);

        if (snapshot.exists()) {
          const hallData = snapshot.val();
          setFormData({
            name: hallData.name || "",
            capacity: hallData.capacity || "",
            description: hallData.description || "",
            location: hallData.location || "",
            locationUrl: hallData.locationUrl || "",
            phoneNumber: hallData.phoneNumber || "",
            email: hallData.email || "",
            features: hallData.features || "",
            imageUrl: hallData.imageUrl || "",
            instagram: hallData.instagram || "",
            tiktok: hallData.tiktok || "",
          });
        } else {
          setError("لم يتم العثور على القاعة");
        }
      } catch (error) {
        console.error("Error fetching hall data:", error);
        setError("حدث خطأ أثناء تحميل بيانات القاعة");
      } finally {
        setIsLoading(false);
      }
    };

    if (hallId) {
      fetchHallData();
    }
  }, [hallId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const newHallKey = formData.name.toLowerCase().replace(/\s+/g, " ");

      const hallData = {
        name: formData.name,
        capacity: Number(formData.capacity),
        description: formData.description,
        phoneNumber: formData.phoneNumber,
        location: formData.location,
        locationUrl: formData.locationUrl,
        email: formData.email,
        features: formData.features,
        imageUrl: formData.imageUrl || "",
        instagram: formData.instagram,
        tiktok: formData.tiktok,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (newHallKey !== hallId) {
        await set(dbRef(db, `halls/${newHallKey}`), hallData);
        await remove(dbRef(db, `halls/${hallId}`));
      } else {
        await set(dbRef(db, `halls/${hallId}`), hallData);
      }

      navigate("/admin");
    } catch (error) {
      console.error("Error updating hall:", error);
      setError("حدث خطأ أثناء تحديث بيانات القاعة. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  const handleBack = () => {
    navigate("/");
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
            <Building2 className="w-8 h-8 text-pink-600 ml-3" />
            <h1 className="text-2xl font-bold text-gray-800">
              تعديل بيانات القاعة
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
                  اسم القاعة
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
                  السعة (عدد الأشخاص)
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الموقع
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط الموقع
                </label>
                <input
                  type="url"
                  name="locationUrl"
                  value={formData.locationUrl}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف القاعة
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المميزات
              </label>
              <textarea
                name="features"
                value={formData.features}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="مثال: موقف سيارات، خدمة ضيافة، إضاءة خاصة..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="example@domain.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="05xxxxxxxx"
                pattern="[0-9]{10}"
                title="يرجى إدخال رقم هاتف صحيح مكون من 10 أرقام"
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

            <button
              type="submit"
              className={`w-full p-3 text-white rounded-lg ${
                isSubmitting ? "bg-gray-400" : "bg-pink-600 hover:bg-pink-700"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditHall;
