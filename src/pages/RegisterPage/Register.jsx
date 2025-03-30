import React, { useState } from "react";
import { Box, TextField, Button, Typography, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import instance from "../../service/AxiosOrder";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [uName, setUName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("JOB_SEEKER"); // Default role
  const [profilePicture, setProfilePicture] = useState(null); // Profile picture state

  const navigate = useNavigate();

  function gotoLogin() {
    navigate("/login");
  }

  function uRegister() {
    const formData = new FormData();
    formData.append("name", uName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);

    if (profilePicture) {
      formData.append("profilePicture", profilePicture);
    }

    instance
      .post("/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log(response);
        if (response.data === "User registered successfully!") {
          alert("Registration successful");
          gotoLogin();
        } else {
          alert("Registration failed");
        }
      })
      .catch((error) => {
        console.error("Registration error:", error);
        alert("Registration failed. Please try again.");
      });
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          width: "320px",
          border: "1px solid",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: 3,
        }}
      >
        <Typography variant="h5" textAlign="center">
          Register Page
        </Typography>

        <TextField
          label="Full Name"
          value={uName}
          onChange={(e) => setUName(e.target.value)}
          variant="outlined"
          fullWidth
        />

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          variant="outlined"
          fullWidth
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          variant="outlined"
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel>Role</InputLabel>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            variant="outlined"
          >
            <MenuItem value="JOB_SEEKER">Job Seeker</MenuItem>
            <MenuItem value="EMPLOYER">Employer</MenuItem>
            <MenuItem value="TRAINER">Trainer</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
          </Select>
        </FormControl>

        {/* Profile Picture Upload */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProfilePicture(e.target.files[0])}
          style={{ marginTop: "10px" }}
        />

        <Button
          type="submit"
          onClick={uRegister}
          variant="contained"
          color="primary"
          fullWidth
        >
          Register
        </Button>

        <Typography variant="body2">
          Already have an account?{" "}
          <Link to="/login" style={{ textDecoration: "none" }}>
            Login here
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;
