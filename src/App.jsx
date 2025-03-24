import Register from "./pages/RegisterPage/Register";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage";
import { useState, useEffect } from "react";
import HomePage from "./pages/HomePage/HomePage";
import JobDetails from "./pages/JobDetails/JobDetails";
import JobPage from "./pages/JobPage/JobPage";
import TrainingPage from "./pages/TrainingPage/TrainingPage";

function App() {

  const [hasToken, sethasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("iap-final-token");
    if (token) {
      sethasToken(true);
    }else{
      sethasToken(false);
    }
  }, []);

  return (
  
      <div>
        {hasToken ? 
          <Routes>
          <Route element={<Navigate to={"/home"} />} path="*"></Route>
          <Route element={<HomePage />} path="/home"></Route>
          <Route element={<JobDetails />} path="/jobdetails"></Route>
          <Route element={<JobPage />} path="/jobs"></Route>
          <Route element={<TrainingPage />} path="/training programs"></Route>

         
        </Routes>
         : 
          <Routes>
            <Route element={<Navigate to={"/login"} />} path="*"></Route>
            <Route element={<HomePage />} path="/"></Route>
            <Route element={<LoginPage />} path="/login"></Route>
            <Route element={<Register />} path="/register"></Route>
           
          </Routes>
        }
      </div>
   
  );
}

export default App
