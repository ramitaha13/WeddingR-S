import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getDatabase,
  ref,
  update,
  remove,
  get,
  child,
} from "firebase/database";
import { initializeApp } from "firebase/app";
import {
  ArrowRight,
  X,
  Calendar,
  Phone,
  Mail,
  FileText,
  Users,
  Loader2,
  Trash2,
  CheckCircle2,
} from "lucide-react";

const EditReservation = () => {
  const { state } = useLocation();
  const { hallId, orderId } = useParams();
  const [order, setOrder] = useState({
    name: "",
    phone: "",
    email: "",
    date: "",
    numberOfGuests: "",
  });
  const [originalDate, setOriginalDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        if (state?.order) {
          console.log("Data from state:", state.order);
          const formattedDate = formatDate(state.order.date);
          setOriginalDate(formattedDate);
          setOrder({
            ...state.order,
            numberOfGuests: state.order.numberOfGuests
              ? String(state.order.numberOfGuests)
              : "",
            date: formattedDate,
          });
          setLoading(false);
        } else {
          const db = getDatabase();
          const hallNameRef = ref(db, `HallNames/${hallId}/${orderId}`);

          onValue(hallNameRef, (snapshot) => {
            const data = snapshot.val();
            console.log("Data from HallNames:", data);

            if (snapshot.exists()) {
              const formattedDate = formatDate(data.date);
              setOriginalDate(formattedDate);
              setOrder({
                ...data,
                date: formattedDate,
                numberOfGuests: data.numberOfGuests
                  ? String(data.numberOfGuests)
                  : "",
              });
            } else {
              const bookingsRef = ref(db, `HallsBookings/${orderId}_${hallId}`);

              onValue(bookingsRef, (bookingSnapshot) => {
                const bookingData = bookingSnapshot.val();
                console.log("Data from HallsBookings:", bookingData);

                if (bookingSnapshot.exists()) {
                  const formattedDate = formatDate(bookingData.date);
                  setOriginalDate(formattedDate);
                  setOrder({
                    ...bookingData,
                    date: formattedDate,
                    numberOfGuests: bookingData.numberOfGuests
                      ? String(bookingData.numberOfGuests)
                      : "",
                  });
                } else {
                  setError("لم يتم العثور على الحجز");
                }
              });
            }
            setLoading(false);
          });
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setError("حدث خطأ أثناء تحميل البيانات");
        setLoading(false);
      }
    };

    loadData();
  }, [hallId, orderId, state?.order]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      if (dateString.includes("-")) {
        const [year, month, day] = dateString.split("-");
        const formattedYear = year.padStart(4, "0");
        const formattedMonth = month.padStart(2, "0");
        const formattedDay = day.padStart(2, "0");
        return `${formattedYear}-${formattedMonth}-${formattedDay}`;
      }
      return dateString;
    } catch {
      return "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input change - ${name}:`, value);
    setOrder((prev) => {
      const newOrder = {
        ...prev,
        [name]: value,
      };
      console.log("New order state after input:", newOrder);
      return newOrder;
    });
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const firebaseConfig = {
        databaseURL:
          "https://booking-appointments-4c1b0-default-rtdb.firebaseio.com",
      };

      const app = initializeApp(firebaseConfig);
      const db = getDatabase(app);

      // Check if the new date already exists in the database
      const checkDateRef = ref(db, `HallNames/${hallId}/${order.date}`);
      const snapshot = await get(child(checkDateRef, "date"));

      if (snapshot.exists() && originalDate !== order.date) {
        setError("تاريخ الحجز هذا محجوز بالفعل. لا يمكن تحديث الحجز.");
        setLoading(false);
        return;
      }

      // Prepare the data for saving
      const updatedOrder = {
        ...order,
        numberOfGuests: order.numberOfGuests,
      };

      console.log("Saving order:", updatedOrder);
      console.log("Original date:", originalDate);
      console.log("New date:", order.date);

      // Prepare the data to be saved
      const saveData = {
        ...updatedOrder,
        hallId,
      };

      if (originalDate !== order.date) {
        console.log(
          "Date has changed - deleting old entries and creating new ones",
        );

        // Delete old entries using original date
        const oldHallNameRef = ref(db, `HallNames/${hallId}/${originalDate}`);
        const oldBookingRef = ref(
          db,
          `HallsBookings/${originalDate}_${hallId}`,
        );

        // Create new entries with new date
        const newHallNameRef = ref(db, `HallNames/${hallId}/${order.date}`);
        const newBookingRef = ref(db, `HallsBookings/${order.date}_${hallId}`);

        // Perform the updates and deletions
        await Promise.all([
          remove(oldHallNameRef),
          remove(oldBookingRef),
          update(newHallNameRef, saveData),
          update(newBookingRef, saveData),
        ]);

        console.log("Successfully deleted old entries and created new ones");
      } else {
        console.log("Date hasn't changed - updating existing entries");

        // Update existing entries
        const hallNameRef = ref(db, `HallNames/${hallId}/${order.date}`);
        const bookingRef = ref(db, `HallsBookings/${order.date}_${hallId}`);

        await Promise.all([
          update(hallNameRef, saveData),
          update(bookingRef, saveData),
        ]);

        console.log("Successfully updated existing entries");
      }

      setSuccessMessage("تم تحديث الحجز بنجاح");
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (error) {
      console.error("Save error:", error);
      setError(`حدث خطأ أثناء حفظ التغييرات: ${error.message}`);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      setLoading(true);
      try {
        const firebaseConfig = {
          databaseURL:
            "https://booking-appointments-4c1b0-default-rtdb.firebaseio.com",
        };

        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);

        // Get the date from orderId
        const [date, ...rest] = orderId.split("-");
        const formattedDate = `${date.padStart(4, "0")}-${rest.join("-")}`;

        // Delete from HallsBookings
        await remove(ref(db, `HallsBookings/${order.date}_${hallId}`));

        // Delete from HallNames
        await remove(ref(db, `HallNames/${hallId}/${order.date}`));

        navigate(-1);
      } catch (error) {
        console.error("Delete error:", error);
        setError(`Error deleting the booking: ${error.message}`);
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-pink-600 animate-spin" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-pink-600 transition-colors duration-200 bg-white rounded-lg px-4 py-2 shadow-sm hover:shadow-md"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            <span>رجوع</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">تعديل الحجز</h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-500" />
              </div>
              <div className="mr-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div className="mr-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                <Trash2 className="ml-2" size={16} />
                <span>حذف الحجز</span>
              </button>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Customer Information Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                    معلومات العميل
                  </h3>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      اسم الزبون
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={order.name || ""}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                    <div className="absolute left-3 top-9 text-gray-400">
                      <FileText className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={order.phone || ""}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                    <div className="absolute left-3 top-9 text-gray-400">
                      <Phone className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={order.email || ""}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                    <div className="absolute left-3 top-9 text-gray-400">
                      <Mail className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* Booking Details Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                    تفاصيل الحجز
                  </h3>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      تاريخ الحجز
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={order.date}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                    <div className="absolute left-3 top-9 text-gray-400">
                      <Calendar className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      عدد الضيوف
                    </label>
                    <input
                      type="text"
                      name="numberOfGuests"
                      value={order.numberOfGuests}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                    <div className="absolute left-3 top-9 text-gray-400">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-4 space-x-reverse mt-8">
                <button
                  onClick={handleSaveChanges}
                  disabled={loading}
                  className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-3 rounded-lg hover:from-pink-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 shadow-lg transform transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </div>
                  ) : (
                    "حفظ التغييرات"
                  )}
                </button>
                <button
                  onClick={() => navigate(-1)}
                  disabled={loading}
                  className="bg-white text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditReservation;
