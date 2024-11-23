import React, { useState, useEffect } from "react";
import { Search, ArrowRight, Trash2, Users, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, onValue, remove } from "firebase/database";

const AllTheAccount = () => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    username: "",
    password: "",
    email: "",
    hallName: "",
    phone: "",
  });
  const navigate = useNavigate();
  const database = getDatabase();
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
    const usersRef = ref(database, "users");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray = Object.keys(data).map((userId) => ({
          id: userId,
          username: data[userId].username || userId,
          password: data[userId].password || "",
          email: data[userId].email || "",
          hallName: data[userId].hallName || "",
          phone: data[userId].phone || "",
        }));
        setUsers(usersArray);
      } else {
        setUsers([]);
      }
    });

    return () => unsubscribe();
  }, [database]);

  const handleDelete = async (userId) => {
    try {
      const userRef = ref(database, `users/${userId}`);
      await remove(userRef);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleBack = () => {
    navigate("/admin");
  };

  const handleFilterChange = (field) => (e) => {
    setFilters((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      username: "",
      password: "",
      email: "",
      hallName: "",
      phone: "",
    });
  };

  const filteredUsers = users.filter((user) => {
    return (
      user.username?.toLowerCase().includes(filters.username.toLowerCase()) &&
      user.password?.toLowerCase().includes(filters.password.toLowerCase()) &&
      user.email?.toLowerCase().includes(filters.email.toLowerCase()) &&
      user.hallName?.toLowerCase().includes(filters.hallName.toLowerCase()) &&
      user.phone?.toLowerCase().includes(filters.phone.toLowerCase())
    );
  });

  const handleBackforAdmin = () => {
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
              onClick={handleBackforAdmin}
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
        <div className="h-16 bg-pink-600 flex items-center justify-center">
          <h1 className="text-white text-xl font-bold">قاعات الأفراح</h1>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            إدارة المستخدمين
          </h2>
          <p className="text-gray-600 mb-4">
            قم بإدارة حسابات المستخدمين وعرض تفاصيلهم
          </p>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <span className="text-pink-500 ml-2">•</span>
              عرض المستخدمين
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-pink-500 ml-2">•</span>
              حذف المستخدمين
            </div>
            <div className="flex items-center text-gray-600">
              <span className="text-pink-500 ml-2">•</span>
              البحث عن المستخدمين
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mr-64 flex-1 p-6">
        <button
          onClick={handleBack}
          className="mb-6 flex items-center text-gray-600 hover:text-pink-600 transition-colors duration-200"
        >
          <ArrowRight className="w-5 h-5 ml-2" />
          العودة للرئيسية
        </button>

        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-pink-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                قائمة المستخدمين
              </h2>
              <p className="text-gray-600 mt-2">
                عرض وإدارة جميع حسابات المستخدمين
              </p>
              <div className="mt-4 bg-pink-50 text-pink-700 py-2 px-4 rounded-full inline-block">
                <span className="font-semibold">عدد المستخدمين: </span>
                {filteredUsers.length} من {users.length}
              </div>
              {Object.values(filters).some((filter) => filter) && (
                <button
                  onClick={clearFilters}
                  className="mr-4 text-sm text-pink-600 hover:text-pink-800"
                >
                  مسح عوامل التصفية
                </button>
              )}
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {/* Search Headers */}
                    <th className="px-6 py-3">
                      <div className="space-y-2">
                        <div className="text-right text-sm font-medium text-gray-500">
                          اسم المستخدم
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={filters.username}
                            onChange={handleFilterChange("username")}
                            placeholder="بحث..."
                            className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                          <Search className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                        </div>
                      </div>
                    </th>
                    <th className="px-6 py-3">
                      <div className="space-y-2">
                        <div className="text-right text-sm font-medium text-gray-500">
                          كلمة المرور
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={filters.password}
                            onChange={handleFilterChange("password")}
                            placeholder="بحث..."
                            className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                          <Search className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                        </div>
                      </div>
                    </th>
                    <th className="px-6 py-3">
                      <div className="space-y-2">
                        <div className="text-right text-sm font-medium text-gray-500">
                          البريد الإلكتروني
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={filters.email}
                            onChange={handleFilterChange("email")}
                            placeholder="بحث..."
                            className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                          <Search className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                        </div>
                      </div>
                    </th>
                    <th className="px-6 py-3">
                      <div className="space-y-2">
                        <div className="text-right text-sm font-medium text-gray-500">
                          اسم القاعة
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={filters.hallName}
                            onChange={handleFilterChange("hallName")}
                            placeholder="بحث..."
                            className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                          <Search className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                        </div>
                      </div>
                    </th>
                    <th className="px-6 py-3">
                      <div className="space-y-2">
                        <div className="text-right text-sm font-medium text-gray-500">
                          رقم الهاتف
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={filters.phone}
                            onChange={handleFilterChange("phone")}
                            placeholder="بحث..."
                            className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                          <Search className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                        </div>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                      حذف
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-800">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 text-gray-800">
                        {user.password}
                      </td>
                      <td className="px-6 py-4 text-gray-800">{user.email}</td>
                      <td className="px-6 py-4 text-gray-800">
                        {user.hallName}
                      </td>
                      <td className="px-6 py-4 text-gray-800">{user.phone}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-full hover:bg-red-50"
                        >
                          <Trash2 className="w-5 h-5" />
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
    </div>
  );
};

export default AllTheAccount;
