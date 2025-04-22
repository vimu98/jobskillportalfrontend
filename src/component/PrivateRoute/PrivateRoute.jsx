import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

const PrivateRoute = ({ allowedRoles }) => {
  const [role, setRole] = useState(localStorage.getItem("iap-final-role"));
  const [defaltNavigate, setDefaultNavigate] = useState("/home");

  useEffect(() => {
    if (role === "JOB_SEEKER") {
      setDefaultNavigate("/home");
    } else if (role === "EMPLOYER") {
      setDefaultNavigate("/manage-vacansies");
    } else if (role === "ADMIN") {
      setDefaultNavigate("/admindash");
    } else if (role === "TRAINER") {
      setDefaultNavigate("/manage-courses");
    }
  }, [role]); 

  useEffect(() => {
    const checkRole = () => {
      setRole(localStorage.getItem("iap-final-role"));
    };

    window.addEventListener("storage", checkRole); // Listen for localStorage changes

    return () => {
      window.removeEventListener("storage", checkRole); // Cleanup
    };
  }, []);

  

  console.log("Allowed Roles:", allowedRoles);
  console.log("Role:", role);

  return allowedRoles.includes(role?.trim()) ? <Outlet /> : <Navigate to={defaltNavigate} />;
};

export default PrivateRoute;
