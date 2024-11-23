import React, { useState, useEffect } from "react";
import { Users, Phone, MapPin, LogIn, Calendar, Search } from "lucide-react";
import { getDatabase, ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";

const HallsPage = () => {
  const navigate = useNavigate();
  const [weddingHalls, setWeddingHalls] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedName, setSelectedName] = useState("all");
  const [selectedCapacity, setSelectedCapacity] = useState("all");
  const [selectedMenuItem, setSelectedMenuItem] = useState("القاعات");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 1, name: "الرئيسية", icon: "🏠" },
    { id: 2, name: "القاعات", icon: "🏰" },
    { id: 3, name: "المطربين", icon: "🎤" },
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

  // Get the unique hall names from the weddingHalls array
  const uniqueNames = [...new Set(weddingHalls.map((hall) => hall.name))];

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

  const handleBooking = (hall) => {
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
      dir="rtl"
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
            : "translate-x-full lg:translate-x-0"
        } transition-transform duration-300 w-72 bg-white shadow-xl fixed right-0 h-full z-40 lg:z-30`}
      >
        <div className="h-24 bg-gradient-to-r from-pink-600 to-pink-500 flex items-center justify-center rounded-bl-3xl">
          <h1 className="text-white text-xl lg:text-2xl font-bold">
            دليل قاعات الأفراح
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
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="lg:mr-72 transition-all duration-300">
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

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mb-8 lg:mb-12 transform hover:scale-[1.02] transition-transform duration-300">
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-pink-900">
              ابحث عن قاعتك المثالية
            </h2>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحث عن قاعة..."
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
                <option value="all">جميع الأسماء</option>
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
                <option value="all">جميع السعات</option>
                <option value="small">حتى 500 ضيف</option>
                <option value="medium">500 - 800 ضيف</option>
                <option value="large">أكثر من 800 ضيف</option>
              </select>
            </div>
            <button
              onClick={handleCheckDate}
              className="mt-4 px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors"
            >
              تحقق من التاريخ
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
                      السعة: {hall.capacity} ضيف
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
                      المميزات:
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
                <div className="bg-pink-50 p-4 flex items-center justify-between">
                  <div className="flex gap-4">
                    <a
                      href={hall.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-500 text-sm lg:text-base hover:text-pink-600"
                    >
                      Instagram
                    </a>
                    <a
                      href={hall.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-500 text-sm lg:text-base hover:text-pink-600"
                    >
                      TikTok
                    </a>
                    <a
                      href={hall.locationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-500 text-sm lg:text-base hover:text-pink-600"
                    >
                      Waze
                    </a>
                  </div>
                  <button
                    onClick={() => handleBooking(hall)}
                    className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm lg:text-base"
                  >
                    <Calendar className="w-4 h-4 lg:w-5 lg:h-5" />
                    احجز الآن
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
