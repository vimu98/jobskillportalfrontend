import React, { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    const success = await login(email, password);
    if (success) {
      alert("Login successful");
      navigate("/");
    } else {
      alert("Login failed. Please check your credentials.");
    }
  };

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
          width: "300px",
          border: "1px solid",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: 3,
        }}
      >
        <Typography variant="h5" textAlign="center">
          Login Page
        </Typography>

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

        <Button onClick={handleLogin} variant="contained" color="primary" fullWidth>
          Login
        </Button>

        <Typography variant="body2">
          Don't have an account?{" "}
          <Link to="/register" style={{ textDecoration: "none" }}>
            Register here
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default LoginPage;
