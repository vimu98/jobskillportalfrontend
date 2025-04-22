import {
  Avatar,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Modal,
  Box,
  TextField,
  Input,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useAuth } from "./../../context/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";

const ProfilePage = () => {
  const { user, resume, setUser, setResume } = useAuth();
  const [open, setOpen] = useState(false);
  const role = localStorage.getItem("iap-final-role");
  const [updatedName, setUpdatedName] = useState(user?.name || "");
  const [updatedEmail, setUpdatedEmail] = useState(user?.email || "");
  const [updatedPassword, setUpdatedPassword] = useState(""); // State for password
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedProfilePicture, setSelectedProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Open and close modal functions
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Handle file selection for resume
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Handle profile picture selection
  const handleProfilePictureChange = (event) => {
    setSelectedProfilePicture(event.target.files[0]);
  };

  // Handle user update API call
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Append user details to the formData
      formData.append("name", updatedName);
      formData.append("email", updatedEmail);
      if (updatedPassword) {
        formData.append("password", updatedPassword); // Append password if provided
      }

      // Only append profile picture if a new one is selected
      if (selectedProfilePicture) {
        formData.append("profilePicture", selectedProfilePicture);
      }

      // Make the API call to update user details (including profile picture)
      const userUpdateResponse = await axios.put(
        `http://localhost:8080/api/auth/user/${user.id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Update user state with the new details
      setUser({
        ...user,
        name: updatedName,
        email: updatedEmail,
        profilePicture: selectedProfilePicture
          ? URL.createObjectURL(selectedProfilePicture)
          : user.profilePicture, // Only update profile picture if selected
      });

      // If a file (resume) is selected, upload it
      if (selectedFile) {
        const resumeFormData = new FormData();
        resumeFormData.append("userId", user.id);
        resumeFormData.append("file", selectedFile);

        const resumeUploadResponse = await axios.post(
          "http://localhost:8080/api/resumes",
          resumeFormData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        // Update resume state with the uploaded resume URL
        setResume(resumeUploadResponse.data.resumeUrl);
      }

      setSnackbar({
        open: true,
        message: "Profile updated successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Update Error:", error);
      setSnackbar({
        open: true,
        message: "Failed to update profile!",
        severity: "error",
      });
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  useEffect(() => {
    // If there's already a resume or profile picture, set the respective states
    setSelectedFile(null); // Clear file selection if not needed
    setSelectedProfilePicture(null); // Clear profile picture selection if not needed
  }, [resume, user.profilePicture]);

  return (
    <div>
      {/* Profile Card */}
      <Card
        sx={{
          maxWidth: "800px",
          margin: "auto",
          mt: 3,
          p: 3,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <CardContent>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Avatar
                src={
                  user.profilePicture ||
                  "https://www.shutterstock.com/image-vector/circle-line-simple-design-logo-600nw-2174926871.jpg"
                }
                sx={{ width: 64, height: 64 }}
              />
            </div>
            <IconButton onClick={handleOpen}>
              <EditIcon />
            </IconButton>
          </div>

          <div style={{ marginTop: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <PersonIcon color="primary" />
              <Typography>{user.name}</Typography>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <EmailIcon color="primary" />
              <Typography>{user.email}</Typography>
            </div>
          </div>

          {role === "JOB_SEEKER" && (
            <div style={{ marginTop: "16px" }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Resume
              </Typography>
              {resume ? (
                <a
                  target="blank"
                  href={resume}
                  className="text-blue-500 w-full hover:underline cursor-pointer"
                >
                  Click here to show
                </a>
              ) : (
                <span>NA</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>


      {/* Update Profile & Resume Upload Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Update Profile
          </Typography>
          <TextField
            fullWidth
            label="Name"
            value={updatedName}
            onChange={(e) => setUpdatedName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            value={updatedEmail}
            onChange={(e) => setUpdatedEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={updatedPassword}
            onChange={(e) => setUpdatedPassword(e.target.value)} // Bind password to state
            sx={{ mb: 2 }}
          />

          {/* Profile Picture Upload */}
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
            Upload Profile Picture
          </Typography>
          <Input
            type="file"
            onChange={handleProfilePictureChange}
            sx={{ mt: 1, mb: 2 }}
          />
          {selectedProfilePicture && (
            <Typography variant="body2" color="textSecondary">
              Selected: {selectedProfilePicture.name}
            </Typography>
          )}

          {role === "JOB_SEEKER" && (
            <>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                Upload Resume
              </Typography>
              <Input
                type="file"
                onChange={handleFileChange}
                sx={{ mt: 1, mb: 2 }}
              />
              {selectedFile && (
                <Typography variant="body2" color="textSecondary">
                  Selected: {selectedFile.name}
                </Typography>
              )}
            </>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              marginTop: "16px",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button variant="outlined" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </Box>
      </Modal>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
};

export default ProfilePage;
