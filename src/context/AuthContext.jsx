import { createContext, useContext, useEffect, useState } from "react";
import instance from "../service/AxiosOrder";
import { jwtDecode } from "jwt-decode";

// Create context
const AuthContext = createContext();

// Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [resume, setResume] = useState(null);
  const[role, setRole] = useState(null);

  // Fetch user details from backend
  const fetchUser = async (id) => {
    try {
      const response = await instance.get(`/auth/user/${id}`);
      setUser(response.data);
      if (response.data.role === "JOB_SEEKER") {
        setResume(response.data.resumeUrl);
        fetchResume(response.data.id);
      }
      
      console.log("User fetched:", response.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    }
  };

  const fetchResume = async (id) => {
    try {
      const response = await instance.get(`/resumes/user/${id}`);
      setResume(response.data[0].resumeUrl);
      console.log("Resume fetched:", response.data[0].resumeUrl);
    } catch (error) {
      console.error("Error fetching resume:", error);
      setResume(null);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await instance.post("/auth/login", { email, password });
      const token = response.data;

      // Store token in localStorage
      localStorage.setItem("iap-final-token", token);

      // Decode token
      const decodedToken = jwtDecode(token);
      const { role, id } = decodedToken;

      // Store role
      localStorage.setItem("iap-final-role", role);
      setRole(role);
      console.log("User role:", role);

      // Fetch user details
      await fetchUser(id);

      return role; // Return role for navigation
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("iap-final-token");
    localStorage.removeItem("iap-final-role");
    setUser(null);
  };

  // Auto-fetch user if token exists
  useEffect(() => {
    const token = localStorage.getItem("iap-final-token");
    if (token) {
      const decodedToken = jwtDecode(token);
      fetchUser(decodedToken.id);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, resume, setResume, setUser, role }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);
