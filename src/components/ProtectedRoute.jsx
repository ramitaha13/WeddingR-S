import { Navigate } from "react-router-dom";

// Example: Replace this with your actual authentication logic
const isAuthenticated = () => {
  return !!localStorage.getItem("userData");
};

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
