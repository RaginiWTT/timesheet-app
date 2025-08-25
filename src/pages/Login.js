// src/pages/Login.js
import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Box,
  Paper,
  Avatar,
  Typography,
  Alert,
  LinearProgress, // ✅ Added
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import api from "../services/api";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Added
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Both fields are required");
      return;
    }

    setLoading(true); // ✅ Start loading

    try {
      const res = await api.post("/auth/login", {
        emailId: form.email, // ✅ Match API expected key
        password: form.password,
      });

      // Save authentication details
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("tokenType", res.data.tokenType);
      localStorage.setItem("resourceId", res.data.resourceId);
      localStorage.setItem("emailId", res.data.emailId);
      localStorage.setItem("firstName", res.data.firstName);
      localStorage.setItem("lastName", res.data.lastName);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("roleName", res.data.roleName);
      localStorage.setItem("expiresIn", res.data.expiresIn);

      // Redirect based on role
      if (res.data.roleName === "ADMIN") {
        navigate("/dashboard");
      } else {
       // navigate("/dashboard/timesheet-dashboard");
        navigate("/timesheet-dashboard");
      }
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false); // ✅ Stop loading
    }
  };

  return (
    <>
      <Header />

      {/* ✅ Show progress bar when loading */}
      {loading && <LinearProgress color="primary" />}

      <Container maxWidth="sm">
        <Paper elevation={4} sx={{ p: 4, mt: 8 }}>
          <Box textAlign="center" mb={2}>
            <Avatar sx={{ bgcolor: "primary.main", mx: "auto", mt: 1 }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography variant="h5" mt={2}>
              Login to Your Account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              margin="normal"
              type="email"
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              value={form.password}
              onChange={handleChange}
              margin="normal"
              type="password"
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{ mt: 2 }}
              color="primary"
              disabled={loading} // ✅ Disable button while loading
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Paper>
      </Container>
    </>
  );
}

export default Login;
