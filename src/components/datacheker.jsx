import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDatabase, ref, get } from "firebase/database";
import { Calendar, ChevronRight, Loader2 } from "lucide-react";

const DateChecker = () => {
  const { hallId } = useParams();
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [monthlyBookings, setMonthlyBookings] = useState([]);
  const [hallName, setHallName] = useState("");

  useEffect(() => {
    const fetchHallName = async () => {
      try {
        const db = getDatabase();
        const hallInfoRef = ref(db, `Halls/${hallId}`);
        const snapshot = await get(hallInfoRef);

        if (snapshot.exists()) {
          setHallName(snapshot.val().name);
        } else {
          setError("");
        }
      } catch (err) {
        console.error("خطأ في جلب اسم الصالة:", err);
      }
    };

    fetchHallName();
  }, [hallId]);

  const handleBack = () => {
    navigate(`/Login/${hallId}`);
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
    if (!date) {
      setError("الرجاء اختيار تاريخ");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setMonthlyBookings([]);

    try {
      const db = getDatabase();
      const hallRef = ref(db, `HallNames/${hallId}`);
      const formattedDate = date.split("-").join("-");

      const snapshot = await get(hallRef);
      let isBooked = false;
      let bookingDetails = null;

      if (snapshot.exists()) {
        const dateExists = snapshot.hasChild(formattedDate);

        if (dateExists) {
          isBooked = true;
          const dateData = snapshot.child(formattedDate).val();
          bookingDetails = {
            name: dateData.name || "",
          };

          const monthlyBookingsData = getMonthlyBookings(
            snapshot,
            formattedDate,
          );
          setMonthlyBookings(monthlyBookingsData);
        }
      }

      setResult({
        isBooked,
        details: bookingDetails,
        hallName,
      });
    } catch (err) {
      setError("حدث خطأ أثناء التحقق من التاريخ");
      console.error(err);
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
              <label className="block text-gray-700 mb-2">اختر التاريخ</label>
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
              <div className="p-4 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {result && (
              <div
                className={`p-4 rounded-md ${
                  result.isBooked
                    ? "bg-red-50 text-red-700"
                    : "bg-green-50 text-green-700"
                }`}
              >
                {result.isBooked ? (
                  <>
                    <p className="font-bold mb-2">هذا التاريخ محجوز</p>
                    <div className="text-right">
                      <p>اسم العميل: {result.details.name}</p>
                    </div>
                  </>
                ) : (
                  <div className="text-right">
                    <p className="font-bold">
                      يمكنك الحجز في {hallName} في هذا التاريخ
                    </p>
                  </div>
                )}
              </div>
            )}

            {monthlyBookings.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-bold text-lg mb-3 text-right">
                  التواريخ المحجوزة في نفس الشهر:
                </h3>
                <div className="space-y-2">
                  {monthlyBookings.map((booking, index) => (
                    <div key={index} className="p-3 bg-white rounded shadow-sm">
                      <div className="text-right">
                        <p className="font-bold text-gray-800">
                          {formatDate(booking.date)}
                        </p>
                        <p className="text-gray-600">
                          اسم العميل: {booking.name}
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

export default DateChecker;
