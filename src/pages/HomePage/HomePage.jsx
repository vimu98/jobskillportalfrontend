import React, { useEffect, useState } from "react";
import JobCard from "../../component/JobCard/JobCard";
import axios from "axios";
import Navbar from "../../component/NavBar/Navbar";
import { Grid, Pagination, Typography } from "@mui/material";
import CustomPagination from "../../component/Pagination/CustomPagination";
import HeroSection from "../../component/HeroSection/HeroSection";
import SuggetionCarousel from "../../component/SuggetionCarousel/SuggetionCarousel";

const HomePage = () => {
  const jobsPerPage = 12; 
  const [currentPage, setCurrentPage] = useState(1);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/jobs/all", {
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("iap-final-token"),
        },
      })
      .then((response) => {
        console.log(response.data);
        setJobs(response.data); 
      })
      .catch((error) => {
        console.error(" API Error:", error);
      });
  }, []);

  console.log(localStorage.getItem("iap-final-token"));

  const totalPages = Math.ceil(jobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const displayedJobs = jobs.slice(startIndex, startIndex + jobsPerPage);
  
 

  return (
    <div>
      <Navbar />
      <HeroSection />
      <SuggetionCarousel />
      <Grid container spacing={2} padding={2}>
        {displayedJobs.length > 0 ? (
          displayedJobs.map((job) => (
            <Grid item key={job.id} xs={12} sm={6} md={4} lg={3}>
              <JobCard job={job} />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="h6" align="center">
              No jobs available
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* Pagination Component */}
      {totalPages > 1 && (
        <CustomPagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default HomePage;
