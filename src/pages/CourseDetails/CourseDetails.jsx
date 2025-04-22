import { useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Card, Grid, List, ListItem, ListItemText, Divider, Collapse, IconButton, CircularProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const CourseDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const course = location.state?.course;

  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [lessonsByModule, setLessonsByModule] = useState({});
  const [expandedModules, setExpandedModules] = useState({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);
  const [courseProgress, setCourseProgress] = useState(0);  // Initialize progress to 0

  useEffect(() => {
    const fetchModulesAndLessons = async () => {
      if (!course?.id) return;

      try {
        // Fetch all modules
        const moduleRes = await axios.get(`http://localhost:8080/api/modules/by-course/${course.id}`);
        const modulesData = moduleRes.data;
        setModules(modulesData);

        const lessonsMap = {};
        let totalLessons = 0;
        let completedLessons = 0;

        // Fetch lessons for each module and calculate initial progress
        await Promise.all(
          modulesData.map(async (module) => {
            try {
              const lessonRes = await axios.get(`http://localhost:8080/api/lessons/by-module/${module.id}`);
              lessonsMap[module.id] = lessonRes.data;

              // Count completed lessons
              lessonRes.data.forEach((lesson) => {
                totalLessons++;
                if (lesson.isCompleted) completedLessons++;
              });
            } catch (err) {
              console.error(`Failed to fetch lessons for module ${module.id}`, err);
              lessonsMap[module.id] = [];
            }
          })
        );

        // Set the lessons by module
        setLessonsByModule(lessonsMap);

        // Calculate initial course progress
        const initialProgress = (completedLessons / totalLessons) * 100;
        setCourseProgress(Math.round(initialProgress));
      } catch (err) {
        console.error('Error loading modules or lessons', err);
      }
    };

    const checkEnrollment = async () => {
      if (!user?.id || !course?.id) return;

      try {
        const response = await axios.get(`http://localhost:8080/api/enroll/check?userId=${user.id}&courseId=${course.id}`);
        if (response.data?.userId === user.id && response.data?.courseId === course.id) {
          setIsEnrolled(true);
        }
      } catch (err) {
        console.error('Error checking enrollment', err);
      }
    };

    fetchModulesAndLessons();
    checkEnrollment();
  }, [course?.id, user?.id]);

  useEffect(() => {
    // Recalculate course progress whenever lessonsByModule changes
    const totalLessons = Object.values(lessonsByModule).flat().length;
    const completedLessons = Object.values(lessonsByModule)
      .flat()
      .filter((lesson) => lesson.isCompleted).length;

    const progress = (completedLessons / totalLessons) * 100;
    setCourseProgress(Math.round(progress));
  }, [lessonsByModule]);  // This effect will run whenever lessonsByModule changes

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleEnroll = async () => {
    if (!user?.id) {
      alert('User not logged in');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/api/enroll', {
        courseId: course.id,
        userId: user.id,
        progressStatus: 0,
      });

      if (response.status === 201) {
        setIsEnrolled(true);
        setEnrollmentSuccess(true);
        alert('Successfully enrolled in the course!');
      }
    } catch (err) {
      console.error('Error enrolling in the course:', err);
      alert('Failed to enroll in the course');
    }
  };

  const handleLessonCompletionToggle = async (moduleId, lessonId, newStatus) => {
    // Update the local state for immediate UI feedback (optimistic update)
    setLessonsByModule((prev) => {
      const updatedLessons = prev[moduleId].map((lesson) =>
        lesson.id === lessonId ? { ...lesson, isCompleted: newStatus } : lesson
      );

      return {
        ...prev,
        [moduleId]: updatedLessons,
      };
    });

    // Update the lesson completion status on the server
    try {
      await axios.patch(`http://localhost:8080/api/lessons/${lessonId}/completion?isCompleted=${newStatus}`);
    } catch (err) {
      console.error(`Failed to update completion status for lesson ${lessonId}`, err);
      alert('Error updating lesson status');
    }
  };

  if (!course) {
    return <Typography variant="h6" align="center">No course data found.</Typography>;
  }

  return (
    <Box padding={4}>
      <Grid container spacing={4}>
        {/* Left: Video Player + Course Info */}
        <Grid item xs={12} md={8}>
          {selectedVideoUrl && (
            <Card sx={{ mb: 2, p: 2 }}>
              <Typography variant="h6" gutterBottom>Video Player</Typography>
              <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                <iframe
                  src={selectedVideoUrl}
                  title="Lesson Video"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '8px',
                  }}
                />
              </Box>
            </Card>
          )}

          <Card sx={{ padding: 4, borderRadius: 3, boxShadow: 4 }}>
            <Typography variant="h4" gutterBottom>{course.title}</Typography>
            <Typography variant="h6" gutterBottom>Category: {course.category}</Typography>
            <Typography variant="body1" gutterBottom>Duration: {course.duration}</Typography>
            <Typography variant="body1" gutterBottom>Description: {course.description}</Typography>
            {course.skillLevel && (
              <Typography variant="body1" gutterBottom>Skill Level: {course.skillLevel}</Typography>
            )}
            <Typography variant="body1" gutterBottom>Published: {course.published ? "Yes" : "No"}</Typography>

            {/* Display Course Progress with CircularProgress */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <CircularProgress
                variant="determinate"
                value={courseProgress}
                size={100}
                thickness={4}
                sx={{ color: courseProgress === 100 ? 'green' : 'blue' }}
              />
              <Typography variant="h6" sx={{ position: 'absolute', color: '#000' }}>
                {courseProgress}%
              </Typography>
            </Box>



            {/* Enroll Button or Success Message */}
            {!isEnrolled && !enrollmentSuccess && (
              <Button
                variant="contained"
                color="secondary"
                sx={{ mt: 2 }}
                onClick={handleEnroll}
              >
                Enroll Now
              </Button>
            )}

            {enrollmentSuccess && (
              <Typography variant="body1" color="success.main" sx={{ mt: 2 }}>
                Successfully enrolled in the course! You now have access to the lessons.
              </Typography>
            )}

            {isEnrolled && !enrollmentSuccess && (
              <Typography variant="body1" color="success.main" sx={{ mt: 2 }}>
                You are already enrolled in this course!
              </Typography>
            )}
          </Card>
        </Grid>

        {/* Right: Modules + Lessons */}
        <Grid item xs={12} md={4}>
          <Card sx={{ padding: 3, borderRadius: 3, boxShadow: 4 }}>
            <Typography variant="h6">Modules</Typography>
            <Divider sx={{ my: 1 }} />
            {modules.map((module) => (
              <Box key={module.id} sx={{ mb: 2 }}>
                <ListItem
                  button
                  onClick={() => toggleModule(module.id)}
                  sx={{ backgroundColor: '#f5f5f5', borderRadius: 1, display: 'flex', alignItems: 'center' }}
                >
                  <ListItemText primary={module.name} />
                  <IconButton
                    onClick={() => toggleModule(module.id)}
                    sx={{ ml: 'auto' }}
                  >
                    <ExpandMoreIcon
                      sx={{
                        transform: expandedModules[module.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s',
                      }}
                    />
                  </IconButton>
                </ListItem>

                <Collapse in={expandedModules[module.id]} timeout="auto" unmountOnExit>
                  {isEnrolled ? (
                    <List sx={{ pl: 2 }}>
                      {(lessonsByModule[module.id] || []).map((lesson) => (
                        <ListItem key={lesson.id} sx={{ mb: 1, borderBottom: '1px solid #ddd' }}>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center">
                                <input
                                  type="checkbox"
                                  checked={lesson.isCompleted}
                                  onChange={() => handleLessonCompletionToggle(module.id, lesson.id, !lesson.isCompleted)}
                                  style={{ marginRight: '8px' }}
                                />
                                {lesson.title}
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography variant="body2" color="text.secondary">
                                  {lesson.content}
                                </Typography>
                                <Button
                                  onClick={() => setSelectedVideoUrl(lesson.videoUrl)}
                                  variant="text"
                                  color="primary"
                                  sx={{ pl: 0 }}
                                >
                                  ▶ Watch Video
                                </Button><br />
                                <a
                                  href={lesson.fileUrl}
                                  download
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ textDecoration: 'none', color: '#1976d2' }}
                                >
                                  ⬇ Download File
                                </a>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                      You need to enroll to access the lessons of this module.
                    </Typography>
                  )}
                </Collapse>
              </Box>
            ))}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CourseDetails;
