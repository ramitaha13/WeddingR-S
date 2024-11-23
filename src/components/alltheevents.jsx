import { useState, useEffect } from "react";
import {
  ArrowRight,
  Trash2,
  Calendar,
  X,
  Plus,
  AlertCircle,
} from "lucide-react";
import { getDatabase, ref, onValue, remove } from "firebase/database";
import { useNavigate } from "react-router-dom";

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filters, setFilters] = useState({
    date: "",
    name: "",
    type: "",
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [error, setError] = useState(null);
  const database = getDatabase();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
      setIsAdmin(false);
    } else {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    const fetchBookings = () => {
      const hallBookingsRef = ref(database, "HallsBookings");
      const singerBookingsRef = ref(database, "SingerBookings");

      // Fetch hall bookings
      onValue(hallBookingsRef, (snapshot) => {
        try {
          const data = snapshot.val();
          const hallBookings = data
            ? Object.keys(data).map((bookingId) => ({
                id: bookingId,
                type: "hall",
                date: data[bookingId].date || "",
                hallName: data[bookingId].hallName || "",
                name: data[bookingId].name || "",
                phone: data[bookingId].phone || "",
                email: data[bookingId].email || "",
                eventType: data[bookingId].eventType || "",
                numberOfGuests: data[bookingId].numberOfGuests || "",
                notes: data[bookingId].notes || "",
              }))
            : [];

          // Fetch singer bookings
          onValue(singerBookingsRef, (singerSnapshot) => {
            try {
              const singerData = singerSnapshot.val();
              const singerBookings = singerData
                ? Object.keys(singerData).map((bookingId) => ({
                    id: bookingId,
                    type: "singer",
                    date: singerData[bookingId].date || "",
                    singerName: singerData[bookingId].singerPreference || "",
                    name: singerData[bookingId].name || "",
                    phone: singerData[bookingId].phoneNumber || "",
                    email: singerData[bookingId].email || "",
                    occasion: singerData[bookingId].occasion || "",
                    price: singerData[bookingId].price || "",
                    specialRequirements:
                      singerData[bookingId].specialRequirements || "",
                  }))
                : [];

              // Combine and set all bookings
              setBookings([...hallBookings, ...singerBookings]);
            } catch (error) {
              console.error("Error processing singer bookings:", error);
              setError("حدث خطأ أثناء تحميل بيانات حجوزات المطربين.");
            }
          });
        } catch (error) {
          console.error("Error processing hall bookings:", error);
          setError("حدث خطأ أثناء تحميل بيانات حجوزات القاعات.");
        }
      });
    };

    fetchBookings();
  }, [database]);

  const handleDelete = async (bookingId, type, booking) => {
    if (window.confirm("هل أنت متأكد أنك تريد حذف هذا الحجز؟")) {
      try {
        if (type === "hall") {
          // Delete from HallsBookings
          const hallBookingRef = ref(database, `HallsBookings/${bookingId}`);
          await remove(hallBookingRef);

          // Delete from HallNames
          const hallNameRef = ref(
            database,
            `HallNames/${booking.hallName}/${booking.date}`,
          );
          await remove(hallNameRef);
        } else if (type === "singer") {
          // Delete from SingerBookings
          const singerBookingRef = ref(database, `SingerBookings/${bookingId}`);
          await remove(singerBookingRef);

          // Delete from SingerNames
          const singerNameRef = ref(
            database,
            `SingerNames/${booking.singerName}/${booking.date}`,
          );
          await remove(singerNameRef);
        }

        // Remove the booking from local state
        setBookings((prevBookings) =>
          prevBookings.filter((b) => b.id !== bookingId),
        );
      } catch (error) {
        console.error("Error deleting booking:", error);
        setError("حدث خطأ أثناء حذف الحجز.");
      }
    }
  };

  const handleFilterChange = (field) => (e) => {
    setFilters((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      date: "",
      name: "",
      type: "",
    });
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesDate = booking.date
      ?.toLowerCase()
      .includes(filters.date.toLowerCase());
    const matchesName = booking.name
      ?.toLowerCase()
      .includes(filters.name.toLowerCase());
    const matchesType = !filters.type || booking.type === filters.type;

    return matchesDate && matchesName && matchesType;
  });

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
  };

  const closeModal = () => {
    setSelectedBooking(null);
  };

  const getDisplayName = (booking) => {
    if (booking.type === "hall") {
      return booking.hallName || "غير محدد";
    } else {
      return booking.singerName || "غير محدد";
    }
  };

  const handleEdit = (booking) => {
    if (booking.type === "singer") {
      navigate(`/admin/editsingerforadmin/${booking.id}`, {
        state: {
          booking,
        },
      });
    } else if (booking.type === "hall") {
      navigate(`/admin/edithallforadmin/${booking.id}`, {
        state: {
          booking,
        },
      });
    }
  };

  const handleAddHallBooking = () => {
    navigate("/admin/addinghallbookforadmin");
  };

  const handleAddSingerBooking = () => {
    navigate("/admin/addingSingerBookForAdmin");
  };

  const handleBack = () => {
    navigate("/"); // العودة إلى صفحة الاتصال
    localStorage.clear();
  };

  if (!isAdmin) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-gray-100 p-6 flex items-center justify-center"
      >
        <div className="max-w-md w-full">
          <div className="bg-red-50 border border-red-400 rounded-lg p-4 flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <p className="text-center text-red-700 text-lg">
              عذراً، لا يمكنك الوصول إلى هذه الصفحة. يجب أن تكون مسؤولاً للوصول
              إليها.
            </p>
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={handleBack}
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              العودة إلى الصفحة الرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg fixed right-0 h-full">
        <div className="h-16 bg-pink-600 flex items-center justify-center">
          <h1 className="text-white text-xl font-bold">إدارة الحجوزات</h1>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            إدارة الحجوزات
          </h2>
          <p className="text-gray-600 mb-4">عرض وإدارة تفاصيل الحجوزات</p>

          {/* Filters */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                نوع الحجز
              </label>
              <select
                value={filters.type}
                onChange={handleFilterChange("type")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
              >
                <option value="">الكل</option>
                <option value="hall">حجز قاعة</option>
                <option value="singer">حجز مطرب</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                التاريخ
              </label>
              <input
                type="text"
                value={filters.date}
                onChange={handleFilterChange("date")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                placeholder="البحث بالتاريخ..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                اسم الزبون
              </label>
              <input
                type="text"
                value={filters.name}
                onChange={handleFilterChange("name")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
                placeholder="البحث باسم العميل..."
              />
            </div>
          </div>
        </div>
        <div className="space-y-2 mt-6">
          <button
            onClick={handleAddHallBooking}
            className="w-full bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors duration-200 flex items-center justify-center"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة حجز قاعة جديد
          </button>
          <button
            onClick={handleAddSingerBooking}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة حجز مطرب جديد
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mr-64 flex-1 p-6">
        <button
          onClick={() => navigate("/admin")}
          className="mb-6 flex items-center text-gray-600 hover:text-pink-600 transition-colors duration-200"
        >
          <ArrowRight className="w-5 h-5 ml-2" />
          العودة للرئيسية
        </button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-pink-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                قائمة الحجوزات
              </h2>
              <p className="text-gray-600 mt-2">عرض وإدارة جميع الحجوزات</p>
              <div className="mt-4 bg-pink-50 text-pink-700 py-2 px-4 rounded-full inline-block">
                <span className="font-semibold">إجمالي الحجوزات: </span>
                {filteredBookings.length} من {bookings.length}
              </div>
              {Object.values(filters).some((filter) => filter) && (
                <button
                  onClick={clearFilters}
                  className="ml-4 mt-2 text-gray-500 hover:text-gray-700 text-sm"
                >
                  مسح الفلاتر
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse bg-white shadow-md rounded-lg">
                <thead>
                  <tr className="bg-pink-600 text-white">
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-center text-xs leading-4 font-semibold uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-center text-xs leading-4 font-semibold uppercase tracking-wider">
                      اسم المالك
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-center text-xs leading-4 font-semibold uppercase tracking-wider">
                      تاريخ الحجز
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-center text-xs leading-4 font-semibold uppercase tracking-wider">
                      الاسم
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-center text-xs leading-4 font-semibold uppercase tracking-wider">
                      نوع الحجز
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-center text-xs leading-4 font-semibold uppercase tracking-wider">
                      تفاصيل الحجز
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-center text-xs leading-4 font-semibold uppercase tracking-wider">
                      إجراءات
                    </th>
                    <th className="px-4 py-3 text-right border">تعديل</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking, index) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-pink-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-800 text-center">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-800 text-center">
                        {booking.name}
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-800 text-center">
                        {booking.date}
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-800 text-center">
                        {getDisplayName(booking)}
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-800 text-center">
                        {booking.type === "hall" ? "حجز قاعة" : "حجز مطرب"}
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-800 text-center">
                        <button
                          onClick={() => handleViewDetails(booking)}
                          className="text-pink-600 hover:text-pink-800 transition-colors duration-200"
                        >
                          عرض التفاصيل
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-800 text-center">
                        <button
                          onClick={() =>
                            handleDelete(booking.id, booking.type, booking)
                          }
                          className="text-red-600 hover:text-red-800 transition-colors duration-200"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                      <td className="px-4 py-3 border">
                        <button
                          onClick={() => handleEdit(booking)}
                          className="text-pink-600 hover:text-pink-800 transition-colors duration-200"
                        >
                          تعديل
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for booking details */}
      {selectedBooking && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-md">
            <div className="relative">
              <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
                تفاصيل الحجز
              </h2>
              <button
                onClick={closeModal}
                className="absolute top-0 right-0 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-b pb-2">
                <p className="text-sm">
                  <span className="font-semibold text-gray-700">
                    اسم العميل:
                  </span>{" "}
                  <span className="text-gray-600">{selectedBooking.name}</span>
                </p>
              </div>

              <div className="border-b pb-2">
                <p className="text-sm">
                  <span className="font-semibold text-gray-700">الهاتف:</span>{" "}
                  <span className="text-gray-600">{selectedBooking.phone}</span>
                </p>
              </div>

              <div className="border-b pb-2">
                <p className="text-sm">
                  <span className="font-semibold text-gray-700">
                    البريد الإلكتروني:
                  </span>{" "}
                  <span className="text-gray-600">{selectedBooking.email}</span>
                </p>
              </div>

              <div className="border-b pb-2">
                <p className="text-sm">
                  <span className="font-semibold text-gray-700">
                    تاريخ الحجز:
                  </span>{" "}
                  <span className="text-gray-600">{selectedBooking.date}</span>
                </p>
              </div>

              <div className="border-b pb-2">
                <p className="text-sm">
                  <span className="font-semibold text-gray-700">
                    نوع الحجز:
                  </span>{" "}
                  <span className="text-gray-600">
                    {selectedBooking.type === "hall" ? "حجز قاعة" : "حجز مطرب"}{" "}
                    - {getDisplayName(selectedBooking)}
                  </span>
                </p>
              </div>

              <div className="border-b pb-2">
                <p className="text-sm">
                  <span className="font-semibold text-gray-700">المناسبة:</span>{" "}
                  <span className="text-gray-600">
                    {selectedBooking.type === "hall"
                      ? selectedBooking.eventType
                      : selectedBooking.occasion}
                  </span>
                </p>
              </div>

              <div className="border-b pb-2">
                <p className="text-sm">
                  <span className="font-semibold text-gray-700">
                    عدد الضيوف:
                  </span>{" "}
                  <span className="text-gray-600">
                    {selectedBooking.numberOfGuests || "غير محدد"}
                  </span>
                </p>
              </div>

              {selectedBooking.notes && (
                <div className="border-b pb-2">
                  <p className="text-sm">
                    <span className="font-semibold text-gray-700">
                      ملاحظات:
                    </span>{" "}
                    <span className="text-gray-600">
                      {selectedBooking.notes}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={closeModal}
                className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors duration-200"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllBookings;
