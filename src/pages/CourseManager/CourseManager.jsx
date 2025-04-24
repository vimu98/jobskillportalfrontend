import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  Card,
  Grid,
  List,
  ListItem,
  ListItemText,
  Collapse,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";
import { useAuth } from '../../context/AuthContext';
import Navbar from "../../component/NavBar/Navbar";

// Add a counter to track renders
let renderCount = 0;

const CourseOverview = () => {
  renderCount += 1;
  console.log(`CourseOverview rendered ${renderCount} times`);

  const { user } = useAuth();
  const [openCourseModal, setOpenCourseModal] = useState(false);
  const [openModuleModal, setOpenModuleModal] = useState(false);
  const [openLessonModal, setOpenLessonModal] = useState(false);
  const [openUpdateCourseModal, setOpenUpdateCourseModal] = useState(false);
  const [openUpdateModuleModal, setOpenUpdateModuleModal] = useState(false);
  const [openUpdateLessonModal, setOpenUpdateLessonModal] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [courseToToggle, setCourseToToggle] = useState(null);
  const [courseToUpdate, setCourseToUpdate] = useState(null);
  const [moduleToUpdate, setModuleToUpdate] = useState(null);
  const [lessonToUpdate, setLessonToUpdate] = useState(null);
  const [courses, setCourses] = useState([]);
  const [modulesByCourse, setModulesByCourse] = useState({});
  const [lessonsByModule, setLessonsByModule] = useState({});
  const [expandedCourses, setExpandedCourses] = useState({});
  const [expandedModules, setExpandedModules] = useState({});
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    duration: "",
    skillLevel: "",
    publishedBy: user?.id || null,
  });
  const [moduleData, setModuleData] = useState({
    name: "",
    courseId: null,
  });
  const [lessonData, setLessonData] = useState({
    title: "",
    content: "",
    videoFile: null,
    file: null,
    moduleId: null,
  });
  const [updateCourseData, setUpdateCourseData] = useState({
    id: "",
    title: "",
    description: "",
    category: "",
    duration: "",
    skillLevel: "",
    publishedBy: null,
  });
  const [updateModuleData, setUpdateModuleData] = useState({
    id: "",
    name: "",
  });
  const [updateLessonData, setUpdateLessonData] = useState({
    id: "",
    title: "",
    content: "",
    videoFile: null,
    file: null,
    moduleId: null,
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.id) {
        setError("Please log in to view your courses.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`http://localhost:8080/api/courses/published-by/${user.id}`);
        const fetchedCourses = res.data;
        setCourses(fetchedCourses);

        const modulesMap = {};
        const lessonsMap = {};

        await Promise.all(
          fetchedCourses.map(async (course) => {
            try {
              const moduleRes = await axios.get(
                `http://localhost:8080/api/modules/by-course/${course.id}`
              );
              modulesMap[course.id] = moduleRes.data;

              await Promise.all(
                moduleRes.data.map(async (module) => {
                  try {
                    const lessonRes = await axios.get(
                      `http://localhost:8080/api/lessons/by-module/${module.id}`
                    );
                    lessonsMap[module.id] = lessonRes.data;
                  } catch (err) {
                    console.error(`Failed to fetch lessons for module ${module.id}`, err);
                    lessonsMap[module.id] = [];
                  }
                })
              );
            } catch (err) {
              console.error(`Failed to fetch modules for course ${course.id}`, err);
              modulesMap[course.id] = [];
            }
          })
        );

        setModulesByCourse(modulesMap);
        setLessonsByModule(lessonsMap);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to fetch courses: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  const handleCreateCourse = async () => {
    if (!user?.id) {
      alert("User not authenticated. Please log in to create a course.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8080/api/courses", {
        ...courseData,
        published: false,
        publishedBy: user.id,
      });
      setCourses((prev) => [...prev, res.data]);
      setModulesByCourse((prev) => ({ ...prev, [res.data.id]: [] }));
      alert("Course created successfully!");
      handleCloseCourseModal();
    } catch (err) {
      console.error("Error creating course:", err);
      alert("Failed to create course: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateModule = async () => {
    try {
      const res = await axios.post("http://localhost:8080/api/modules", moduleData);
      setModulesByCourse((prev) => ({
        ...prev,
        [moduleData.courseId]: [...(prev[moduleData.courseId] || []), res.data],
      }));
      setLessonsByModule((prev) => ({ ...prev, [res.data.id]: [] }));
      alert("Module created successfully!");
      handleCloseModuleModal();
    } catch (err) {
      console.error("Error creating module:", err);
      alert("Failed to create module.");
    }
  };

  const handleCreateLesson = async () => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", lessonData.title);
      formData.append("content", lessonData.content);
      formData.append("moduleId", lessonData.moduleId);
      if (lessonData.videoFile) {
        formData.append("video", lessonData.videoFile);
      }
      if (lessonData.file) {
        formData.append("file", lessonData.file);
      }

      const res = await axios.post("http://localhost:8080/api/lessons", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setLessonsByModule((prev) => ({
        ...prev,
        [lessonData.moduleId]: [...(prev[lessonData.moduleId] || []), res.data],
      }));
      alert("Lesson created successfully!");
      handleCloseLessonModal();
    } catch (err) {
      console.error("Error creating lesson:", err);
      alert("Failed to create lesson.");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateCourse = async () => {
    try {
      const res = await axios.put(
        `http://localhost:8080/api/courses/${updateCourseData.id}`,
        updateCourseData
      );
      setCourses((prev) =>
        prev.map((course) =>
          course.id === updateCourseData.id ? res.data : course
        )
      );
      alert("Course updated successfully!");
      handleCloseUpdateCourseModal();
    } catch (err) {
      console.error("Error updating course:", err);
      alert("Failed to update course.");
    }
  };

  const handleUpdateModule = async () => {
    try {
      const res = await axios.put(
        `http://localhost:8080/api/modules/${updateModuleData.id}`,
        updateModuleData
      );
      setModulesByCourse((prev) => ({
        ...prev,
        [res.data.courseId]: (prev[res.data.courseId] || []).map((module) =>
          module.id === res.data.id ? res.data : module
        ),
      }));
      alert("Module updated successfully!");
      handleCloseUpdateModuleModal();
    } catch (err) {
      console.error("Error updating module:", err);
      alert("Failed to update module.");
    }
  };

  const handleUpdateLesson = async () => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("title", updateLessonData.title);
      formData.append("content", updateLessonData.content);
      formData.append("moduleId", updateLessonData.moduleId);
      if (updateLessonData.videoFile) {
        formData.append("video", updateLessonData.videoFile);
      }
      if (updateLessonData.file) {
        formData.append("file", updateLessonData.file);
      }

      const res = await axios.put(
        `http://localhost:8080/api/lessons/${updateLessonData.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const updatedLesson = res.data;
      const oldModuleId = lessonToUpdate.moduleId;
      const newModuleId = updatedLesson.moduleId;

      setLessonsByModule((prev) => {
        let newLessons = { ...prev };
        newLessons[oldModuleId] = (newLessons[oldModuleId] || []).filter(
          (lesson) => lesson.id !== updatedLesson.id
        );
        if (newLessons[oldModuleId].length === 0) {
          delete newLessons[oldModuleId];
        }
        newLessons[newModuleId] = [
          ...(newLessons[newModuleId] || []),
          updatedLesson,
        ];
        return newLessons;
      });

      alert("Lesson updated successfully!");
      handleCloseUpdateLessonModal();
    } catch (err) {
      console.error("Error updating lesson:", err);
      alert("Failed to update lesson.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await axios.delete(`http://localhost:8080/api/courses/${courseId}`);
      setCourses((prev) => prev.filter((course) => course.id !== courseId));
      setModulesByCourse((prev) => {
        const newModules = { ...prev };
        delete newModules[courseId];
        return newModules;
      });
      setLessonsByModule((prev) => {
        const newLessons = { ...prev };
        Object.keys(newLessons).forEach((moduleId) => {
          if (
            !Object.values(modulesByCourse).flat().some((m) => m.id === moduleId)
          ) {
            delete newLessons[moduleId];
          }
        });
        return newLessons;
      });
      alert("Course deleted successfully!");
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("Failed to delete course.");
    }
  };

  const handleDeleteModule = async (moduleId, courseId) => {
    try {
      await axios.delete(`http://localhost:8080/api/modules/${moduleId}`);
      setModulesByCourse((prev) => ({
        ...prev,
        [courseId]: (prev[courseId] || []).filter((module) => module.id !== moduleId),
      }));
      setLessonsByModule((prev) => {
        const newLessons = { ...prev };
        delete newLessons[moduleId];
        return newLessons;
      });
      alert("Module deleted successfully!");
    } catch (err) {
      console.error("Error deleting module:", err);
      alert("Failed to delete module.");
    }
  };

  const handleDeleteLesson = async (lessonId, moduleId) => {
    try {
      await axios.delete(`http://localhost:8080/api/lessons/${lessonId}`);
      setLessonsByModule((prev) => ({
        ...prev,
        [moduleId]: (prev[moduleId] || []).filter((lesson) => lesson.id !== lessonId),
      }));
      alert("Lesson deleted successfully!");
    } catch (err) {
      console.error("Error deleting lesson:", err);
      alert("Failed to create lesson.");
    }
  };

  const handleTogglePublish = async (course) => {
    try {
      console.log("Toggling publish for course:", course.id);
      const res = await axios.patch(
        `http://localhost:8080/api/courses/${course.id}/toggle`
      );
      const updatedCourse = res.data;
      console.log("Updated course from backend:", updatedCourse);

      setCourses((prev) =>
        prev.map((c) =>
          c.id === course.id ? { ...c, published: updatedCourse.published } : c
        )
      );
      alert(`Course ${updatedCourse.published ? "published" : "unpublished"} successfully!`);
    } catch (err) {
      console.error("Error toggling publish state:", err);
      alert("Failed to toggle publish state: " + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenConfirmDialog = (action, message, course = null) => {
    if (course) {
      setCourseToToggle(course);
    }
    setConfirmAction(() => action);
    setConfirmMessage(message);
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setConfirmAction(null);
    setConfirmMessage("");
    setCourseToToggle(null);
  };

  const handleConfirmAction = () => {
    if (confirmAction) {
      confirmAction();
    }
    handleCloseConfirmDialog();
  };

  const handleOpenCourseModal = () => setOpenCourseModal(true);
  const handleCloseCourseModal = () => {
    setOpenCourseModal(false);
    setCourseData({
      title: "",
      description: "",
      category: "",
      duration: "",
      skillLevel: "",
      publishedBy: user?.id || null,
    });
  };

  const handleOpenModuleModal = (courseId) => {
    setModuleData({ name: "", courseId });
    setOpenModuleModal(true);
  };
  const handleCloseModuleModal = () => {
    setOpenModuleModal(false);
    setModuleData({ name: "", courseId: null });
  };

  const handleOpenLessonModal = (moduleId) => {
    setLessonData({ title: "", content: "", videoFile: null, file: null, moduleId });
    setOpenLessonModal(true);
  };
  const handleCloseLessonModal = () => {
    setOpenLessonModal(false);
    setLessonData({ title: "", content: "", videoFile: null, file: null, moduleId: null });
  };

  const handleOpenUpdateCourseModal = (course) => {
    setUpdateCourseData({
      id: course.id,
      title: church.title,
      description: course.description,
      category: course.category,
      duration: course.duration,
      skillLevel: course.skillLevel || "",
      publishedBy: course.publishedBy || null,
    });
    setOpenUpdateCourseModal(true);
  };
  const handleCloseUpdateCourseModal = () => {
    setOpenUpdateCourseModal(false);
    setUpdateCourseData({
      id: "",
      title: "",
      description: "",
      category: "",
      duration: "",
      skillLevel: "",
      publishedBy: null,
    });
  };

  const handleOpenUpdateModuleModal = (module) => {
    setUpdateModuleData({ id: module.id, name: module.name });
    setOpenUpdateModuleModal(true);
  };
  const handleCloseUpdateModuleModal = () => {
    setOpenUpdateModuleModal(false);
    setUpdateModuleData({ id: "", name: "" });
  };

  const handleOpenUpdateLessonModal = (lesson) => {
    setLessonToUpdate(lesson);
    setUpdateLessonData({
      id: lesson.id,
      title: lesson.title,
      content: lesson.content,
      videoFile: null,
      file: null,
      moduleId: lesson.moduleId,
    });
    setOpenUpdateLessonModal(true);
  };
  const handleCloseUpdateLessonModal = () => {
    setOpenUpdateLessonModal(false);
    setUpdateLessonData({ id: "", title: "", content: "", videoFile: null, file: null, moduleId: null });
    setLessonToUpdate(null);
  };

  const toggleCourse = (courseId) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const allModules = Object.values(modulesByCourse).flat();

  return (
    <Box>
      <Navbar />
    <Box sx={{ p: 4 }}>
      <Button variant="contained" onClick={handleOpenCourseModal} sx={{ mb: 4 }}>
        Create New Course
      </Button>

      <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Cancel</Button>
          <Button onClick={handleConfirmAction} variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Modal open={openCourseModal} onClose={handleCloseCourseModal}>
        <Box
          sx={{
            width: 500,
            margin: "auto",
            mt: 10,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Create Course
          </Typography>
          <TextField
            fullWidth
            label="Course Title"
            name="title"
            value={courseData.title}
            onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={courseData.description}
            onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Category"
            name="category"
            value={courseData.category}
            onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Duration"
            name="duration"
            value={courseData.duration}
            onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Skill Level"
            name="skillLevel"
            value={courseData.skillLevel}
            onChange={(e) => setCourseData({ ...courseData, skillLevel: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleCloseCourseModal} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleCreateCourse}>
              Create
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={openUpdateCourseModal} onClose={handleCloseUpdateCourseModal}>
        <Box
          sx={{
            width: 500,
            margin: "auto",
            mt: 10,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Update Course
          </Typography>
          <TextField
            fullWidth
            label="Course Title"
            name="title"
            value={updateCourseData.title}
            onChange={(e) =>
              setUpdateCourseData({ ...updateCourseData, title: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={updateCourseData.description}
            onChange={(e) =>
              setUpdateCourseData({ ...updateCourseData, description: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Category"
            name="category"
            value={updateCourseData.category}
            onChange={(e) =>
              setUpdateCourseData({ ...updateCourseData, category: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Duration"
            name="duration"
            value={updateCourseData.duration}
            onChange={(e) =>
              setUpdateCourseData({ ...updateCourseData, duration: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Skill Level"
            name="skillLevel"
            value={updateCourseData.skillLevel}
            onChange={(e) =>
              setUpdateCourseData({ ...updateCourseData, skillLevel: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Published By (User ID)"
            name="publishedBy"
            value={updateCourseData.publishedBy || "N/A"}
            InputProps={{ readOnly: true }}
            sx={{ mb: 2 }}
          />
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleCloseUpdateCourseModal} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleUpdateCourse}>
              Update
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={openModuleModal} onClose={handleCloseModuleModal}>
        <Box
          sx={{
            width: 500,
            margin: "auto",
            mt: 10,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add Module
          </Typography>
          <TextField
            fullWidth
            label="Module Name"
            value={moduleData.name}
            onChange={(e) => setModuleData({ ...moduleData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleCloseModuleModal} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleCreateModule}>
              Create
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={openUpdateModuleModal} onClose={handleCloseUpdateModuleModal}>
        <Box
          sx={{
            width: 500,
            margin: "auto",
            mt: 10,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Update Module
          </Typography>
          <TextField
            fullWidth
            label="Module Name"
            value={updateModuleData.name}
            onChange={(e) =>
              setUpdateModuleData({ ...updateModuleData, name: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleCloseUpdateModuleModal} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleUpdateModule}>
              Update
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={openLessonModal} onClose={handleCloseLessonModal}>
        <Box
          sx={{
            width: 500,
            margin: "auto",
            mt: 10,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add Lesson
          </Typography>
          <TextField
            fullWidth
            label="Lesson Title"
            value={lessonData.title}
            onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Content"
            value={lessonData.content}
            onChange={(e) => setLessonData({ ...lessonData, content: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Upload Video
            </Typography>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setLessonData({ ...lessonData, videoFile: e.target.files[0] })}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Upload File
            </Typography>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => setLessonData({ ...lessonData, file: e.target.files[0] })}
            />
          </Box>
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleCloseLessonModal} sx={{ mr: 2 }} disabled={uploading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateLesson}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Create"}
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={openUpdateLessonModal} onClose={handleCloseUpdateLessonModal}>
        <Box
          sx={{
            width: 500,
            margin: "auto",
            mt: 10,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Update Lesson
          </Typography>
          <TextField
            fullWidth
            label="Lesson Title"
            value={updateLessonData.title}
            onChange={(e) =>
              setUpdateLessonData({ ...updateLessonData, title: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Content"
            value={updateLessonData.content}
            onChange={(e) =>
              setUpdateLessonData({ ...updateLessonData, content: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Module</InputLabel>
            <Select
              value={updateLessonData.moduleId || ""}
              onChange={(e) =>
                setUpdateLessonData({ ...updateLessonData, moduleId: e.target.value })
              }
              label="Module"
            >
              {allModules.map((module) => (
                <MenuItem key={module.id} value={module.id}>
                  {module.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Upload New Video (optional)
            </Typography>
            <input
              type="file"
              accept="video/*"
              onChange={(e) =>
                setUpdateLessonData({ ...updateLessonData, videoFile: e.target.files[0] })
              }
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Upload New File (optional)
            </Typography>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) =>
                setUpdateLessonData({ ...updateLessonData, file: e.target.files[0] })
              }
            />
          </Box>
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleCloseUpdateLessonModal} sx={{ mr: 2 }} disabled={uploading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdateLesson}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Update"}
            </Button>
          </Box>
        </Box>
      </Modal>

      {loading ? (
        <Typography variant="h6" align="center">
          Loading courses...
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
                        <Typography variant="h5" gutterBottom>
                          {course.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body1" gutterBottom>
                            Description: {course.description}
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            Category: {course.category}
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            Duration: {course.duration}
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            Skill Level: {course.skillLevel || "N/A"}
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            Published By: {course.publishedBy || "N/A"}
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            Published: {course.published ? "Yes" : "No"}
                          </Typography>
                        </>
                      }
                    />
                  </Box>
                  <Box>
                    <Button
                      variant="contained"
                      color={course.published ? "error" : "success"}
                      onClick={() =>
                        handleOpenConfirmDialog(
                          () => handleTogglePublish(course),
                          `Are you sure you want to ${
                            course.published ? "unpublish" : "publish"
                          } the course "${course.title}"?`,
                          course
                        )
                      }
                      sx={{ mr: 1 }}
                    >
                      {course.published ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleOpenUpdateCourseModal(course)}
                      sx={{ mr: 1 }}
                    >
                      Update
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() =>
                        handleOpenConfirmDialog(
                          () => handleDeleteCourse(course.id),
                          `Are you sure you want to delete the course "${course.title}"? This will also delete all associated modules and lessons.`
                        )
                      }
                      sx={{ mr: 1 }}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => handleOpenModuleModal(course.id)}
                      sx={{ mr: 1 }}
                    >
                      Add Module
                    </Button>
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
                  </Box>
                </ListItem>

                <Collapse
                  in={expandedCourses[course.id]}
                  timeout="auto"
                  unmountOnExit
                >
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Modules
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  {(modulesByCourse[course.id] || []).length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No modules available for this course.
                    </Typography>
                  ) : (
                    <List>
                      {(modulesByCourse[course.id] || []).map((module) => (
                        <Box key={module.id} sx={{ mb: 2 }}>
                          <ListItem
                            sx={{
                              backgroundColor: "#f5f5f5",
                              borderRadius: 1,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Box
                              sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}
                              onClick={() => toggleModule(module.id)}
                            >
                              <ListItemText primary={module.name} />
                            </Box>
                            <Box>
                              <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => handleOpenUpdateModuleModal(module)}
                                sx={{ mr: 1 }}
                              >
                                Update
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                onClick={() =>
                                  handleOpenConfirmDialog(
                                    () => handleDeleteModule(module.id, course.id),
                                    `Are you sure you want to delete the module "${module.name}"? This will also delete all associated lessons.`
                                  )
                                }
                                sx={{ mr: 1 }}
                              >
                                Delete
                              </Button>
                              <Button
                                variant="outlined"
                                onClick={() => handleOpenLessonModal(module.id)}
                                sx={{ mr: 1 }}
                              >
                                Add Lesson
                              </Button>
                              <IconButton onClick={() => toggleModule(module.id)}>
                                <ExpandMoreIcon
                                  sx={{
                                    transform: expandedModules[module.id]
                                      ? "rotate(180deg)"
                                      : "rotate(0deg)",
                                    transition: "transform 0.3s",
                                  }}
                                />
                              </IconButton>
                            </Box>
                          </ListItem>
                          <Collapse
                            in={expandedModules[module.id]}
                            timeout="auto"
                            unmountOnExit
                          >
                            <List sx={{ pl: 2 }}>
                              {(lessonsByModule[module.id] || []).length === 0 ? (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ p: 2 }}
                                >
                                  No lessons available for this module.
                                </Typography>
                              ) : (
                                (lessonsByModule[module.id] || []).map((lesson) => (
                                  <ListItem
                                    key={lesson.id}
                                    sx={{ mb: 1, borderBottom: "1px solid #ddd" }}
                                  >
                                    <ListItemText
                                      primary={lesson.title}
                                      secondary={
                                        <>
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                          >
                                            {lesson.content}
                                          </Typography>
                                          {lesson.videoUrl && (
                                            <Typography
                                              variant="body2"
                                              color="primary"
                                              component="a"
                                              href={lesson.videoUrl}
                                              target="_blank"
                                              sx={{ display: "block" }}
                                            >
                                              ▶ Watch Video
                                            </Typography>
                                          )}
                                          {lesson.fileUrl && (
                                            <Typography
                                              variant="body2"
                                              color="primary"
                                              component="a"
                                              href={lesson.fileUrl}
                                              download
                                              target="_blank"
                                              rel="noreferrer"
                                              sx={{ display: "block" }}
                                            >
                                              ⬇ Download File
                                            </Typography>
                                          )}
                                        </>
                                      }
                                    />
                                    <Box>
                                      <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handleOpenUpdateLessonModal(lesson)}
                                        sx={{ mr: 1 }}
                                      >
                                        Update
                                      </Button>
                                      <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() =>
                                          handleOpenConfirmDialog(
                                            () =>
                                              handleDeleteLesson(lesson.id, module.id),
                                            `Are you sure you want to delete the lesson "${lesson.title}"?`
                                          )
                                        }
                                      >
                                        Delete
                                      </Button>
                                    </Box>
                                  </ListItem>
                                ))
                              )}
                            </List>
                          </Collapse>
                        </Box>
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

export default CourseOverview;