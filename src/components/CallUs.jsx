import { useState } from "react";
import { LogIn, Menu, X, Share2, Check, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const LanguageSelector = ({ onLanguageChange, translations }) => {
  return (
    <div className="relative group">
      <button className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition-colors">
        <Globe className="w-5 h-5" />
        <span className="text-sm">Language</span>
      </button>
      <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
        {Object.keys(translations).map((lang) => (
          <button
            key={lang}
            onClick={() => onLanguageChange(lang)}
            className="block w-full px-4 py-2 text-left hover:bg-pink-50 transition-colors"
          >
            {lang === "ar" ? "العربية" : lang === "he" ? "עברית" : "English"}
          </button>
        ))}
      </div>
    </div>
  );
};

LanguageSelector.propTypes = {
  onLanguageChange: PropTypes.func.isRequired,
  translations: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string))
    .isRequired,
};

const useTranslations = () => {
  const translations = {
    ar: {
      home: "الرئيسية",
      halls: "القاعات",
      singers: "المطربين",
      contactUs: "تواصل معنا",
      login: "تسجيل الدخول",
      share: "مشاركة",
      copied: "تم النسخ!",
      title: "تواصل معنا",
      howCanWeHelp: "كيف يمكننا مساعدتك؟",
      helpText:
        "نحن هنا دائمًا للمساعدة. يمكنك الاتصال بنا أو إرسال بريد إلكتروني إذا كان لديك أي استفسارات أو طلبات.",
      callUs: "اتصل بنا",
      emailUs: "راسلنا",
      reminder: "تذكير",
      reminderText:
        "نحن نستجيب لجميع الرسائل والمكالمات في أسرع وقت ممكن. نقدر تواصلك ونسعى دائمًا لتقديم أفضل خدمة ممكنة.",
    },
    he: {
      home: "דף הבית",
      halls: "אולמות",
      singers: "זמרים",
      contactUs: "צור קשר",
      login: "התחברות",
      share: "שתף",
      copied: "הועתק!",
      title: "צור קשר",
      howCanWeHelp: "איך נוכל לעזור?",
      helpText:
        'אנחנו כאן תמיד לעזור. ניתן להתקשר אלינו או לשלוח דוא"ל בכל שאלה או בקשה.',
      callUs: "התקשר אלינו",
      emailUs: "שלח לנו מייל",
      reminder: "תזכורת",
      reminderText:
        "אנו מגיבים לכל ההודעות והשיחות בהקדם האפשרי. אנו מעריכים את פנייתך ותמיד שואפים לספק את השירות הטוב ביותר.",
    },
    en: {
      home: "Home",
      halls: "Halls",
      singers: "Singers",
      contactUs: "Contact Us",
      login: "Login",
      share: "Share",
      copied: "Copied!",
      title: "Contact Us",
      howCanWeHelp: "How Can We Help?",
      helpText:
        "We're always here to help. You can call us or send an email if you have any questions or requests.",
      callUs: "Call Us",
      emailUs: "Email Us",
      reminder: "Reminder",
      reminderText:
        "We respond to all messages and calls as quickly as possible. We value your communication and always strive to provide the best possible service.",
    },
  };

  const [currentLang, setCurrentLang] = useState("ar");
  const t = translations[currentLang];
  const isRTL = currentLang === "ar" || currentLang === "he";

  return { t, currentLang, setCurrentLang, isRTL, translations };
};

const ContactUsScreen = () => {
  const navigate = useNavigate();
  const phoneNumber = "0537333343";
  const emailAddress = "wedding.rs196@gmail.com";
  const [selectedMenuItem, setSelectedMenuItem] = useState("contactUs");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { t, setCurrentLang, isRTL, translations } = useTranslations();

  const menuItems = [
    { id: 1, name: "home", icon: "🏠" },
    { id: 2, name: "halls", icon: "🏰" },
    { id: 3, name: "singers", icon: "🎤" },
    { id: 4, name: "contactUs", icon: "📞" },
  ];

  const handleShareLink = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: t.title,
          text: t.helpText,
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
      case "home":
        navigate("/");
        break;
      case "halls":
        navigate("/contact");
        break;
      case "singers":
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
      dir={isRTL ? "rtl" : "ltr"}
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

      {/* Sidebar */}
      <div
        className={`${
          isMobileMenuOpen
            ? "translate-x-0"
            : isRTL
              ? "translate-x-full lg:translate-x-0"
              : "-translate-x-full lg:translate-x-0"
        } transition-transform duration-300 w-72 bg-white shadow-xl fixed ${
          isRTL ? "right-0" : "left-0"
        } h-full z-40 lg:z-30`}
      >
        <div className="h-24 bg-gradient-to-r from-pink-600 to-pink-500 flex items-center justify-center rounded-bl-3xl">
          <h1 className="text-white text-xl lg:text-2xl font-bold">
            {t.title}
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
                  {t[item.name]}
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
                {copied ? t.copied : t.share}
              </span>
            </button>
          </div>

          {/* Language Selector */}
          <div className="mx-4 mb-2 pt-4 border-t border-gray-200">
            <div className="p-4">
              <LanguageSelector
                onLanguageChange={setCurrentLang}
                translations={translations}
              />
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div
        className={`${isRTL ? "lg:mr-72" : "lg:ml-72"} flex-1 transition-all duration-300`}
      >
        {/* Header */}
        <header className="h-24 bg-white shadow-lg flex items-center justify-end px-4 lg:px-8">
          <div
            onClick={handleLogin}
            className="flex items-center gap-3 text-pink-600 hover:text-pink-700 cursor-pointer group transition-all duration-300"
          >
            <span className="text-base lg:text-lg">{t.login}</span>
            <LogIn className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 lg:p-8">
          {/* Contact Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mb-8 transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl lg:text-3xl font-bold text-pink-900">
                {t.howCanWeHelp}
              </h2>
              <p className="text-gray-600">{t.helpText}</p>
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
                  {t.callUs}
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
                <h3 className="text-xl font-bold text-pink-600 mb-2">
                  {t.emailUs}
                </h3>
                <p className="text-gray-600">{emailAddress}</p>
              </button>
            </div>
          </div>

          {/* Note Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
            <h3 className="text-xl font-bold text-pink-600 mb-4 text-right">
              {t.reminder}
            </h3>
            <p className="text-gray-600 text-right leading-relaxed">
              {t.reminderText}
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
