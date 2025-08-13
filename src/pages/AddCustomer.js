import React, { useState } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const AddCustomer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phoneNumber: "",
    faxNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    active: true,
    createdBy: 2, // default
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.customerName || !formData.email || !formData.phoneNumber) {
      toast.error("Please fill required fields: Name, Email, Phone");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        "http://localhost:8080/api/customer/add",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Customer added successfully!");
      navigate("/dashboard/customer");
    } catch (error) {
      console.error("Error adding customer:", error);
      toast.error("Failed to add customer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="flex-start"
      p={3}
      sx={{ height: "calc(100vh - 130px)", overflowY: "auto" }}
    >
      <Paper sx={{ p: 3, width: "100%", maxWidth: 800 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Add New Customer
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <TextField
              label="Customer Name"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
            />
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              required
            />

            <TextField
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
            <TextField
              label="Fax Number"
              name="faxNumber"
              value={formData.faxNumber}
              onChange={handleChange}
            />

            <TextField
              label="Address Line 1"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              required
            />
            <TextField
              label="Address Line 2"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
            />

            <TextField
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
            <TextField
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            />

            <TextField
              label="Zip Code"
              name="zipcode"
              value={formData.zipcode}
              onChange={handleChange}
              required
            />
            <TextField
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      active: e.target.checked,
                    }))
                  }
                  name="active"
                  color="primary"
                />
              }
              label="Active"
            />
          </Box>

          <Box mt={3} display="flex" gap={2}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? "Saving..." : "Save Customer"}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/dashboard/customer")}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AddCustomer;
