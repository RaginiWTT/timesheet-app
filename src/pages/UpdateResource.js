import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
  Grid,
  LinearProgress,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UpdateResource = () => {
  const navigate = useNavigate();
  const { resourceId } = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    emailId: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    role: 1,
    active: true,
    modifiedBy: localStorage.getItem("resourceId"),
  });

  // Fetch resource by ID
  useEffect(() => {
    const fetchResource = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const res = await api.get(`http://localhost:8080/api/resource/${resourceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData((prev) => ({
          ...prev,
          ...res.data,
          modifiedBy: localStorage.getItem("resourceId"),
        }));
      } catch (err) {
        console.error("Error fetching resource:", err);
        toast.error("❌ Failed to fetch resource details.");
      }
      setLoading(false);
    };
    fetchResource();
  }, [resourceId]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      await api.put(`http://localhost:8080/api/resource/update/${resourceId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Resource updated successfully!");
      setTimeout(() => {
        navigate("/dashboard/resource", { state: { refresh: true, action: "updated" } });
      }, 1500);
    } catch (error) {
      console.error("Error updating resource:", error);
      toast.error("❌ Failed to update resource. Please try again.");
    }
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 2 }}>
      <ToastContainer position="top-right" autoClose={3000} />
      {loading && <LinearProgress />}
      <Paper sx={{ p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Update Resource
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* First & Last Name */}
            <Grid item xs={12} sm={6}>
              <TextField name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} fullWidth />
            </Grid>

            {/* Phone & Email */}
            <Grid item xs={12} sm={6}>
              <TextField name="phoneNumber" label="Phone Number" value={formData.phoneNumber} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField name="emailId" label="Email" value={formData.emailId} onChange={handleChange} fullWidth required />
            </Grid>

            {/* Password */}
            <Grid item xs={12} sm={6}>
              <TextField name="password" label="Password" type="password" value={formData.password} onChange={handleChange} fullWidth required />
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <TextField name="addressLine1" label="Address Line 1" value={formData.addressLine1} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12}>
              <TextField name="addressLine2" label="Address Line 2" value={formData.addressLine2} onChange={handleChange} fullWidth />
            </Grid>

            {/* City, State, Zip */}
            <Grid item xs={12} sm={6}>
              <TextField name="city" label="City" value={formData.city} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField name="state" label="State" value={formData.state} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField name="zipcode" label="Zipcode" value={formData.zipcode} onChange={handleChange} fullWidth required />
            </Grid>

            {/* Country */}
            <Grid item xs={12} sm={6}>
              <TextField name="country" label="Country" value={formData.country} onChange={handleChange} fullWidth required />
            </Grid>

            {/* Role */}
            <Grid item xs={12} sm={6}>
              <TextField select name="role" label="Role" value={formData.role} onChange={handleChange} fullWidth required>
                <MenuItem value={1}>Admin</MenuItem>
                <MenuItem value={2}>User</MenuItem>
              </TextField>
            </Grid>

            {/* Active */}
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={formData.active} onChange={(e) => setFormData((prev) => ({ ...prev, active: e.target.checked }))} name="active" />}
                label="Active"
              />
            </Grid>

            {/* Actions */}
            <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
              <Button variant="outlined" onClick={() => navigate("/dashboard/resource", { state: { refresh: false } })}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Update
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default UpdateResource;
