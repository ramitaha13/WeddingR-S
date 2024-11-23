import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Changed this import
import { getDatabase, ref, set } from "firebase/database";
import {
  User,
  Mail,
  Building,
  Phone,
  Save,
  ArrowRight,
  UserPlus,
  Eye,
  EyeOff,
  Lock,
  AlertCircle,
} from "lucide-react";

const CreateAccountPage = () => {
  const navigate = useNavigate(); // Add this hook
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    hallName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
      setIsAdmin(false);
    } else {
      setIsAdmin(true);
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (e.target.name === "password" || e.target.name === "confirmPassword") {
      setPasswordError("");
    }
  };

  const validatePasswords = () => {
    if (formData.password.length < 8) {
      setPasswordError("يجب أن تتكون كلمة المرور من 8 أحرف على الأقل");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("كلمات المرور غير متطابقة");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswords()) {
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const db = getDatabase();
      const userRef = ref(db, `users/${formData.username}`);

      const userData = {
        username: formData.username,
        email: formData.email,
        hallName: formData.hallName,
        phone: formData.phone,
        password: formData.password,
      };

      await set(userRef, userData);

      setSuccess("تم إنشاء الحساب بنجاح");
      setFormData({
        username: "",
        email: "",
        hallName: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError("حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    window.location.href = "/admin";
  };

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleBacknotadmin = () => {
    navigate("/"); // Now this will work correctly
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
              onClick={handleBacknotadmin}
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
    <div dir="rtl" className="min-h-screen bg-gray-100 flex">
      {/* Right Sidebar */}
      <div className="w-64 bg-white shadow-lg fixed right-0 h-full">
        <div className="h-16 bg-pink-600 flex items-center justify-center">
          <h1 className="text-white text-xl font-bold">قاعات الأفراح</h1>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            إنشاء حساب جديد
          </h2>
          <p className="text-gray-600 mb-4">
            قم بإنشاء حساب جديد للوصول إلى خدمات حجز قاعات الأفراح وإدارة
            حجوزاتك.
          </p>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <span className="text-pink-500 ml-2">•</span>
              حجز القاعات
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-pink-500 ml-2">•</span>
              إدارة الحجوزات
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-pink-500 ml-2">•</span>
              متابعة الطلبات
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mr-64 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <button
            onClick={handleBack}
            className="mb-6 flex items-center text-gray-600 hover:text-pink-600 transition-colors duration-200"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            العودة للرئيسية
          </button>

          <div className="bg-white rounded-lg shadow-lg p-8">
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                {success}
              </div>
            )}

            <div className="text-center mb-8">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-pink-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                إنشاء حساب جديد
              </h2>
              <p className="text-gray-600 mt-2">
                أدخل بياناتك لإنشاء حساب جديد
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {passwordError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="block text-gray-700 font-medium"
                >
                  اسم المستخدم
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200"
                    placeholder="أدخل اسم المستخدم"
                    required
                    disabled={isLoading}
                  />
                  <User className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-gray-700 font-medium"
                >
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200"
                    placeholder="أدخل البريد الإلكتروني"
                    required
                    disabled={isLoading}
                  />
                  <Mail className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-gray-700 font-medium"
                >
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200"
                    placeholder="أدخل كلمة المرور"
                    required
                    disabled={isLoading}
                    minLength={8}
                  />
                  <Lock className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("password")}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-gray-700 font-medium"
                >
                  تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200"
                    placeholder="أدخل تأكيد كلمة المرور"
                    required
                    disabled={isLoading}
                    minLength={8}
                  />
                  <Lock className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirm")}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="hallName"
                  className="block text-gray-700 font-medium"
                >
                  اسم الزبون
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="hallName"
                    name="hallName"
                    value={formData.hallName}
                    onChange={handleInputChange}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200"
                    placeholder="أدخل اسم الزبون"
                    required
                    disabled={isLoading}
                  />
                  <Building className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="block text-gray-700 font-medium"
                >
                  رقم الهاتف
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500  focus:border-pink-500 transition-colors duration-200"
                    placeholder="أدخل رقم الهاتف"
                    required
                    disabled={isLoading}
                  />
                  <Phone className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition-colors duration-200 flex items-center justify-center disabled:bg-pink-300"
                disabled={isLoading}
              >
                <Save className="w-5 h-5 ml-2" />
                {isLoading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountPage;
