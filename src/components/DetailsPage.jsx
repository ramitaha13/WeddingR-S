import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import {
  Calendar,
  LogOut,
  Loader2,
  Clock,
  Star,
  Download,
  AlertCircle,
  Menu,
  X,
  ChevronRight, // Add this
  ChevronLeft, // Add this
  Search,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import * as XLSX from "xlsx";

const DetailsPage = () => {
  const [data, setData] = useState(null);
  const [dataType, setDataType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [singerOrders, setSingerOrders] = useState([]);
  const [hallOrders, setHallOrders] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { hallId } = useParams();
  const [isUser, setIsUser] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== hallId) {
      setIsUser(false);
    } else {
      setIsUser(true);
    }
  }, []);

  const handleBack = () => {
    navigate("/");
    localStorage.clear();
  };

  const [filters, setFilters] = useState({
    date: "",
    name: "",
    phone: "",
  });

  const standardizeDateFormat = (dateStr) => {
    // Handle empty input
    if (!dateStr) return "";

    // Try to parse as DD-MM-YYYY
    const ddmmyyyyPattern = /^(\d{2})-(\d{2})-(\d{4})$/;
    // Try to parse as YYYY-MM-DD
    const yyyymmddPattern = /^(\d{4})-(\d{2})-(\d{2})$/;

    if (ddmmyyyyPattern.test(dateStr)) {
      const [day, month, year] = dateStr.split("-");
      return `${year}-${month}-${day}`;
    } else if (yyyymmddPattern.test(dateStr)) {
      return dateStr;
    }

    return dateStr.toLowerCase();
  };

  const getFilteredOrders = () => {
    const ordersToFilter = dataType === "hall" ? hallOrders : singerOrders;

    return ordersToFilter
      .filter((order) => {
        // Handle date filtering with improved logic
        const dateMatch =
          !filters.date.trim() ||
          (() => {
            const orderDate = standardizeDateFormat(order.date);
            const searchDate = standardizeDateFormat(filters.date);

            // If partial search (user is still typing)
            if (searchDate.length < 10) {
              return orderDate.includes(searchDate);
            }

            // Full date comparison
            return orderDate === searchDate;
          })();

        // Handle name filtering - case insensitive partial match
        const nameMatch =
          !filters.name.trim() ||
          order.name.toLowerCase().includes(filters.name.toLowerCase());

        // Handle phone filtering - partial match
        const phoneMatch =
          !filters.phone.trim() ||
          (dataType === "hall" ? order.phone : order.phoneNumber)
            .toString()
            .includes(filters.phone);

        return dateMatch && nameMatch && phoneMatch;
      })
      .sort((a, b) => {
        // Sort by date in descending order
        const dateA = new Date(standardizeDateFormat(a.date));
        const dateB = new Date(standardizeDateFormat(b.date));
        return dateB - dateA;
      });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    // Special handling for date input
    if (name === "date") {
      // Allow both DD-MM-YYYY and YYYY-MM-DD formats
      const ddmmyyyyPattern = /^(\d{0,2})(-\d{0,2})?(-\d{0,4})?$/;
      const yyyymmddPattern = /^(\d{0,4})(-\d{0,2})?(-\d{0,2})?$/;

      if (
        value === "" ||
        ddmmyyyyPattern.test(value) ||
        yyyymmddPattern.test(value)
      ) {
        setFilters((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else {
      // For other fields, update normally
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const renderFilters = () => (
    <div className="mb-4 grid grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          تاريخ الحجز
        </label>
        <input
          type="text"
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
          placeholder="DD-MM-YYYY أو YYYY-MM-DD"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          اسم الزبون
        </label>
        <input
          type="text"
          name="name"
          value={filters.name}
          onChange={handleFilterChange}
          placeholder="ادخل اسم الزبون..."
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          رقم الهاتف
        </label>
        <input
          type="text"
          name="phone"
          value={filters.phone}
          onChange={handleFilterChange}
          placeholder="ادخل رقم الهاتف..."
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
    </div>
  );

  const handleNavigation = (page) => {
    if (page === "statistics") {
      navigate(`/statistics?hallId=${hallId}`);
    }
  };

  const handleEditSingerBooking = (order) => {
    navigate(`/editbooksinger/${hallId}/${order.id}`, { state: { order } });
  };

  const handleEditOrder = (order) => {
    navigate(`/editreservation/${hallId}/${order.id}`, { state: { order } });
  };

  const exportToExcel = () => {
    const ordersToExport = dataType === "hall" ? hallOrders : singerOrders;

    const exportData = ordersToExport.map((order) => {
      if (dataType === "hall") {
        return {
          "تاريخ الحجز": formatDate(order.date),
          "اسم الزبون": order.name,
          "رقم الهاتف": order.phone,
          "البريد الإلكتروني": order.email,
          "عدد الضيوف": order.numberOfGuests,
          "تاريخ الإنشاء": order.createdAt
            ? new Date(order.createdAt).toLocaleString("ar-SA")
            : "غير متوفر",
        };
      } else {
        return {
          "تاريخ الحجز": formatDate(order.date),
          "اسم الزبون": order.name,
          "رقم الهاتف": order.phoneNumber,
          المطرب: order.singerPreference,
          "تاريخ الإنشاء": order.createdAt
            ? new Date(order.createdAt).toLocaleString("ar-SA")
            : "غير متوفر",
        };
      }
    });

    const ws = XLSX.utils.json_to_sheet(exportData, {
      header: Object.keys(exportData[0]),
      bookType: "xlsx",
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");

    const fileName =
      dataType === "hall" ? "حجوزات_القاعة.xlsx" : "حجوزات_المطرب.xlsx";
    XLSX.writeFile(wb, fileName);
  };

  useEffect(() => {
    if (!hallId) {
      setError("معرف غير صالح");
      setLoading(false);
      return;
    }

    const firebaseConfig = {
      databaseURL:
        "https://booking-appointments-4c1b0-default-rtdb.firebaseio.com",
    };

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    const fetchData = () => {
      const hallRef = ref(db, `halls/${hallId}`);
      onValue(hallRef, (hallSnapshot) => {
        if (hallSnapshot.exists()) {
          setDataType("hall");
          const hallData = hallSnapshot.val();
          setData({
            name: hallData.name || "غير متوفر",
            location: hallData.location || "غير متوفر",
            phoneNumber: hallData.phoneNumber || "غير متوفر",
            email: hallData.email || "غير متوفر",
            capacity: hallData.capacity || "غير متوفر",
          });

          const hallOrdersRef = ref(db, `HallNames/${hallId}`);
          onValue(hallOrdersRef, (ordersSnapshot) => {
            if (ordersSnapshot.exists()) {
              const ordersData = ordersSnapshot.val();
              const ordersArray = Object.entries(ordersData).map(
                ([key, value]) => ({
                  id: key,
                  ...value,
                  createdAt: value.createdAt || "غير متوفر",
                }),
              );
              const sortedOrders = ordersArray.sort((a, b) => {
                const dateA = new Date(a.date.split("-").reverse().join("-"));
                const dateB = new Date(b.date.split("-").reverse().join("-"));
                return dateB - dateA;
              });
              setHallOrders(sortedOrders);
            }
            setLoading(false);
          });
        } else {
          const singerRef = ref(db, `Singer/${hallId}`);
          onValue(singerRef, (singerSnapshot) => {
            if (singerSnapshot.exists()) {
              setDataType("singer");
              const singerData = singerSnapshot.val();
              setData({
                name: singerData.name || "غير متوفر",
                price: singerData.price || "غير متوفر",
                phoneNumber: singerData.phoneNumber || "غير متوفر",
                email: singerData.email || "غير متوفر",
                instagram: singerData.instagram || "غير متوفر",
                tiktok: singerData.tiktok || "غير متوفر",
              });

              const ordersRef = ref(db, `SingerNames/${hallId}`);
              onValue(ordersRef, (ordersSnapshot) => {
                if (ordersSnapshot.exists()) {
                  const ordersData = ordersSnapshot.val();
                  const ordersArray = Object.entries(ordersData).map(
                    ([key, value]) => ({
                      id: key,
                      ...value,
                      createdAt: value.createdAt || "غير متوفر",
                    }),
                  );
                  const sortedOrders = ordersArray.sort((a, b) => {
                    const dateA = new Date(
                      a.date.split("-").reverse().join("-"),
                    );
                    const dateB = new Date(
                      b.date.split("-").reverse().join("-"),
                    );
                    return dateB - dateA;
                  });
                  setSingerOrders(sortedOrders);
                }
                setLoading(false);
              });
            } else {
              setError("لم يتم العثور على بيانات");
              setLoading(false);
            }
          });
        }
      });
    };

    try {
      fetchData();
    } catch (error) {
      setError(`خطأ غير متوقع: ${error.message}`);
      setLoading(false);
    }

    return () => {
      const db = getDatabase();
      const hallRef = ref(db, `halls/${hallId}`);
      const singerRef = ref(db, `Singer/${hallId}`);
      const ordersRef = ref(db, `SingerNames/${hallId}`);
      const hallOrdersRef = ref(db, `HallNames/${hallId}`);
      onValue(hallRef, () => {});
      onValue(singerRef, () => {});
      onValue(ordersRef, () => {});
      onValue(hallOrdersRef, () => {});
    };
  }, [hallId]);

  const handleLogout = () => {
    navigate("/home");
    localStorage.clear();
  };

  const formatDate = (dateString) => {
    try {
      const [day, month, year] = dateString.split("-");
      return `${year}-${month}-${day}`;
    } catch {
      return dateString;
    }
  };

  const formatCreatedAt = (timestamp) => {
    if (!timestamp || timestamp === "غير متوفر") return "غير متوفر";
    try {
      const date = new Date(timestamp);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");

      return (
        <div className="flex flex-col text-sm">
          <span className="font-medium text-gray-800">{`${day}-${month}-${year}`}</span>
          <span className="text-gray-600">{`${hours}:${minutes}`}</span>
        </div>
      );
    } catch {
      return timestamp;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-pink-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-red-600 text-lg">خطأ: {error}</p>
        </div>
      </div>
    );
  }

  const handleAddNewBooking = () => {
    navigate(`/APpointmentBookinghall/${hallId}`, {
      state: {
        hallName: data.name,
      },
    });
  };

  const handleAddNewBookingforSinger = () => {
    navigate(`/bookingSingerforSinger/${hallId}`, {
      state: {
        singerData: {
          name: data.name,
          price: data.price,
        },
      },
    });
  };

  const handleCheckDate = () => {
    if (dataType === "hall") {
      navigate(`/check-date/${hallId}`);
    } else if (dataType === "singer") {
      navigate(`/datachekerforSinger/${hallId}`);
    }
  };

  // Compute filtered orders
  const filteredHallOrders = dataType === "hall" ? getFilteredOrders() : [];
  const filteredSingerOrders = dataType === "singer" ? getFilteredOrders() : [];

  const handleFilterOldReservations = () => {
    const currentDate = new Date().toISOString().slice(0, 10);

    const filteredOrders =
      dataType === "hall"
        ? hallOrders.filter((order) => order.date < currentDate)
        : singerOrders.filter((order) => order.date < currentDate);

    if (dataType === "hall") {
      setHallOrders(filteredOrders);
    } else {
      setSingerOrders(filteredOrders);
    }
  };

  if (!isUser) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6 flex items-center justify-center"
      >
        <div className="max-w-md w-full">
          <div className="bg-white border border-pink-100 rounded-xl p-6 shadow-lg flex flex-col items-center space-y-4">
            <AlertCircle className="h-12 w-12 text-pink-500" />
            <p className="text-center text-gray-800 text-lg font-medium">
              عذراً، لا يمكنك الوصول إلى هذه الصفحة. يجب أن تكون مسؤولاً للوصول
              إليها.
            </p>
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              العودة إلى الصفحة الرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-pink-600 animate-spin" />
          <p className="text-gray-600 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const Sidebar = ({ isOpen, onToggle }) => {
    return (
      <>
        {/* Desktop Sidebar */}
        <div
          className={`hidden lg:block fixed inset-y-0 right-0 bg-white shadow-xl transition-all duration-300 ease-in-out ${
            isOpen ? "w-64" : "w-20"
          }`}
        >
          <div className="h-16 bg-gradient-to-r from-pink-600 to-pink-700 flex items-center px-4 justify-between">
            {isOpen && (
              <h1 className="text-white text-xl font-bold">لوحة التحكم</h1>
            )}
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-pink-700 transition-colors"
            >
              {isOpen ? (
                <ChevronRight className="h-6 w-6 text-white" />
              ) : (
                <ChevronLeft className="h-6 w-6 text-white" />
              )}
            </button>
          </div>

          <nav className="p-4 space-y-2">
            {[
              { icon: Calendar, label: "الحجوزات", action: () => {} },
              {
                icon: Star,
                label: "احصائيات",
                action: () => handleNavigation("statistics"),
              },
              {
                icon: Clock,
                label: "التحقق من التاريخ",
                action: handleCheckDate,
              },
              {
                icon: LogOut,
                label: "تسجيل الخروج",
                action: handleLogout,
                className: "text-red-600 hover:bg-red-50",
              },
            ].map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className={`w-full flex items-center ${
                  isOpen ? "space-x-3 space-x-reverse" : "justify-center"
                } px-4 py-3 rounded-lg transition-colors ${
                  item.className ||
                  "text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {isOpen && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile Sidebar Overlay */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity lg:hidden ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            className={`fixed inset-y-0 right-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ${
              isOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="h-16 bg-gradient-to-r from-pink-600 to-pink-700 flex items-center justify-between px-4">
              <h1 className="text-white text-xl font-bold">لوحة التحكم</h1>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            <nav className="p-4 space-y-2">
              {[
                { icon: Calendar, label: "الحجوزات", action: () => {} },
                {
                  icon: Star,
                  label: "احصائيات",
                  action: () => handleNavigation("statistics"),
                },
                {
                  icon: Clock,
                  label: "التحقق من التاريخ",
                  action: handleCheckDate,
                },
                {
                  icon: LogOut,
                  label: "تسجيل الخروج",
                  action: handleLogout,
                  className: "text-red-600 hover:bg-red-50",
                },
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors ${
                    item.className ||
                    "text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </>
    );
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`hidden lg:block fixed inset-y-0 right-0 bg-white shadow-xl transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="h-16 bg-gradient-to-r from-pink-600 to-pink-700 flex items-center px-4 justify-between">
          {sidebarOpen && (
            <h1 className="text-white text-xl font-bold">لوحة التحكم</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-pink-700 transition-colors"
          >
            {sidebarOpen ? (
              <ChevronRight className="h-6 w-6 text-white" />
            ) : (
              <ChevronLeft className="h-6 w-6 text-white" />
            )}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {[
            { icon: Calendar, label: "الحجوزات", action: () => {} },
            {
              icon: Star,
              label: "احصائيات",
              action: () => handleNavigation("statistics"),
            },
            {
              icon: Clock,
              label: "التحقق من التاريخ",
              action: handleCheckDate,
            },
            {
              icon: LogOut,
              label: "تسجيل الخروج",
              action: handleLogout,
              className: "text-red-600 hover:bg-red-50",
            },
          ].map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className={`w-full flex items-center ${
                sidebarOpen ? "space-x-3 space-x-reverse" : "justify-center"
              } px-4 py-3 rounded-lg transition-colors ${
                item.className ||
                "text-gray-700 hover:bg-pink-50 hover:text-pink-600"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity lg:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`fixed inset-y-0 right-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-16 bg-gradient-to-r from-pink-600 to-pink-700 flex items-center justify-between px-4">
            <h1 className="text-white text-xl font-bold">لوحة التحكم</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          <nav className="p-4 space-y-2">
            {[
              { icon: Calendar, label: "الحجوزات", action: () => {} },
              {
                icon: Star,
                label: "احصائيات",
                action: () => handleNavigation("statistics"),
              },
              {
                icon: Clock,
                label: "التحقق من التاريخ",
                action: handleCheckDate,
              },
              {
                icon: LogOut,
                label: "تسجيل الخروج",
                action: handleLogout,
                className: "text-red-600 hover:bg-red-50",
              },
            ].map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-colors ${
                  item.className ||
                  "text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "lg:mr-64" : "lg:mr-20"
        }`}
      >
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">
            {dataType === "singer" ? "لوحة تحكم المطرب" : "لوحة تحكم القاعة"}
          </h1>
        </header>

        {/* Main Content Area */}
        <main className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-800">
                {dataType === "singer" ? "معلومات المطرب" : "معلومات القاعة"}
              </h2>
            </div>
            <div className="p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {Object.entries(data || {}).map(([key, value]) => (
                <div key={key} className="space-y-1 lg:space-y-2">
                  <p className="text-sm text-gray-500">{key}</p>
                  <p className="text-sm lg:text-base font-medium text-gray-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Orders Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 lg:p-6">
              {/* Orders Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-800">
                    {dataType === "singer" ? "طلبات الحجز" : "حجوزات القاعة"}
                  </h2>
                  <button
                    onClick={
                      dataType === "singer"
                        ? handleAddNewBookingforSinger
                        : handleAddNewBooking
                    }
                    className="w-full lg:w-auto inline-flex items-center justify-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    <Calendar className="w-5 h-5 ml-2" />
                    إضافة حجز جديد
                  </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-4">
                  <button
                    onClick={handleFilterOldReservations}
                    className="w-full lg:w-auto inline-flex items-center justify-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    <Calendar className="w-5 h-5 ml-2" />
                    عرض الحجوزات القديمة
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="w-full lg:w-auto inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-5 h-5 ml-2" />
                    تحميل Excel
                  </button>
                  <div className="w-full lg:w-auto bg-pink-50 text-pink-700 px-4 py-2 rounded-lg font-medium text-center">
                    عدد الحجوزات:{" "}
                    {
                      (dataType === "hall"
                        ? filteredHallOrders
                        : filteredSingerOrders
                      ).length
                    }
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {Object.entries(filters).map(([key, value]) => (
                  <div key={key} className="relative">
                    <input
                      type="text"
                      name={key}
                      value={value}
                      onChange={handleFilterChange}
                      placeholder={
                        key === "date" ? "DD-MM-YYYY" : `البحث حسب ${key}`
                      }
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm lg:text-base"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                ))}
              </div>

              {/* Table */}
              <div className="overflow-x-auto -mx-4 lg:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {(dataType === "hall"
                            ? [
                                "نوع السهره",
                                "تاريخ الحجز",
                                "اسم الزبون",
                                "رقم الهاتف",
                                "البريد الإلكتروني",
                                "عدد الضيوف",
                                "",
                              ]
                            : [
                                "تاريخ الإنشاء",
                                "تاريخ الحجز",
                                "اسم الزبون",
                                "رقم الهاتف",
                                "نوع السهره",
                                "المطرب",
                                "",
                              ]
                          ).map((header, index) => (
                            <th
                              key={index}
                              className="px-3 lg:px-4 py-3 text-right text-xs lg:text-sm font-medium text-gray-600"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {(dataType === "hall"
                          ? filteredHallOrders
                          : filteredSingerOrders
                        ).map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            {dataType === "hall" ? (
                              <>
                                <td className="px-3 lg:px-4 py-3 text-xs lg:text-sm">
                                  {order.eventType}
                                </td>
                                <td className="px-3 lg:px-4 py-3 text-xs lg:text-sm">
                                  {formatDate(order.date)}
                                </td>
                                <td className="px-3 lg:px-4 py-3 text-xs lg:text-sm">
                                  {order.name}
                                </td>
                                <td className="px-3 lg:px-4 py-3 text-xs lg:text-sm">
                                  {order.phone}
                                </td>
                                <td className="px-3 lg:px-4 py-3 text-xs lg:text-sm">
                                  {order.email}
                                </td>
                                <td className="px-3 lg:px-4 py-3 text-xs lg:text-sm">
                                  {order.numberOfGuests}
                                </td>
                                <td className="px-3 lg:px-4 py-3">
                                  <button
                                    onClick={() => handleEditOrder(order)}
                                    className="w-full lg:w-auto px-3 py-1.5 bg-blue-600 text-white text-xs lg:text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                  >
                                    تعديل
                                  </button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-3 lg:px-4 py-3 text-xs lg:text-sm">
                                  {formatCreatedAt(order.createdAt)}
                                </td>
                                <td className="px-3 lg:px-4 py-3 text-xs lg:text-sm">
                                  {formatDate(order.date)}
                                </td>
                                <td className="px-3 lg:px-4 py-3 text-xs lg:text-sm">
                                  {order.name}
                                </td>
                                <td className="px-3 lg:px-4 py-3 text-xs lg:text-sm">
                                  {order.phoneNumber}
                                </td>
                                <td className="px-3 lg:px-4 py-3 text-xs lg:text-sm">
                                  {order.occasion}
                                </td>
                                <td className="px-3 lg:px-4 py-3 text-xs lg:text-sm">
                                  {order.singerPreference}
                                </td>
                                <td className="px-3 lg:px-4 py-3">
                                  <button
                                    onClick={() =>
                                      handleEditSingerBooking(order)
                                    }
                                    className="w-full lg:w-auto px-3 py-1.5 bg-blue-600 text-white text-xs lg:text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                  >
                                    تعديل
                                  </button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {(dataType === "hall"
                      ? filteredHallOrders
                      : filteredSingerOrders
                    ).length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-gray-500 text-sm lg:text-base">
                          لا توجد حجوزات مطابقة
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DetailsPage;
