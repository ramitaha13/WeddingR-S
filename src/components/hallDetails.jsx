import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";
import {
  Users,
  MapPin,
  Calendar,
  ArrowRight,
  Instagram,
  Phone,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const HallDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hall, setHall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const db = getDatabase();
    const hallRef = ref(db, `halls/${id}`);

    const unsubscribe = onValue(hallRef, (snapshot) => {
      if (snapshot.exists()) {
        const hallData = snapshot.val();
        setHall({
          id: snapshot.key,
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
          phone: hallData.phone || "",
          additionalImages: hallData.additionalImages || [],
          priceRange: hallData.priceRange || "",
          availableServices: hallData.availableServices || [],
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const handleImageError = (e) => {
    e.target.src = "/api/placeholder/400/320";
  };

  const handleBooking = () => {
    navigate("/AppointmentBooking", {
      state: {
        hallName: hall.name,
        hallId: hall.id,
        email_owner: hall.email,
      },
    });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === (hall?.additionalImages?.length || 0) ? 0 : prev + 1,
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? hall?.additionalImages?.length || 0 : prev - 1,
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <div className="text-2xl text-pink-600 animate-pulse">
          جاري التحميل...
        </div>
      </div>
    );
  }

  if (!hall) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <div className="text-2xl text-red-600">لم يتم العثور على القاعة</div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-pink-50 to-white"
    >
      {/* Floating Navigation */}
      <div className="fixed top-0 right-0 left-0 bg-white/80 backdrop-blur-md z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            العودة
          </button>
          <h1 className="text-xl font-bold text-pink-900">{hall.name}</h1>
          <button
            onClick={handleBooking}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            احجز الآن
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Image Gallery */}
        <div className="relative rounded-3xl overflow-hidden mb-8 bg-white shadow-xl">
          <div className="aspect-video relative">
            <img
              src={
                currentImageIndex === 0
                  ? hall.imageUrl
                  : hall.additionalImages[currentImageIndex - 1]
              }
              alt={hall.name}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
            {hall.additionalImages?.length > 0 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-pink-600" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-pink-600" />
                </button>
              </>
            )}
          </div>

          {/* Image Thumbnails */}
          {hall.additionalImages?.length > 0 && (
            <div className="flex gap-2 p-4 overflow-x-auto">
              <div
                onClick={() => setCurrentImageIndex(0)}
                className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden cursor-pointer ${
                  currentImageIndex === 0 ? "ring-2 ring-pink-600" : ""
                }`}
              >
                <img
                  src={hall.imageUrl}
                  alt={hall.name}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </div>
              {hall.additionalImages.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setCurrentImageIndex(index + 1)}
                  className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden cursor-pointer ${
                    currentImageIndex === index + 1
                      ? "ring-2 ring-pink-600"
                      : ""
                  }`}
                >
                  <img
                    src={image}
                    alt={`${hall.name} - ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-pink-900 mb-4">
                عن القاعة
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                {hall.description}
              </p>
            </div>

            {/* Features Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-pink-900 mb-6">
                المميزات
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hall.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-pink-50 text-pink-800 px-4 py-3 rounded-xl"
                  >
                    <Star className="w-5 h-5 text-pink-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-xl font-bold text-pink-900 mb-6">
                معلومات سريعة
              </h2>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-pink-500" />
                  <span className="text-lg">السعة: {hall.capacity} ضيف</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-pink-500" />
                  <span className="text-lg">{hall.location}</span>
                </div>
                {hall.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-6 h-6 text-pink-500" />
                    <span className="text-lg">{hall.phone}</span>
                  </div>
                )}
                {hall.priceRange && (
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-pink-900">
                      نطاق السعر: {hall.priceRange}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Links Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-xl font-bold text-pink-900 mb-6">
                روابط مفيدة
              </h2>
              <div className="space-y-4">
                <a
                  href={hall.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-pink-600 hover:text-pink-700 p-3 bg-pink-50 rounded-xl transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                  <span>تابعنا على Instagram</span>
                </a>
                <a
                  href={hall.locationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-pink-600 hover:text-pink-700 p-3 bg-pink-50 rounded-xl transition-colors"
                >
                  <MapPin className="w-5 h-5" />
                  <span>الموقع على الخريطة</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallDetailsPage;
