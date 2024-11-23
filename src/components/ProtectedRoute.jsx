import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

// Example: Replace this with your actual authentication logic
const isAuthenticated = () => {
  return !!localStorage.getItem("userData");
};

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
