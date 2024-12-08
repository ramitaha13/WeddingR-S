import { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  Trash2,
  Calendar,
  Users,
  LogOut,
  Search,
  Mic,
  UserPlus,
  Download,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Edit,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, remove, get } from "firebase/database";
import * as XLSX from "xlsx";

// Initialize Firebase
const firebaseConfig = {
  databaseURL: "https://booking-appointments-4c1b0-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const ROWS_PER_PAGE = 5;

const AdminPage = () => {
  const [hallSearchTerm, setHallSearchTerm] = useState("");
  const [singerSearchTerm, setSingerSearchTerm] = useState("");
  const [halls, setHalls] = useState([]);
  const [totalHalls, setTotalHalls] = useState(0);
  const [singers, setSingers] = useState([]);
  const [totalSingers, setTotalSingers] = useState(0);
  const [currentHallPage, setCurrentHallPage] = useState(1);
  const [currentSingerPage, setCurrentSingerPage] = useState(1);
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

  // Fetch halls data
  useEffect(() => {
    const hallsRef = ref(database, "halls");
    const unsubscribe = onValue(hallsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const hallsArray = Object.entries(data).map(([id, value]) => ({
          id,
          name: value.name,
          capacity: value.capacity,
          location: value.location,
        }));
        setHalls(hallsArray);
        setTotalHalls(hallsArray.length);
      } else {
        setHalls([]);
        setTotalHalls(0);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch singers data
  useEffect(() => {
    const singersRef = ref(database, "Singer");
    const unsubscribe = onValue(singersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const singersArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          name: value.name || key,
          bookings: value.bookings || 0,
        }));
        setSingers(singersArray);
        setTotalSingers(singersArray.length);
      } else {
        setSingers([]);
        setTotalSingers(0);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteHall = async (hallName) => {
    const isConfirmed = window.confirm(
      `هل أنت متأكد من حذف القاعة "${hallName}"؟`,
    );

    if (isConfirmed) {
      try {
        const hallsRef = ref(database, "halls");
        const snapshot = await get(hallsRef);
        const halls = snapshot.val();

        // Find and delete the hall by name
        Object.entries(halls).forEach(async ([key, hall]) => {
          if (hall.name === hallName) {
            const hallRef = ref(database, `halls/${key}`);
            await remove(hallRef);
            const hallNameRef = ref(database, `HallNames/${hallName}`);
            await remove(hallNameRef);
          }
        });
      } catch (error) {
        console.error("Error deleting hall:", error);
      }
    }
  };

  const handleDeleteSinger = async (singerName) => {
    const isConfirmed = window.confirm(
      `هل أنت متأكد من حذف المطرب "${singerName}"؟`,
    );

    if (isConfirmed) {
      try {
        const singersRef = ref(database, "Singer");
        const snapshot = await get(singersRef);
        const singers = snapshot.val();

        // Find and delete the singer by name
        Object.entries(singers).forEach(async ([key, singer]) => {
          if (singer.name === singerName) {
            const singerRef = ref(database, `Singer/${key}`);
            await remove(singerRef);
            const singerNameRef = ref(database, `SingerNames/${singerName}`);
            await remove(singerNameRef);
          }
        });
      } catch (error) {
        console.error("Error deleting singer:", error);
      }
    }
  };

  const handleCreateAccount = (name, type) => {
    navigate("/newaccount", { state: { name, type } });
  };

  const handleLogout = () => {
    navigate("/home");
    localStorage.clear();
  };

  const handleAddNewHall = () => {
    navigate("/newHall");
  };

  const handleAddNewSinger = () => {
    navigate("/newSinger");
  };

  const handleEditHall = (hallName) => {
    navigate(`/admin/edit-hall/${encodeURIComponent(hallName)}`);
  };

  const handleEditSinger = (singerName) => {
    navigate(`/admin/edit-singer/${encodeURIComponent(singerName)}`);
  };

  const filteredHalls = halls.filter((hall) =>
    hall.name.toLowerCase().includes(hallSearchTerm.toLowerCase()),
  );

  const filteredSingers = singers.filter((singer) =>
    singer.name.toLowerCase().includes(singerSearchTerm.toLowerCase()),
  );

  const handleAllAccounts = () => {
    navigate("/alltheaccount");
  };

  const handleAllevents = () => {
    navigate("/alltheevents");
  };

  // Pagination logic
  const paginatedHalls = filteredHalls.slice(
    (currentHallPage - 1) * ROWS_PER_PAGE,
    currentHallPage * ROWS_PER_PAGE,
  );

  const paginatedSingers = filteredSingers.slice(
    (currentSingerPage - 1) * ROWS_PER_PAGE,
    currentSingerPage * ROWS_PER_PAGE,
  );

  const totalHallPages = Math.ceil(filteredHalls.length / ROWS_PER_PAGE);
  const totalSingerPages = Math.ceil(filteredSingers.length / ROWS_PER_PAGE);

  // Excel export functions
  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportHalls = () => {
    exportToExcel(filteredHalls, "Halls_Data");
  };

  const exportSingers = () => {
    exportToExcel(filteredSingers, "Singers_Data");
  };

  const handleBack = () => {
    navigate("/");
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
      {/* Right Sidebar */}
      <div className="w-64 bg-white shadow-lg fixed right-0 h-full">
        {/* Logo Area */}
        <div className="h-16 bg-pink-600 flex items-center justify-center">
          <h1 className="text-white text-xl font-bold">لوحة التحكم</h1>
        </div>

        {/* Admin Menu */}
        <div className="p-6">
          <div className="space-y-4">
            <button className="w-full flex items-center text-gray-700 hover:text-pink-600 py-2">
              <Building2 className="w-5 h-5 ml-2" />
              القاعات
            </button>
            <button className="w-full flex items-center text-gray-700 hover:text-pink-600 py-2">
              <Mic className="w-5 h-5 ml-2" />
              المطربين
            </button>
            <button
              onClick={handleAllevents}
              className="w-full flex items-center text-gray-700 hover:text-pink-600 py-2"
            >
              <Calendar className="w-5 h-5 ml-2" />
              الحجوزات
            </button>
            <button
              onClick={handleAllAccounts}
              className="w-full flex items-center text-gray-700 hover:text-pink-600 py-2"
            >
              <Users className="w-5 h-5 ml-2" />
              العملاء
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">إجمالي القاعات</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {totalHalls}
                </h3>
              </div>
              <div className="bg-pink-100 p-3 rounded-full">
                <Building2 className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">إجمالي المطربين</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {totalSingers}
                </h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Mic className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Halls Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">إدارة القاعات</h2>
            <div className="flex gap-4">
              <button
                onClick={exportHalls}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
              >
                <Download className="w-5 h-5 ml-2" />
                تصدير إلى Excel
              </button>
              <button
                onClick={handleAddNewHall}
                className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors duration-200 flex items-center"
              >
                <Plus className="w-5 h-5 ml-2" />
                إضافة قاعة جديدة
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث عن اسم القاعة..."
                value={hallSearchTerm}
                onChange={(e) => setHallSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
              <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                      اسم القاعة
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                      السعة
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                      الموقع
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedHalls.map((hall) => (
                    <tr key={hall.id}>
                      <td className="px-6 py-4 text-gray-800">{hall.name}</td>
                      <td className="px-6 py-4 text-gray-800">
                        {hall.capacity}
                      </td>
                      <td className="px-6 py-4 text-gray-800">
                        {hall.location}
                      </td>
                      <td className="px-6 py-4 flex items-center space-x-3">
                        <button
                          className="text-red-600 hover:text-red-800 ml-3"
                          onClick={() => handleDeleteHall(hall.name)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                          className="text-blue-600 hover:text-blue-800 ml-3"
                          onClick={() => handleEditHall(hall.name)}
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center"
                          onClick={() => handleCreateAccount(hall.name, "hall")}
                        >
                          <UserPlus className="w-4 h-4 ml-1" />
                          انشاء حساب
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Hall Pagination */}
              <div className="flex justify-center items-center p-4 border-t border-gray-200">
                <button
                  onClick={() =>
                    setCurrentHallPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentHallPage === 1}
                  className="mr-2 px-3 py-1 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <span className="mx-4 text-gray-600">
                  صفحة {currentHallPage} من {totalHallPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentHallPage((prev) =>
                      Math.min(prev + 1, totalHallPages),
                    )
                  }
                  disabled={currentHallPage === totalHallPages}
                  className="ml-2 px-3 py-1 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Singers Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">إدارة المطربين</h2>
            <div className="flex gap-4">
              <button
                onClick={exportSingers}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
              >
                <Download className="w-5 h-5 ml-2" />
                تصدير إلى Excel
              </button>
              <button
                onClick={handleAddNewSinger}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center"
              >
                <Plus className="w-5 h-5 ml-2" />
                إضافة مطرب جديد
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث عن اسم المطرب..."
                value={singerSearchTerm}
                onChange={(e) => setSingerSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                      اسم المطرب
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedSingers.map((singer) => (
                    <tr key={singer.id}>
                      <td className="px-6 py-4 text-gray-800">{singer.name}</td>
                      <td className="px-6 py-4 flex items-center space-x-3">
                        <button
                          className="text-red-600 hover:text-red-800 ml-3"
                          onClick={() => handleDeleteSinger(singer.name)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                          className="text-blue-600 hover:text-blue-800 ml-3"
                          onClick={() => handleEditSinger(singer.name)}
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center"
                          onClick={() =>
                            handleCreateAccount(singer.name, "singer")
                          }
                        >
                          <UserPlus className="w-4 h-4 ml-1" />
                          انشاء حساب
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Singer Pagination */}
              <div className="flex justify-center items-center p-4 border-t border-gray-200">
                <button
                  onClick={() =>
                    setCurrentSingerPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentSingerPage === 1}
                  className="mr-2 px-3 py-1 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <span className="mx-4 text-gray-600">
                  صفحة {currentSingerPage} من {totalSingerPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentSingerPage((prev) =>
                      Math.min(prev + 1, totalSingerPages),
                    )
                  }
                  disabled={currentSingerPage === totalSingerPages}
                  className="ml-2 px-3 py-1 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
