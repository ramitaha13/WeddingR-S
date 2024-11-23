import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, get } from "firebase/database";
import { Calendar, ChevronRight, Loader2 } from "lucide-react";

const Alert = ({ variant, className, children }) => (
  <div
    className={`p-4 rounded-md ${
      variant === "destructive"
        ? "bg-red-100 text-red-800"
        : "bg-gray-100 text-gray-800"
    } ${className}`}
  >
    {children}
  </div>
);

const AlertTitle = ({ children }) => (
  <h3 className="text-lg font-bold mb-2">{children}</h3>
);

const AlertDescription = ({ children }) => (
  <p className="text-sm">{children}</p>
);

const CheckTheDateOfHall = () => {
  const navigate = useNavigate();
  const [selectedHall, setSelectedHall] = useState("");
  const [hallOptions, setHallOptions] = useState([]);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [monthlyBookings, setMonthlyBookings] = useState([]);

  useEffect(() => {
    const fetchHallOptions = async () => {
      try {
        const db = getDatabase();
        const hallOptionsRef = ref(db, "halls");
        const snapshot = await get(hallOptionsRef);

        const options = [];
        snapshot.forEach((child) => {
          options.push({ id: child.key, name: child.val().name });
        });

        setHallOptions(options);
      } catch (err) {
        console.error("حدث خطأ أثناء جلب خيارات الصالات:", err);
        setError("حدث خطأ أثناء جلب الصالات");
      }
    };

    fetchHallOptions();
  }, []);

  const handleHallChange = (e) => {
    setSelectedHall(e.target.value);
  };

  const handleBack = () => {
    navigate("/contact");
  };

  const getMonthlyBookings = (snapshot, selectedDate) => {
    const bookings = [];
    const [year, month] = selectedDate.split("-");
    const monthPrefix = `${year}-${month}`;

    snapshot.forEach((child) => {
      const dateKey = child.key;
      if (dateKey.startsWith(monthPrefix)) {
        const booking = child.val();
        bookings.push({
          date: dateKey,
          name: booking.name || "",
        });
      }
    });

    return bookings.sort((a, b) => a.date.localeCompare(b.date));
  };

  const checkDate = async () => {
    if (!selectedHall) {
      setError("الرجاء تحديد صالة");
      return;
    }

    if (!date) {
      setError("الرجاء تحديد تاريخ");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setMonthlyBookings([]);

    try {
      const db = getDatabase();
      // Check the HallsNames/hallName path
      const hallRef = ref(db, `HallNames/${selectedHall}`);
      const formattedDate = date.replace(/\//g, "-"); // Ensure consistent date format

      const snapshot = await get(hallRef);

      // Check if the specific date exists in Firebase
      const dateSnapshot = await get(
        ref(db, `HallNames/${selectedHall}/${formattedDate}`),
      );
      const isBooked = dateSnapshot.exists();

      if (snapshot.exists()) {
        // Get monthly bookings if the hall exists
        const monthlyBookingsData = getMonthlyBookings(snapshot, formattedDate);
        setMonthlyBookings(monthlyBookingsData);
      }

      // Set the result based on whether the date is booked
      setResult({
        isBooked,
        details: isBooked ? dateSnapshot.val() : null,
        hallName: selectedHall,
      });
    } catch (err) {
      console.error("Error checking date:", err);
      setError("حدث خطأ أثناء التحقق من التاريخ");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={handleBack}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-800"
        >
          <ChevronRight className="w-5 h-5 ml-1" />
          العودة
        </button>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            التحقق من التاريخ
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">حدد الصالة</label>
              <select
                value={selectedHall}
                onChange={handleHallChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">حدد الصالة</option>
                {hallOptions.map((hall) => (
                  <option key={hall.id} value={hall.name}>
                    {hall.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">حدد التاريخ</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <button
              onClick={checkDate}
              disabled={loading}
              className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Calendar className="w-5 h-5 ml-1" />
                  التحقق من التاريخ
                </>
              )}
            </button>

            {error && (
              <Alert variant="destructive" className="text-right">
                <AlertTitle>خطأ</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <Alert
                variant={result.isBooked ? "destructive" : "default"}
                className="text-right"
              >
                {result.isBooked ? (
                  <>
                    <AlertTitle>هذا التاريخ محجوز</AlertTitle>
                  </>
                ) : (
                  <AlertTitle>
                    يمكنك حجز {result.hallName} في هذا التاريخ
                  </AlertTitle>
                )}
              </Alert>
            )}

            {monthlyBookings.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-bold text-lg mb-3 text-right">
                  المواعيد المحجوزة في نفس الشهر:
                </h3>
                <div className="space-y-2">
                  {monthlyBookings.map((booking, index) => (
                    <div key={index} className="p-3 bg-white rounded shadow-sm">
                      <div className="text-right">
                        <p className="font-bold text-gray-800">
                          {formatDate(booking.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckTheDateOfHall;
