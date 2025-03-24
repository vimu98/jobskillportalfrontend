import React, { useRef, useEffect } from "react";
import { Box, IconButton } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import { Navigation, Autoplay } from "swiper/modules";
import JobCard from "../JobCard/JobCard";

const jobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "Google",
    location: "Colombo, Sri Lanka",
    salary: "$70,000 - $90,000",
    logo: "https://logo.clearbit.com/google.com",
    description: "We are looking for a skilled React developer to join our team.",
  },
  {
    id: 2,
    title: "Backend Developer",
    company: "Amazon",
    location: "Kandy, Sri Lanka",
    salary: "$80,000 - $100,000",
    logo: "https://logo.clearbit.com/amazon.com",
    description: "Experienced Node.js developer needed for a large-scale project.",
  },
  {
    id: 3,
    title: "UI/UX Designer",
    company: "Figma",
    location: "Remote",
    salary: "$50,000 - $70,000",
    logo: "https://logo.clearbit.com/figma.com",
    description: "Seeking a creative UI/UX designer for product innovation.",
  },
  {
    id: 4,
    title: "Data Scientist",
    company: "Microsoft",
    location: "Seattle, USA",
    salary: "$100,000 - $120,000",
    logo: "https://logo.clearbit.com/microsoft.com",
    description: "Work with AI and big data to drive business insights.",
  },
];

const SuggetionCarousel = () => {
  const swiperRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.params.navigation.prevEl = prevRef.current;
      swiperRef.current.swiper.params.navigation.nextEl = nextRef.current;
      swiperRef.current.swiper.navigation.init();
      swiperRef.current.swiper.navigation.update();
    }
  }, []);

  return (
    <Box sx={{ textAlign: "center", my: 5 }}>
      <Box
        sx={{
          maxWidth: "1000px",
          mx: "auto",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* SwiperJS Carousel with Auto-Rotate */}
        <Swiper
          ref={swiperRef}
          spaceBetween={200}
          slidesPerView={3}
          loop={true}
          autoplay={{
            delay: 3000, // Auto-slide every 3 seconds
            disableOnInteraction: false,
          }}
          breakpoints={{
            768: { slidesPerView: 3 },
          }}
          modules={[Navigation, Autoplay]}
        >
          {jobs.map((job) => (
            <SwiperSlide key={job.id}>
              <JobCard job={job} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
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
      </Box>
    </Box>
  );
};

export default SuggetionCarousel;
