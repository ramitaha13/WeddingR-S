import React, { createContext, useContext, useState } from "react";

// إنشاء سياق
const AuthContext = createContext();

// مزود السياق
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // حالة تسجيل الدخول

  // دوال لتسجيل الدخول والخروج
  const login = () => setIsLoggedIn(true);
  const logout = () => setIsLoggedIn(false);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// استخدام السياق في أي مكان
export const useAuth = () => useContext(AuthContext);
