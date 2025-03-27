import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ allowedRoles }) => {
  const role = localStorage.getItem("iap-final-role"); // Get user role from localStorage

  console.log("Role:", role);


  return allowedRoles.includes(role) ? <Outlet /> : <Navigate to="/home" />;
};

export default PrivateRoute;
