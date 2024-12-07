import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

const translations = {
  ar: {
    title: "قاعات الأفراح",
    welcome: "مرحباً بكم",
    description:
      "قم بتسجيل الدخول للوصول إلى لوحة التحكم الخاصة بك وإدارة حجوزات قاعات الأفراح.",
    manageBookings: "إدارة الحجوزات",
    viewReports: "عرض التقارير",
    manageHalls: "إدارة القاعات",
    backToHome: "العودة للرئيسية",
    loginTitle: "تسجيل الدخول",
    loginSubtitle: "قم بتسجيل الدخول لإدارة حساب قاعات الأفراح",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    enterUsername: "أدخل اسم المستخدم",
    enterPassword: "أدخل كلمة المرور",
    loginButton: "تسجيل الدخول",
    loggingIn: "جاري تسجيل الدخول...",
    connectionError: "خطأ في الاتصال",
    invalidCredentials: "اسم المستخدم أو كلمة المرور غير صحيحة",
    loginError: "حدث خطأ في تسجيل الدخول. يرجى المحاولة مرة أخرى",
  },
  en: {
    title: "Wedding Halls",
    welcome: "Welcome",
    description:
      "Login to access your dashboard and manage wedding hall bookings.",
    manageBookings: "Manage Bookings",
    viewReports: "View Reports",
    manageHalls: "Manage Halls",
    backToHome: "Back to Home",
    loginTitle: "Login",
    loginSubtitle: "Sign in to manage your wedding halls account",
    username: "Username",
    password: "Password",
    enterUsername: "Enter username",
    enterPassword: "Enter password",
    loginButton: "Login",
    loggingIn: "Logging in...",
    connectionError: "Connection error",
    invalidCredentials: "Invalid username or password",
    loginError: "Login error. Please try again",
  },
  he: {
    title: "אולמות חתונה",
    welcome: "ברוכים הבאים",
    description: "התחבר כדי לגשת ללוח הבקרה שלך ולנהל הזמנות אולם חתונות.",
    manageBookings: "ניהול הזמנות",
    viewReports: "צפה בדוחות",
    manageHalls: "ניהול אולמות",
    backToHome: "חזרה לדף הבית",
    loginTitle: "התחברות",
    loginSubtitle: "התחבר כדי לנהל את חשבון אולמות החתונה שלך",
    username: "שם משתמש",
    password: "סיסמה",
    enterUsername: "הזן שם משתמש",
    enterPassword: "הזן סיסמה",
    loginButton: "התחברות",
    loggingIn: "מתחבר...",
    connectionError: "שגיאת חיבור",
    invalidCredentials: "שם משתמש או סיסמה לא חוקיים",
    loginError: "שגיאת התחברות. אנא נסה שוב",
  },
};

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("ar");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const ADMIN_USERNAME = "admin";
  const ADMIN_PASSWORD = "AdminA123";

  const t = translations[language];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem("userRole", "admin");
        localStorage.setItem(
          "userData",
          JSON.stringify({
            username: ADMIN_USERNAME,
            role: "admin",
          }),
        );
        window.location.href = "/admin";
        return;
      }

      const response = await fetch(
        "https://booking-appointments-4c1b0-default-rtdb.firebaseio.com/users.json",
      );

      if (!response.ok) {
        throw new Error(t.connectionError);
      }

      const users = await response.json();
      let foundUser = null;
      let userKey = null;

      Object.entries(users).forEach(([key, userData]) => {
        if (
          userData &&
          userData.username === username &&
          userData.password === password
        ) {
          foundUser = userData;
          userKey = key;
        }
      });

      if (foundUser) {
        localStorage.setItem("userRole", userKey);
        localStorage.setItem(
          "userData",
          JSON.stringify({
            username: foundUser.username,
            role: userKey,
            hallName: foundUser.hallName || "",
            email: foundUser.email || "",
            phone: foundUser.phone || "",
          }),
        );
        window.location.href = `/Login/${foundUser.username}`;
      } else {
        setError(t.invalidCredentials);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(t.loginError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    window.location.href = "/home";
  };

  const getDirectionClass = () => {
    return language === "ar" || language === "he" ? "rtl" : "ltr";
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div dir={getDirectionClass()} className="min-h-screen bg-gray-100">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-pink-600 text-white rounded-md"
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 ${language === "en" ? "left-0" : "right-0"} h-full w-64 bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out z-40
          ${isSidebarOpen ? "translate-x-0" : language === "en" ? "-translate-x-full" : "translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="h-16 bg-pink-600 flex items-center justify-center">
          <h1 className="text-white text-xl font-bold">{t.title}</h1>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{t.welcome}</h2>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="p-2 border rounded-md"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
              <option value="he">עברית</option>
            </select>
          </div>
          <p className="text-gray-600 mb-4">{t.description}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className={`md:${language === "en" ? "ml-64" : "mr-64"} p-6`}>
        <div className="flex min-h-screen items-center justify-center">
          <div className="w-full max-w-md">
            <button
              onClick={handleBack}
              className="mb-6 flex items-center text-gray-600 hover:text-pink-600 transition-colors duration-200"
            >
              <ArrowRight className="w-5 h-5 mx-2" />
              {t.backToHome}
            </button>

            <div className="bg-white rounded-lg shadow-lg p-8">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    {t.username}
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder={t.enterUsername}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">
                    {t.password}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder={t.enterPassword}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 bg-pink-600 text-white rounded-md"
                >
                  {isLoading ? t.loggingIn : t.loginButton}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
