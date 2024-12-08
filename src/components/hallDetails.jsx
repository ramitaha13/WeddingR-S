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
  VideoIcon,
  ChevronRight,
  Share2,
  Copy,
  Check,
  Mail,
} from "lucide-react";

const HallDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hall, setHall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

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
          phone: hallData.phoneNumber || "",
          additionalImages: hallData.additionalImages || [],
          priceRange: hallData.priceRange || "",
          availableServices: hallData.availableServices || [],
          ownerPhone: hallData.ownerPhone || "",
          ownerEmail: hallData.ownerEmail || "",
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const handleShareLink = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: hall.name,
          text: `Check out ${hall.name}`,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

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
      {/* Hero Section with Navigation */}
      <div className="relative h-96">
        <img
          src={hall.imageUrl}
          alt={hall.name}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Navigation */}
        <div className="absolute top-0 right-0 left-0 p-4">
          <div className="container mx-auto flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-white/90 text-pink-600 rounded-lg hover:bg-white transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
              العودة
            </button>
            <button
              onClick={handleShareLink}
              className="flex items-center gap-2 px-4 py-2 bg-white/90 text-pink-600 rounded-lg hover:bg-white transition-colors"
            >
              {copied ? (
                <Check className="w-5 h-5" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
              {copied ? "تم النسخ!" : "مشاركة"}
            </button>
          </div>
        </div>

        {/* Hall Title and Quick Actions */}
        <div className="absolute bottom-0 right-0 left-0 p-6">
          <div className="container mx-auto">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {hall.name}
                </h1>
                <div className="flex items-center gap-4 text-white/90">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{hall.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>{hall.capacity} ضيف</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleBooking}
                className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                احجز الآن
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-pink-900 mb-6">
                عن القاعة
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                {hall.description}
              </p>
            </div>

            {/* Gallery */}
            {hall.additionalImages?.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-pink-900 mb-6">
                  معرض الصور
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hall.additionalImages.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setCurrentImageIndex(index + 1)}
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
              </div>
            )}

            {/* Features */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-pink-900 mb-6">
                المميزات
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hall.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-pink-50 text-pink-800 px-4 py-3 rounded-xl"
                  >
                    <Star className="w-5 h-5 text-pink-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Contact Card */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-xl font-bold text-pink-900 mb-6">
                التعرف على القاعة
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
                  href={hall.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-pink-600 hover:text-pink-700 p-3 bg-pink-50 rounded-xl transition-colors"
                >
                  <VideoIcon className="w-5 h-5" />
                  <span>تابعنا على TikTok</span>
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

            {/* Owner Contact Information Card */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-xl font-bold text-pink-900 mb-6">
                للتواصل مع صاحب القاعة
              </h2>
              <div className="space-y-4">
                {hall.phone && (
                  <a
                    href={`tel:${hall.phone}`}
                    className="flex items-center gap-3 text-pink-600 hover:text-pink-700 p-3 bg-pink-50 rounded-xl transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    <span>{hall.phone}</span>
                  </a>
                )}
                {hall.email && (
                  <a
                    href={`mailto:${hall.email}`}
                    className="flex items-center gap-3 text-pink-600 hover:text-pink-700 p-3 bg-pink-50 rounded-xl transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    <span>{hall.email}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallDetailsPage;
