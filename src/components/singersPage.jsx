import { useState, useEffect } from "react";
import { LogIn, Search, Share2, Check, Globe } from "lucide-react";
import { getDatabase, ref, onValue } from "firebase/database";
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
      searchTitle: "ابحث عن المطرب المناسب",
      searchPlaceholder: "ابحث عن مطرب...",
      checkDate: "تحقق من التاريخ",
      specialties: "التخصصات",
      bookNow: "احجز الآن",
      currency: "شيكل",
    },
    he: {
      home: "דף הבית",
      halls: "אולמות",
      singers: "זמרים",
      contactUs: "צור קשר",
      login: "התחברות",
      share: "שתף",
      copied: "הועתק!",
      searchTitle: "חפש את הזמר המתאים",
      searchPlaceholder: "חפש זמר...",
      checkDate: "בדוק תאריך",
      specialties: "התמחויות",
      bookNow: "הזמן עכשיו",
      currency: "שקל",
    },
    en: {
      home: "Home",
      halls: "Halls",
      singers: "Singers",
      contactUs: "Contact Us",
      login: "Login",
      share: "Share",
      copied: "Copied!",
      searchTitle: "Find the Right Singer",
      searchPlaceholder: "Search for a singer...",
      checkDate: "Check Date",
      specialties: "Specialties",
      bookNow: "Book Now",
      currency: "ILS",
    },
  };

  const [currentLang, setCurrentLang] = useState("ar");
  const t = translations[currentLang];
  const isRTL = currentLang === "ar" || currentLang === "he";

  return { t, currentLang, setCurrentLang, isRTL, translations };
};

const SingersPage = () => {
  const navigate = useNavigate();
  const [singers, setSingers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMenuItem, setSelectedMenuItem] = useState("singers");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { t, setCurrentLang, isRTL, translations } = useTranslations();

  const menuItems = [
    { id: 1, name: "home", icon: "🏠" },
    { id: 2, name: "halls", icon: "🏰" },
    { id: 3, name: "singers", icon: "🎤" },
    { id: 4, name: "contactUs", icon: "📞" },
  ];

  useEffect(() => {
    const db = getDatabase();
    const singersRef = ref(db, "Singer");

    const unsubscribe = onValue(singersRef, (snapshot) => {
      const singersData = [];
      snapshot.forEach((childSnapshot) => {
        const singerId = childSnapshot.key;
        const singerData = childSnapshot.val();

        singersData.push({
          id: singerId,
          name: singerData.name || "",
          description: singerData.description || "",
          genre: singerData.genre || "",
          email: singerData.email || "",
          price: singerData.price || "",
          rating: singerData.rating || 0,
          experience: singerData.experience || "",
          imageUrl: singerData.imageUrl || null,
          specialties: singerData.specialties
            ? singerData.specialties.split(",")
            : [],
          instagram: singerData.instagram || "",
          tiktok: singerData.tiktok || "",
        });
      });
      setSingers(singersData);
    });

    return () => unsubscribe();
  }, []);

  const handleShareLink = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "دليل المطربين",
          text: "استكشف أفضل المطربين في المنطقة",
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
      case "contactUs":
        navigate("/CallUs");
        break;
    }
  };

  const handleLogin = () => {
    window.location.href = "/login";
  };

  const handleBooking = (singer) => {
    navigate("/bookingSinger", { state: { singerData: singer } });
  };

  const handleImageError = (e) => {
    e.target.src = "/api/placeholder/400/320";
  };

  const filteredSingers = singers.filter((singer) => {
    return singer.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCheckDate = () => {
    navigate("/checkTheDateOfSinger");
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
            {t.singers}
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
          {/* Search Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mb-8 lg:mb-12 transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl lg:text-3xl font-bold text-pink-900">
                {t.searchTitle}
              </h2>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[250px]">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 pr-10 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                </div>
              </div>
              <button
                onClick={handleCheckDate}
                className="mt-4 px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors"
              >
                {t.checkDate}
              </button>
            </div>
          </div>

          {/* Singers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 mb-8 lg:mb-12">
            {filteredSingers.map((singer) => (
              <div
                key={singer.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="h-48 lg:h-64 bg-gray-200">
                  <img
                    src={singer.imageUrl || "/api/placeholder/400/320"}
                    alt={singer.name}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </div>
                <div className="p-4 lg:p-6">
                  <h3 className="text-xl lg:text-2xl font-semibold mb-2 text-pink-900">
                    {singer.name}
                  </h3>
                  <p className="text-sm lg:text-base text-gray-600 mb-4">
                    {singer.description}
                  </p>
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">{t.specialties}:</h4>
                    <div className="flex flex-wrap gap-2">
                      {singer.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="bg-pink-100 text-pink-800 text-xs lg:text-sm px-2 lg:px-3 py-1 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-4 items-center justify-between">
                    <span className="text-base lg:text-lg font-semibold text-pink-600">
                      {singer.price} {t.currency}
                    </span>
                    <button
                      onClick={() => handleBooking(singer)}
                      className="bg-pink-500 text-white px-4 lg:px-6 py-2 rounded-full hover:bg-pink-600 transition-all duration-300 transform hover:scale-105 text-sm lg:text-base"
                    >
                      {t.bookNow}
                    </button>
                    <div className="flex space-x-2">
                      {singer.instagram && (
                        <a
                          href={singer.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-6 h-6 lg:w-8 lg:h-8"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-full h-full text-pink-500 hover:text-pink-600 transition-colors duration-300"
                          >
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.98-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        </a>
                      )}
                      {singer.tiktok && (
                        <a
                          href={singer.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-6 h-6 lg:w-8 lg:h-8"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-full h-full text-pink-500 hover:text-pink-600 transition-colors duration-300"
                          >
                            <path d="M12 2a10 10 0 0 0 0 20 10 10 0 0 0 0-20zm2.5 14.7c-1.5 0-3-.2-4.5-.6v-6h2v5c1 .3 2 .5 3 .5 2 0 3-1 3-3s-1-3-3-3h-1V4h2c4 0 6 2 6 5s-2 6-6 6z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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

export default SingersPage;
