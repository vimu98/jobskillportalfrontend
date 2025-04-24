import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  List,
  ListItem,
  ListItemText,
  Collapse,
  IconButton,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../component/NavBar/Navbar";

const RegisteredStudents = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [usersByCourse, setUsersByCourse] = useState({});
  const [expandedCourses, setExpandedCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoursesAndUsers = async () => {
      if (!user?.id) {
        setError("Please log in to view your courses.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch courses for the logged-in user
        const coursesRes = await axios.get(`http://localhost:8080/api/courses/published-by/${user.id}`);
        const fetchedCourses = coursesRes.data;
        setCourses(fetchedCourses);

        const usersMap = {};

        // For each course, fetch enrolled user IDs and their details
        await Promise.all(
          fetchedCourses.map(async (course) => {
            try {
              // Fetch user IDs enrolled in this course
              const userIdsRes = await axios.get(
                `http://localhost:8080/api/enroll/course/${course.id}/users`
              );
              const userIds = userIdsRes.data;

              // Fetch user details for each user ID
              const userDetails = await Promise.all(
                userIds.map(async (userId) => {
                  try {
                    const userRes = await axios.get(
                      `http://localhost:8080/api/auth/user/${userId}`
                    );
                    console.log("User Details:", userRes.data);
                    return userRes.data; // UserDTO with name and email
                  } catch (err) {
                    console.error(`Failed to fetch user ${userId}:`, err);
                    return null;
                  }
                })
              );

              // Filter out any failed user fetches
              usersMap[course.id] = userDetails.filter((user) => user !== null);
            } catch (err) {
              console.error(`Failed to fetch users for course ${course.id}:`, err);
              usersMap[course.id] = [];
            }
          })
        );

        setUsersByCourse(usersMap);
      } catch (err) {
        console.error("Error fetching courses or users:", err);
        setError("Failed to fetch data: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesAndUsers();
  }, [user]);

  const toggleCourse = (courseId) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  return (
    <Box>
        <Navbar />
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Registered Users by Course
      </Typography>

      {loading ? (
        <Typography variant="h6" align="center">
          Loading courses and users...
        </Typography>
      ) : error ? (
        <Typography variant="h6" align="center" color="error">
          {error}
        </Typography>
      ) : courses.length === 0 ? (
        <Typography variant="h6" align="center">
          No courses found.
        </Typography>
      ) : (
        <Grid container spacing={4}>
          {courses.map((course) => (
            <Grid item xs={12} key={course.id}>
              <Card sx={{ p: 3, borderRadius: 3, boxShadow: 4 }}>
                <ListItem
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#e0e0e0",
                    borderRadius: 1,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}
                    onClick={() => toggleCourse(course.id)}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography variant="h5" gutterBottom sx={{ mr: 2 }}>
                            {course.title}
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            ({(usersByCourse[course.id] || []).length} Registered Users)
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                  <IconButton onClick={() => toggleCourse(course.id)}>
                    <ExpandMoreIcon
                      sx={{
                        transform: expandedCourses[course.id]
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s",
                      }}
                    />
                  </IconButton>
                </ListItem>

                <Collapse
                  in={expandedCourses[course.id]}
                  timeout="auto"
                  unmountOnExit
                >
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Registered Users
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  {(usersByCourse[course.id] || []).length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No users registered for this course.
                    </Typography>
                  ) : (
                    <List>
                      {(usersByCourse[course.id] || []).map((user, index) => (
                        <ListItem
                          key={user.id || index}
                          sx={{ borderBottom: "1px solid #ddd" }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="body1">
                                {user.name || "Unknown"}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" color="text.secondary">
                                {user.email || "N/A"}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Collapse>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
    </Box>
  );
};

export default RegisteredStudents;