import { useState } from "react";
import { LogIn, Menu, X, Share2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ContactUsScreen = () => {
  const navigate = useNavigate();
  const phoneNumber = "0537333343";
  const emailAddress = "wedding.rs196@gmail.com";
  const [selectedMenuItem, setSelectedMenuItem] = useState("تواصل معنا");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const menuItems = [
    { id: 1, name: "الرئيسية", icon: "🏠" },
    { id: 2, name: "القاعات", icon: "🏰" },
    { id: 3, name: "المطربين", icon: "🎤" },
    { id: 4, name: "تواصل معنا", icon: "📞" },
  ];

  const handleShareLink = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "تواصل معنا",
          text: "تواصل معنا للمزيد من المعلومات",
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  const handleMenuItemClick = (itemName) => {
    setSelectedMenuItem(itemName);
    setIsMobileMenuOpen(false);
    switch (itemName) {
      case "الرئيسية":
        navigate("/");
        break;
      case "القاعات":
        navigate("/contact");
        break;
      case "المطربين":
        navigate("/singersPage");
        break;
    }
  };

  const handleLogin = () => {
    window.location.href = "/login";
  };

  const handleCallPress = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleEmailPress = () => {
    window.location.href = `mailto:${emailAddress}`;
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-pink-50 to-white"
    >
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-pink-600 text-white"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Sidebar - Desktop and Mobile */}
      <div
        className={`${
          isMobileMenuOpen
            ? "translate-x-0"
            : "translate-x-full lg:translate-x-0"
        } transition-transform duration-300 w-72 bg-white shadow-xl fixed right-0 h-full z-40 lg:z-30`}
      >
        <div className="h-24 bg-gradient-to-r from-pink-600 to-pink-500 flex items-center justify-center rounded-bl-3xl">
          <h1 className="text-white text-xl lg:text-2xl font-bold">
            تواصل معنا
          </h1>
        </div>
        <nav className="mt-8">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMenuItemClick(item.name)}
              className={`group cursor-pointer mx-4 mb-2 rounded-xl overflow-hidden transition-all duration-300 ${
                selectedMenuItem === item.name
                  ? "bg-pink-50"
                  : "hover:bg-pink-50"
              }`}
            >
              <div className="flex items-center p-4 space-x-4 space-x-reverse">
                <div
                  className={`text-2xl transition-transform duration-300 group-hover:scale-110 ${
                    selectedMenuItem === item.name ? "scale-110" : ""
                  }`}
                >
                  {item.icon}
                </div>
                <span
                  className={`font-medium transition-colors duration-300 ${
                    selectedMenuItem === item.name
                      ? "text-pink-600"
                      : "text-gray-600"
                  }`}
                >
                  {item.name}
                </span>
              </div>
            </div>
          ))}

          {/* Share Button */}
          <div className="mx-4 mb-2 pt-4 border-t border-gray-200">
            <button
              onClick={handleShareLink}
              className="w-full group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 hover:bg-pink-50 p-4 flex items-center gap-3"
            >
              {copied ? (
                <Check className="w-5 h-5 text-pink-600" />
              ) : (
                <Share2 className="w-5 h-5 text-pink-600" />
              )}
              <span className="font-medium text-gray-600 group-hover:text-pink-600 transition-colors">
                {copied ? "تم النسخ!" : "مشاركة"}
              </span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="lg:mr-72 flex-1 transition-all duration-300">
        {/* Header */}
        <header className="h-24 bg-white shadow-lg flex items-center justify-end px-4 lg:px-8">
          <div
            onClick={handleLogin}
            className="flex items-center gap-3 text-pink-600 hover:text-pink-700 cursor-pointer group transition-all duration-300"
          >
            <span className="text-base lg:text-lg">تسجيل الدخول</span>
            <LogIn className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 lg:p-8">
          {/* Contact Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mb-8 transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl lg:text-3xl font-bold text-pink-900">
                كيف يمكننا مساعدتك؟
              </h2>
              <p className="text-gray-600">
                نحن هنا دائمًا للمساعدة. يمكنك الاتصال بنا أو إرسال بريد
                إلكتروني إذا كان لديك أي استفسارات أو طلبات.
              </p>
            </div>
          </div>

          {/* Contact Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Phone Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <button
                onClick={handleCallPress}
                className="w-full p-6 text-right"
              >
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-bold text-pink-600 mb-2">
                  اتصل بنا
                </h3>
                <p className="text-gray-600">{phoneNumber}</p>
              </button>
            </div>

            {/* Email Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <button
                onClick={handleEmailPress}
                className="w-full p-6 text-right"
              >
                <div className="text-4xl mb-4">📧</div>
                <h3 className="text-xl font-bold text-pink-600 mb-2">راسلنا</h3>
                <p className="text-gray-600">{emailAddress}</p>
              </button>
            </div>
          </div>

          {/* Note Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
            <h3 className="text-xl font-bold text-pink-600 mb-4 text-right">
              تذكير
            </h3>
            <p className="text-gray-600 text-right leading-relaxed">
              نحن نستجيب لجميع الرسائل والمكالمات في أسرع وقت ممكن. نقدر تواصلك
              ونسعى دائمًا لتقديم أفضل خدمة ممكنة.
            </p>
          </div>
        </main>
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default ContactUsScreen;
