import { useState, useEffect } from "react";
import { LogIn, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const LanguageSelector = ({ onLanguageChange, translations }) => {
  return (
    <div className="relative group">
      <button className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition-colors">
        <Globe className="w-5 h-5" />
      </button>
      <div className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
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
      login: "تسجيل الدخول",
      title: "دليل قاعات الأفراح",
      heroTitle: "دليلك الشامل لقاعات الأفراح والمطربين",
      heroDescription:
        "استكشف أفضل قاعات الأفراح والمطربين في المنطقة. نقدم لكم معلومات تفصيلية عن القاعات، الأسعار، والخدمات المتوفرة لجعل مناسبتكم لا تُنسى.",
      luxuryHalls: "قاعات فاخرة",
      hallsDescription:
        "استعرض مجموعة متنوعة من القاعات المميزة بمختلف السعات والتصاميم",
      professionalSingers: "مطربون محترفون",
      singersDescription:
        "تعرف على نخبة من المطربين المحترفين وأنواع الموسيقى المتوفرة",
      gallery: "معرض الصور",
      galleryDescription: "شاهد صور حية للقاعات والمناسبات السابقة",
      joinFamily: "كن جزءاً من عائلتنا",
      contactUs: "نرحب بانضمامك إلى شبكتنا المتميزة. للتواصل معنا:",
    },
    he: {
      home: "דף הבית",
      halls: "אולמות",
      singers: "זמרים",
      login: "התחברות",
      title: "מדריך אולמות אירועים",
      heroTitle: "המדריך המקיף שלך לאולמות אירועים וזמרים",
      heroDescription:
        "גלה את אולמות האירועים והזמרים הטובים ביותר באזור. אנו מספקים מידע מפורט על האולמות, מחירים ושירותים זמינים כדי להפוך את האירוע שלך לבלתי נשכח.",
      luxuryHalls: "אולמות יוקרה",
      hallsDescription: "סקור מגוון של אולמות ייחודיים בגדלים ועיצובים שונים",
      professionalSingers: "זמרים מקצועיים",
      singersDescription:
        "הכר את מיטב הזמרים המקצועיים וסגנונות המוזיקה הזמינים",
      gallery: "גלריה",
      galleryDescription: "צפה בתמונות חיות של האולמות ואירועים קודמים",
      joinFamily: "הצטרף למשפחה שלנו",
      contactUs: "אנו מזמינים אותך להצטרף לרשת המצוינת שלנו. ליצירת קשר:",
    },
    en: {
      home: "Home",
      halls: "Halls",
      singers: "Singers",
      login: "Login",
      title: "Wedding Halls Guide",
      heroTitle: "Your Complete Guide to Wedding Halls and Singers",
      heroDescription:
        "Explore the best wedding halls and singers in the area. We provide detailed information about venues, prices, and available services to make your event unforgettable.",
      luxuryHalls: "Luxury Halls",
      hallsDescription:
        "Browse a variety of distinctive halls with different capacities and designs",
      professionalSingers: "Professional Singers",
      singersDescription:
        "Meet our elite professional singers and explore available music styles",
      gallery: "Photo Gallery",
      galleryDescription: "View live photos of halls and previous events",
      joinFamily: "Join Our Family",
      contactUs:
        "We welcome you to join our distinguished network. Contact us:",
    },
  };

  const [currentLang, setCurrentLang] = useState("ar");
  const t = translations[currentLang];
  const isRTL = currentLang === "ar" || currentLang === "he";

  return { t, currentLang, setCurrentLang, isRTL, translations };
};

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedMenuItem, setSelectedMenuItem] = useState("home");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, setCurrentLang, isRTL, translations } = useTranslations();

  const images = [
    "https://firebasestorage.googleapis.com/v0/b/booking-appointments-4c1b0.appspot.com/o/halls%2FIMG_0552.WEBP?alt=media&token=80b9d980-11e2-4c98-b846-83854265e8d2",
    "https://firebasestorage.googleapis.com/v0/b/booking-appointments-4c1b0.appspot.com/o/halls%2FIMG_0285.jpg?alt=media&token=35346bdb-6acb-4f88-899c-3e24f1adaad9",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1,
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  const menuItems = [
    { id: 1, name: "home", icon: "🏠" },
    { id: 2, name: "halls", icon: "🏰" },
    { id: 3, name: "singers", icon: "🎤" },
    { id: 4, name: "call", icon: "📞", text: "تواصل معنا" },
  ];

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
      case "call":
        navigate("/CallUs");
        break;
    }
  };

  const handleLogin = () => {
    window.location.href = "/login";
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
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Sidebar - Desktop and Mobile */}
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
        {/* Logo Area */}
        <div className="h-24 bg-gradient-to-r from-pink-600 to-pink-500 flex items-center justify-center rounded-bl-3xl">
          <h1 className="text-white text-xl lg:text-2xl font-bold">
            {t.title}
          </h1>
        </div>

        {/* Menu Items */}
        <nav className="mt-8">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMenuItemClick(item.name)}
              className={`group cursor-pointer mx-4 mb-2 rounded-xl overflow-hidden transition-all duration-300
                ${selectedMenuItem === item.name ? "bg-pink-50" : "hover:bg-pink-50"}`}
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
                  {item.text || t[item.name]}
                </span>
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div
        className={`${isRTL ? "lg:mr-72" : "lg:ml-72"} flex-1 transition-all duration-300`}
      >
        {/* Header */}
        <header className="h-24 bg-white shadow-lg flex items-center justify-between px-4 lg:px-8">
          <LanguageSelector
            onLanguageChange={setCurrentLang}
            translations={translations}
          />
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
          {/* Hero Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-12 mb-8 lg:mb-12 transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
              <div className="w-full lg:w-1/2">
                <h1 className="text-3xl lg:text-5xl font-bold text-pink-900 leading-tight mb-6 lg:mb-8">
                  {t.heroTitle}
                </h1>
                <p className="text-lg lg:text-xl text-gray-700 leading-relaxed mb-6 lg:mb-8">
                  {t.heroDescription}
                </p>
              </div>
              <div className="w-full lg:w-1/2 relative">
                {/* Image Carousel */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="absolute w-full h-full transition-transform duration-500 ease-in-out"
                      style={{
                        transform: `translateX(${(index - currentIndex) * 100}%)`,
                      }}
                    >
                      <img
                        src={image}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  ))}

                  {/* Navigation dots */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                          currentIndex === index ? "bg-white" : "bg-white/50"
                        }`}
                        onClick={() => setCurrentIndex(index)}
                      />
                    ))}
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -bottom-4 -right-4 w-24 lg:w-32 h-24 lg:h-32 bg-pink-100 rounded-full -z-10 opacity-50 blur-lg"></div>
                <div className="absolute -top-4 -left-4 w-20 lg:w-24 h-20 lg:h-24 bg-pink-200 rounded-full -z-10 opacity-50 blur-lg"></div>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 mb-8 lg:mb-12">
            {[
              {
                icon: "🏰",
                title: t.luxuryHalls,
                description: t.hallsDescription,
              },
              {
                icon: "🎤",
                title: t.professionalSingers,
                description: t.singersDescription,
              },
              {
                icon: "📸",
                title: t.gallery,
                description: t.galleryDescription,
              },
            ].map((card, index) => (
              <div
                key={index}
                className="bg-white p-6 lg:p-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer"
              >
                <div className="text-4xl lg:text-5xl mb-4 lg:mb-6 transform transition-transform duration-300 hover:scale-110">
                  {card.icon}
                </div>
                <h3 className="text-xl lg:text-2xl font-semibold mb-3 lg:mb-4 text-pink-900">
                  {card.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-base lg:text-lg">
                  {card.description}
                </p>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-12 mb-8 lg:mb-12">
            <div className="text-center">
              <h2 className="text-2xl lg:text-3xl font-bold text-pink-900 mb-4 lg:mb-6">
                {t.joinFamily}
              </h2>
              <p className="text-lg lg:text-xl text-gray-700 mb-6 lg:mb-8 leading-relaxed">
                {t.contactUs}
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xl lg:text-2xl">📱</span>
                  <a
                    href="tel:0537333343"
                    className="text-lg lg:text-xl text-pink-600 hover:text-pink-700 transition-colors"
                  >
                    0537333343
                  </a>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xl lg:text-2xl">📧</span>
                  <a
                    href="mailto:wedding.rs196@gmail.com"
                    className="text-lg lg:text-xl text-pink-600 hover:text-pink-700 transition-colors"
                  >
                    wedding.rs196@gmail.com
                  </a>
                </div>
              </div>
            </div>
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

export default HomePage;
