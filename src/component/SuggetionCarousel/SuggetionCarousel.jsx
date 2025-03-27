import React, { useRef, useEffect, useState } from "react";
import { Box, IconButton, CircularProgress, Typography } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import { Navigation, Autoplay } from "swiper/modules";
import JobCard from "../JobCard/JobCard";
import axios from "axios";
import { useAuth } from "./../../context/AuthContext";

const SuggetionCarousel = () => {
  const swiperRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const { resume } = useAuth(); // Resume URL from Auth Context
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Loading state

  // Fetch job suggestions when resume URL changes
  useEffect(() => {
    if (!resume) return; // Avoid API call if resume URL is missing

    const postJobMatch = async () => {
      console.log("📄 Resume URL:", resume);
      setIsLoading(true);

      try {
        const response = await axios.post(
          "http://localhost:8080/api/jobs/match-jobs",
          { resumeUrl: resume },
          { headers: { "Content-Type": "application/json" } }
        );

        console.log("✅ API Response:", response.data);

        if (Array.isArray(response.data) && response.data.length > 0) {
          setJobs(response.data);
        } else {
          console.warn("⚠️ No jobs found for the given resume.");
          setJobs([]);
        }
      } catch (error) {
        console.error("❌ API Error:", error.response ? error.response.data : error.message);
      } finally {
        setIsLoading(false);
      }
    };

    postJobMatch();
  }, [resume]); // Fetch jobs when `resume` changes

  return (
    <Box sx={{ textAlign: "center", marginBottom : 4}}>
      {/* Job Suggestions Count */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#333" }}>
        {isLoading ? "Loading job suggestions..." : `Found ${jobs.length} job suggestions`}
      </Typography>

      <Box
        sx={{
          maxWidth: "1000px",
          mx: "auto",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : jobs.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 5, color: "gray" }}>
            No job suggestions found.
          </Box>
        ) : (
          <Swiper
            ref={swiperRef}
            spaceBetween={100}
            slidesPerView={Math.min(3, jobs.length)} // Prevent errors
            loop={jobs.length > 3} // Enable loop only if more than 3 jobs
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
            modules={[Navigation, Autoplay]}
            onSwiper={(swiper) => {
              setTimeout(() => {
                if (prevRef.current && nextRef.current) {
                  swiper.params.navigation.prevEl = prevRef.current;
                  swiper.params.navigation.nextEl = nextRef.current;
                  swiper.navigation.init();
                  swiper.navigation.update();
                }
              }, 100);
            }}
          >
            {jobs.map((job) => (
              <SwiperSlide key={job.id}>
                <JobCard job={job} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* Navigation Buttons (only if jobs exist) */}
        {jobs.length > 0 && (
          <>
            <IconButton
              ref={prevRef}
              sx={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                backgroundColor: "white",
              }}
            >
              <ArrowBack />
            </IconButton>
            <IconButton
              ref={nextRef}
              sx={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                backgroundColor: "white",
              }}
            >
              <ArrowForward />
            </IconButton>
          </>
        )}
      </Box>
    </Box>
  );
};

export default SuggetionCarousel;
