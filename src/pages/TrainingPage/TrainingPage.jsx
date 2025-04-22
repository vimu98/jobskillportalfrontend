import React, { useEffect, useState } from "react";
import axios from "axios";
import { Grid, TextField, Typography } from "@mui/material";
import Navbar from "../../component/NavBar/Navbar";
import CourseCard from "../../component/CourseCard/CourseCard";

const CoursesPage = () => {
  const [allCourses, setAllCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/courses");
        setAllCourses(response.data);
        setFilteredCourses(response.data);
      } catch (error) {
        console.error("API Error:", error);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const filtered = allCourses.filter((course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [searchTerm, allCourses]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div>
      <Navbar />

      {/* Search Bar */}
      <Grid container spacing={2} padding={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Search by Course Title or Category"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search courses..."
          />
        </Grid>
      </Grid>

      {/* Courses List */}
      <Grid container spacing={2} padding={2}>
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <Grid item key={course.id} xs={12} sm={6} md={4} lg={3}>
              <CourseCard course={course} />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="h6" align="center">
              No courses found
            </Typography>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default CoursesPage;
