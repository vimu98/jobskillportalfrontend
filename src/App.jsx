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
import CompanyPage from "./pages/CompanyPage/CompanyPage";
import VacancyPage from "./pages/VacancyPage/VacancyPage";
import ApplicationsPage from "./pages/ApplicaionsPage/ApplicationsPage";
import { JobsProvider } from "./context/JobsProvider";

function App() {
  const [hasToken, sethasToken] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("iap-final-token");
    sethasToken(!!token);
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <AuthProvider>
      <JobsProvider>
        {hasToken ? (
          <Routes>
            {/* Common routes for authenticated users */}
            <Route
              element={
                <PrivateRoute allowedRoles={["JOB_SEEKER", "EMPLOYER"]} />
              }
            >
              <Route element={<ProfilePage />} path="/profile" />
            </Route>

            {/* Routes for Job Seekers */}
            <Route element={<PrivateRoute allowedRoles={["JOB_SEEKER"]} />}>
              <Route element={<TrainingPage />} path="/training-programs" />
              <Route element={<HomePage />} path="/home" />
              <Route element={<JobDetails />} path="/jobdetails" />
              <Route element={<JobPage />} path="/jobs" />
              <Route element={<Navigate to={"/home"} />} path="*" />
            </Route>

            
            {/* Routes for Employers */}
            <Route element={<PrivateRoute allowedRoles={["EMPLOYER"]} />}>
            
              <Route element={<CompanyPage />} path="/manage-companies" />
              <Route element={<VacancyPage />} path="/manage-vacansies" />
              <Route element={<ApplicationsPage />} path="/manage-applications" />
              
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
        </JobsProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
