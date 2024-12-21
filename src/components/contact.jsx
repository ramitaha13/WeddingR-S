import { useState, useEffect } from "react";
import {
  Users,
  MapPin,
  LogIn,
  Calendar,
  Search,
  Share2,
  Check,
  Globe,
} from "lucide-react";
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
      title: "دليل قاعات الأفراح",
      searchTitle: "ابحث عن قاعتك المثالية",
      searchPlaceholder: "ابحث عن قاعة...",
      allNames: "جميع الأسماء",
      allCapacities: "جميع السعات",
      capacity: "السعة",
      guest: "ضيف",
      features: "المميزات",
      bookNow: "احجز الآن",
      checkDate: "تحقق من التاريخ",
      upTo500: "حتى 500 ضيف",
      from500to800: "500 - 800 ضيف",
      moreThan800: "أكثر من 800 ضيف",
    },
    he: {
      home: "דף הבית",
      halls: "אולמות",
      singers: "זמרים",
      contactUs: "צור קשר",
      login: "התחברות",
      share: "שתף",
      copied: "הועתק!",
      title: "מדריך אולמות אירועים",
      searchTitle: "חפש את האולם האידיאלי שלך",
      searchPlaceholder: "חפש אולם...",
      allNames: "כל השמות",
      allCapacities: "כל הקיבולות",
      capacity: "קיבולת",
      guest: "אורחים",
      features: "מאפיינים",
      bookNow: "הזמן עכשיו",
      checkDate: "בדוק תאריך",
      upTo500: "עד 500 אורחים",
      from500to800: "500 - 800 אורחים",
      moreThan800: "מעל 800 אורחים",
    },
    en: {
      home: "Home",
      halls: "Halls",
      singers: "Singers",
      contactUs: "Contact Us",
      login: "Login",
      share: "Share",
      copied: "Copied!",
      title: "Wedding Halls Guide",
      searchTitle: "Find Your Perfect Hall",
      searchPlaceholder: "Search for a hall...",
      allNames: "All Names",
      allCapacities: "All Capacities",
      capacity: "Capacity",
      guest: "guests",
      features: "Features",
      bookNow: "Book Now",
      checkDate: "Check Date",
      upTo500: "Up to 500 guests",
      from500to800: "500 - 800 guests",
      moreThan800: "More than 800 guests",
    },
  };

  const [currentLang, setCurrentLang] = useState("ar");
  const t = translations[currentLang];
  const isRTL = currentLang === "ar" || currentLang === "he";

  return { t, currentLang, setCurrentLang, isRTL, translations };
};

const HallsPage = () => {
  const navigate = useNavigate();
  const [weddingHalls, setWeddingHalls] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedName, setSelectedName] = useState("all");
  const [selectedCapacity, setSelectedCapacity] = useState("all");
  const [selectedMenuItem, setSelectedMenuItem] = useState("halls");
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
    const hallsRef = ref(db, "halls");

    const unsubscribe = onValue(hallsRef, (snapshot) => {
      const halls = [];
      snapshot.forEach((childSnapshot) => {
        const hallId = childSnapshot.key;
        const hallData = childSnapshot.val();

        halls.push({
          id: hallId,
          name: hallData.name || "",
          description: hallData.description || "",
          capacity: hallData.capacity?.toString() || "",
          location: hallData.location || "",
          email: hallData.email || "",
          features: hallData.features ? hallData.features.split(",") : [],
          imageUrl: hallData.imageUrl || null,
          instagram: hallData.instagram || "#",
          tiktok: hallData.tiktok || "#",
          locationUrl: hallData.locationUrl || "#",
        });
      });
      setWeddingHalls(halls);
    });

    return () => unsubscribe();
  }, []);

  const uniqueNames = [...new Set(weddingHalls.map((hall) => hall.name))];

  const handleShareLink = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: t.title,
          text: t.searchTitle,
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
      case "contactUs":
        navigate("/CallUs");
        break;
    }
  };

  const handleLogin = () => {
    window.location.href = "/login";
  };

  const handleBooking = (e, hall) => {
    e.stopPropagation();
    navigate("/AppointmentBooking", {
      state: {
        hallName: hall.name,
        hallId: hall.id,
        email_owner: hall.email,
      },
    });
  };

  const handleImageError = (e) => {
    e.target.src = "/api/placeholder/400/320";
  };

  const handleHallClick = (hall) => {
    navigate(`/hall/${hall.id}`);
  };

  const handleSocialClick = (e) => {
    e.stopPropagation();
  };

  const filteredHalls = weddingHalls.filter((hall) => {
    const matchesSearch =
      hall.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hall.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesName = selectedName === "all" || hall.name === selectedName;
    const matchesCapacity =
      selectedCapacity === "all" ||
      (selectedCapacity === "small" && parseInt(hall.capacity) <= 500) ||
      (selectedCapacity === "medium" &&
        parseInt(hall.capacity) > 500 &&
        parseInt(hall.capacity) <= 800) ||
      (selectedCapacity === "large" && parseInt(hall.capacity) > 800);
    return matchesSearch && matchesName && matchesCapacity;
  });

  const handleCheckDate = () => {
    navigate("/CheckTheDateOfHall");
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
        className={`${isRTL ? "lg:mr-72" : "lg:ml-72"} transition-all duration-300`}
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

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mb-8 lg:mb-12 transform hover:scale-[1.02] transition-transform duration-300">
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-pink-900">
              {t.searchTitle}
            </h2>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
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
              <select
                value={selectedName}
                onChange={(e) => setSelectedName(e.target.value)}
                className="px-6 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
              >
                <option value="all">{t.allNames}</option>
                {uniqueNames.map((name, index) => (
                  <option key={index} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                value={selectedCapacity}
                onChange={(e) => setSelectedCapacity(e.target.value)}
                className="px-6 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
              >
                <option value="all">{t.allCapacities}</option>
                <option value="small">{t.upTo500}</option>
                <option value="medium">{t.from500to800}</option>
                <option value="large">{t.moreThan800}</option>
              </select>
            </div>
            <button
              onClick={handleCheckDate}
              className="mt-4 px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors"
            >
              {t.checkDate}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="p-4 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredHalls.map((hall) => (
              <div
                key={hall.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div
                  onClick={() => handleHallClick(hall)}
                  className="cursor-pointer"
                >
                  <div className="relative h-48 lg:h-64 bg-gray-200">
                    <img
                      src={hall.imageUrl || "/api/placeholder/400/320"}
                      alt={hall.name}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </div>
                  <div className="p-4 lg:p-6">
                    <h3 className="text-xl lg:text-2xl font-semibold mb-2 text-pink-900">
                      {hall.name}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm lg:text-base">
                      {hall.description}
                    </p>
                    <div className="flex items-center mb-2">
                      <Users className="w-5 h-5 text-pink-500 ml-2" />
                      <span className="text-sm lg:text-base">
                        {t.capacity}: {hall.capacity} {t.guest}
                      </span>
                    </div>
                    <div className="flex items-center mb-2">
                      <MapPin className="w-5 h-5 text-pink-500 ml-2" />
                      <span className="text-sm lg:text-base">
                        {hall.location}
                      </span>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2 text-sm lg:text-base">
                        {t.features}:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {hall.features.map((feature, index) => (
                          <span
                            key={index}
                            className="bg-pink-100 text-pink-800 text-xs lg:text-sm px-2 lg:px-3 py-1 rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-pink-50 p-4 flex items-center justify-between">
                  <div className="flex gap-4">
                    <a
                      href={hall.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-500 text-sm lg:text-base hover:text-pink-600"
                      onClick={handleSocialClick}
                    >
                      Instagram
                    </a>
                    <a
                      href={hall.locationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-500 text-sm lg:text-base hover:text-pink-600"
                      onClick={handleSocialClick}
                    >
                      Waze
                    </a>
                    <a
                      href={hall.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-500 text-sm lg:text-base hover:text-pink-600"
                      onClick={handleSocialClick}
                    >
                      TikTok
                    </a>
                  </div>
                  <button
                    onClick={(e) => handleBooking(e, hall)}
                    className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm lg:text-base"
                  >
                    <Calendar className="w-4 h-4 lg:w-5 lg:h-5" />
                    {t.bookNow}
                  </button>
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

export default HallsPage;
