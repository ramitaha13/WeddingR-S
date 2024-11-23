import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { Calendar, LogOut, Loader2, Clock, Star, Download } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import * as XLSX from "xlsx";

const DetailsPage = () => {
  const [data, setData] = useState(null);
  const [dataType, setDataType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [singerOrders, setSingerOrders] = useState([]);
  const [hallOrders, setHallOrders] = useState([]);
  const navigate = useNavigate();
  const { hallId } = useParams();

  const [currentPage1, setCurrentPage1] = useState("details");

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
    setCurrentPage1(page);
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
            price: hallData.price || "غير متوفر",
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
    navigate("/login");
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

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 flex">
      {/* Right Sidebar */}
      <div className="w-64 bg-white shadow-lg fixed right-0 h-full">
        <div className="h-16 bg-pink-600 flex items-center justify-center">
          <h1 className="text-white text-xl font-bold">لوحة التحكم</h1>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <button className="w-full flex items-center text-gray-700 hover:text-pink-600 py-2">
              <Calendar className="w-5 h-5 ml-2" />
              الحجوزات
            </button>
            <button
              onClick={() => handleNavigation("statistics")}
              className="w-full flex items-center text-gray-700 hover:text-pink-600 py-2"
            >
              <Star className="w-5 h-5 ml-2" />
              احصائيات
            </button>
            <button
              onClick={handleCheckDate}
              className="w-full flex items-center text-gray-700 hover:text-pink-600 py-2"
            >
              <Clock className="w-5 h-5 ml-2" />
              التحقق من التاريخ
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center text-red-600 hover:text-red-700 py-2"
            >
              <LogOut className="w-5 h-5 ml-2" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mr-64 flex-1 p-6">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {dataType === "singer" ? "معلومات المطرب" : "معلومات القاعة"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 mb-2">الاسم</p>
                <p className="text-lg font-semibold">{data?.name}</p>
              </div>

              {dataType === "hall" ? (
                <div>
                  <p className="text-gray-600 mb-2">الموقع</p>
                  <p className="text-lg font-semibold">{data?.location}</p>
                </div>
              ) : null}

              <div>
                <p className="text-gray-600 mb-2">رقم الهاتف</p>
                <p className="text-lg font-semibold">{data?.phoneNumber}</p>
              </div>

              <div>
                <p className="text-gray-600 mb-2">البريد الإلكتروني</p>
                <p className="text-lg font-semibold">{data?.email}</p>
              </div>

              {dataType === "hall" ? (
                <div>
                  <p className="text-gray-600 mb-2">السعة</p>
                  <p className="text-lg font-semibold">{data?.capacity}</p>
                </div>
              ) : null}

              {dataType === "singer" ? (
                <>
                  <div>
                    <p className="text-gray-600 mb-2">انستغرام</p>
                    <p className="text-lg font-semibold">{data?.instagram}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-2">تيك توك</p>
                    <p className="text-lg font-semibold">{data?.tiktok}</p>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Hall Orders Table */}
        {dataType === "hall" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <h2 className="text-2xl font-bold text-gray-800">
                    حجوزات القاعة
                  </h2>
                  <button
                    onClick={handleAddNewBooking}
                    className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 ml-2"
                  >
                    <Calendar className="w-5 h-5 ml-2" />
                    إضافة حجز جديد
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <Download className="w-5 h-5 ml-2" />
                    تحميل كملف Excel
                  </button>
                  <button
                    onClick={handleFilterOldReservations}
                    className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 ml-2"
                  >
                    <Calendar className="w-5 h-5 ml-2" />
                    عرض الحجوزات القديمة
                  </button>
                </div>
                <div className="bg-pink-100 text-pink-800 px-4 py-2 rounded-full">
                  عدد الحجوزات: {filteredHallOrders.length}
                </div>
              </div>
              {renderFilters()}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-right border whitespace-nowrap">
                        نوع السهره
                      </th>
                      <th className="px-4 py-3 text-right border">
                        تاريخ الحجز
                      </th>
                      <th className="px-4 py-3 text-right border">
                        اسم الزبون
                      </th>
                      <th className="px-4 py-3 text-right border">
                        رقم الهاتف
                      </th>
                      <th className="px-4 py-3 text-right border">
                        البريد الإلكتروني
                      </th>
                      <th className="px-4 py-3 text-right border">
                        عدد الضيوف
                      </th>
                      <th className="px-4 py-3 text-right border">تعديل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHallOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">{order.eventType}</td>
                        <td className="px-4 py-3 border">
                          {formatDate(order.date)}
                        </td>
                        <td className="px-4 py-3 border">{order.name}</td>
                        <td className="px-4 py-3 border">{order.phone}</td>
                        <td className="px-4 py-3 border">{order.email}</td>
                        <td className="px-4 py-3 border">
                          {order.numberOfGuests}
                        </td>
                        <td className="px-4 py-3 border">
                          <button
                            onClick={() => handleEditOrder(order)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            تعديل
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(dataType === "hall"
                      ? filteredHallOrders
                      : filteredSingerOrders
                    ).length === 0 && (
                      <tr>
                        <td
                          colSpan={dataType === "hall" ? 7 : 6}
                          className="px-4 py-3 text-center text-gray-500"
                        >
                          لا توجد حجوزات مطابقة
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Singer Orders Table */}
        {dataType === "singer" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <h2 className="text-2xl font-bold text-gray-800">
                    طلبات الحجز
                  </h2>
                  <button
                    onClick={handleAddNewBookingforSinger}
                    className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 ml-2"
                  >
                    <Calendar className="w-5 h-5 ml-2" />
                    إضافة حجز جديد
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <Download className="w-5 h-5 ml-2" />
                    تحميل كملف Excel
                  </button>
                  <button
                    onClick={handleFilterOldReservations}
                    className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 ml-2"
                  >
                    <Calendar className="w-5 h-5 ml-2" />
                    عرض الحجوزات القديمة
                  </button>
                </div>
                <div className="bg-pink-100 text-pink-800 px-4 py-2 rounded-full">
                  عدد الطلبات: {filteredSingerOrders.length}
                </div>
              </div>

              {renderFilters()}

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-right border whitespace-nowrap">
                        تاريخ ووقت الإنشاء
                      </th>
                      <th className="px-4 py-3 text-right border">
                        تاريخ الحجز
                      </th>
                      <th className="px-4 py-3 text-right border">
                        اسم الزبون
                      </th>
                      <th className="px-4 py-3 text-right border">
                        رقم الهاتف
                      </th>
                      <th className="px-4 py-3 text-right border">
                        نوع السهره
                      </th>
                      <th className="px-4 py-3 text-right border">المطرب</th>
                      <th className="px-4 py-3 text-right border">تعديل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSingerOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">
                          {formatCreatedAt(order.createdAt)}
                        </td>
                        <td className="px-4 py-3 border">
                          {formatDate(order.date)}
                        </td>
                        <td className="px-4 py-3 border">{order.name}</td>
                        <td className="px-4 py-3 border">
                          {order.phoneNumber}
                        </td>
                        <td className="px-4 py-3 border">{order.occasion}</td>
                        <td className="px-4 py-3 border">
                          {order.singerPreference}
                        </td>
                        <td className="px-4 py-3 border">
                          <buttona
                            onClick={() => handleEditSingerBooking(order)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            تعديل
                          </buttona>
                        </td>
                      </tr>
                    ))}
                    {filteredSingerOrders.length === 0 && (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-4 py-3 text-center text-gray-500"
                        >
                          لا توجد طلبات حجز مطابقة
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailsPage;
