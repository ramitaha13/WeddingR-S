import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";

// إنشاء سياق
const AuthContext = createContext();

// مزود السياق
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // حالة تسجيل الدخول

  // دوال لتسجيل الدخول والخروج
  const login = () => setIsLoggedIn(true);
  const logout = () => setIsLoggedIn(false);
  AuthProvider.propTypes = {
    children: PropTypes.node, // Define children as a node, which can be any valid React child (string, number, element, etc.)
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// استخدام السياق في أي مكان
export const useAuth = () => useContext(AuthContext);
