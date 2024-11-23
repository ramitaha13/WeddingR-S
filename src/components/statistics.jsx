import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import * as XLSX from "xlsx";

// Translations object
const translations = {
  ar: {
    title: "إحصائيات الحجوزات",
    uploadExcel: "تحميل ملف Excel",
    year: "السنة",
    month: "الشهر",
    allYears: "كل السنوات",
    allMonths: "كل الشهور",
    downloadExcel: "تحميل كملف Excel",
    searchResults: "نتائج البحث",
    bookings: "حجز",
    bookingDate: "تاريخ الحجز",
    customerName: "اسم الزبون",
    phoneNumber: "رقم الهاتف",
    undefined: "غير محدد",
    page: "صفحة",
    of: "من",
    previous: "السابق",
    next: "التالي",
    back: "العودة",
    dir: "rtl",
  },
  he: {
    title: "סטטיסטיקת הזמנות",
    uploadExcel: "העלה קובץ אקסל",
    year: "שנה",
    month: "חודש",
    allYears: "כל השנים",
    allMonths: "כל החודשים",
    downloadExcel: "הורד כקובץ אקסל",
    searchResults: "תוצאות חיפוש",
    bookings: "הזמנות",
    bookingDate: "תאריך הזמנה",
    customerName: "שם הלקוח",
    phoneNumber: "מספר טלפון",
    undefined: "לא מוגדר",
    page: "דף",
    of: "מתוך",
    previous: "הקודם",
    next: "הבא",
    back: "חזור",
    dir: "rtl",
  },
  en: {
    title: "Booking Statistics",
    uploadExcel: "Upload Excel File",
    year: "Year",
    month: "Month",
    allYears: "All Years",
    allMonths: "All Months",
    downloadExcel: "Download as Excel",
    searchResults: "Search Results",
    bookings: "bookings",
    bookingDate: "Booking Date",
    customerName: "Customer Name",
    phoneNumber: "Phone Number",
    undefined: "Undefined",
    page: "Page",
    of: "of",
    previous: "Previous",
    next: "Next",
    back: "Back",
    dir: "ltr",
  },
};

const StatisticsPage = () => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [language, setLanguage] = useState("ar"); // Default language is Arabic
  const rowsPerPage = 10;
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const hallId = queryParams.get("hallId");

  const t = translations[language]; // Current language translations

  const handleBack = () => {
    try {
      navigate(-1);
    } catch (error) {
      // Fallback if there's no previous route
      navigate("/");
    }
  };

  // Generate months 1-12
  const months = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    return {
      value: String(monthNum).padStart(2, "0"),
      label: monthNum,
    };
  });

  const parseDateString = (dateStr) => {
    const [day, month, year] = dateStr.split("-").map((part) => part.trim());
    return new Date(year, parseInt(month) - 1, day);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const workbook = XLSX.read(e.target.result, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const excelData = XLSX.utils.sheet_to_json(worksheet, {
          header: ["bookingDate", "customerName", "phone", "adeb"],
        });

        excelData.shift();

        const processedData = excelData
          .map((row) => {
            const date = parseDateString(row.bookingDate);
            return {
              ...row,
              date: date,
              year: date.getFullYear(),
              month: String(date.getMonth() + 1).padStart(2, "0"),
            };
          })
          .filter((row) => !isNaN(row.date.getTime()));

        const years = [...new Set(processedData.map((item) => item.year))].sort(
          (a, b) => b - a,
        );

        setData(processedData);
        setAvailableYears(years);
        if (years.length > 0) {
          setSelectedYear(years[0].toString());
        }
        setCurrentPage(1);
      };
      reader.readAsBinaryString(selectedFile);
    }
  };

  useEffect(() => {
    let filtered = [...data];

    if (selectedYear) {
      filtered = filtered.filter(
        (item) => item.year.toString() === selectedYear,
      );
    }

    if (selectedMonth) {
      filtered = filtered.filter((item) => item.month === selectedMonth);
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [data, selectedYear, selectedMonth]);

  const handleExport = () => {
    const exportData = filteredData.map((row) => ({
      [t.bookingDate]: row.bookingDate,
      [t.customerName]: row.customerName || t.undefined,
      [t.phoneNumber]: row.phone || t.undefined,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    const fileName = `bookings${selectedYear ? `-${selectedYear}` : ""}${selectedMonth ? `-${selectedMonth}` : ""}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div dir={t.dir} className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Language Selector */}
          <div className="mb-4 flex justify-end">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="p-2 border rounded-md"
            >
              <option value="ar">العربية</option>
              <option value="he">עברית</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="mb-4 flex justify-between">
            <button
              onClick={handleBack}
              className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700"
            >
              <ArrowRight className="ml-2" size={20} />
              {t.back || "Back"}{" "}
              {/* Add translation for "back" in your translations object */}
            </button>
          </div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">{t.title}</h1>
          </div>

          <div className="mb-6">
            <label
              htmlFor="file-input"
              className="block text-gray-800 font-medium mb-2"
            >
              {t.uploadExcel}
            </label>
            <input
              id="file-input"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 w-full"
            />
          </div>

          {data.length > 0 && (
            <div className="space-y-6">
              <div className="flex gap-4 mb-6">
                <div className="w-1/2">
                  <label className="block text-gray-800 font-medium mb-2">
                    {t.year}
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">{t.allYears}</option>
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-800 font-medium mb-2">
                    {t.month}
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">{t.allMonths}</option>
                    {months.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <button
                  onClick={handleExport}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  {t.downloadExcel}
                </button>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  {t.searchResults} ({filteredData.length} {t.bookings})
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-right border">
                          {t.bookingDate}
                        </th>
                        <th className="px-4 py-3 text-right border">
                          {t.customerName}
                        </th>
                        <th className="px-4 py-3 text-right border">
                          {t.phoneNumber}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 border">
                            {row.bookingDate}
                          </td>
                          <td className="px-4 py-3 border">
                            {row.customerName || t.undefined}
                          </td>
                          <td className="px-4 py-3 border">
                            {row.phone || t.undefined}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    {t.page} {currentPage} {t.of} {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                    >
                      {t.previous}
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                    >
                      {t.next}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
