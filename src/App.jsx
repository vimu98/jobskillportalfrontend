import { Navigate, Route, Routes } from "react-router-dom";
import Register from "./pages/RegisterPage/Register";
import LoginPage from "./pages/LoginPage/LoginPage";
import HomePage from "./pages/HomePage/HomePage";
import JobDetails from "./pages/JobDetails/JobDetails";
import JobPage from "./pages/JobPage/JobPage";
import TrainingPage from "./pages/TrainingPage/TrainingPage";
import PrivateRoute from "./component/PrivateRoute/PrivateRoute"; 
import { useState, useEffect } from "react";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import { AuthProvider } from "./context/AuthContext";

function App() {
  const [hasToken, sethasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("iap-final-token");
    sethasToken(!!token);
  }, []);

  return (
    <div>
      <AuthProvider>
      {hasToken ? (
        <Routes>
          <Route element={<Navigate to={"/home"} />} path="*" />
          <Route element={<HomePage />} path="/home" />
          <Route element={<JobDetails />} path="/jobdetails" />
          <Route element={<JobPage />} path="/jobs" />
          <Route element={<ProfilePage />} path="/profile" />

          {/* ✅ Training Page only accessible to Admin */}
          <Route element={<PrivateRoute allowedRoles={["ADMIN", "JOB_SEEKER"]} />}>
            <Route element={<TrainingPage />} path="/training programs" />
          </Route>
        </Routes>
      ) : (
        <Routes>
          <Route element={<Navigate to={"/login"} />} path="*" />
          <Route element={<HomePage />} path="/" />
          <Route element={<LoginPage />} path="/login" />
          <Route element={<JobDetails />} path="/jobdetails" />
          <Route element={<JobPage />} path="/jobs" />
          <Route element={<Register />} path="/register" />
        </Routes>
      )}
      </AuthProvider>
    </div>
  );
}

export default App;
