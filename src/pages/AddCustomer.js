import React, { useState, useEffect } from "react";
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
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const AddCustomer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

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
    createdBy: 2, // for Add
    modifiedBy: 3, // for Update
  });

  // Fetch customer details in update mode
  useEffect(() => {
    if (isEdit) {
      const token = localStorage.getItem("accessToken");
      setLoading(true);
      axios
        .get(`http://localhost:8080/api/customer/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setFormData((prev) => ({
            ...prev,
            ...res.data,
          }));
        })
        .catch(() => toast.error("Failed to fetch customer data"))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.email || !formData.phoneNumber) {
      toast.error("Please fill required fields: Name, Email, Phone");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("accessToken");

    try {
      if (isEdit) {
        await axios.put(
          `http://localhost:8080/api/customer/update/${id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Customer updated successfully!");
      } else {
        await axios.post(
          "http://localhost:8080/api/customer/add",
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Customer added successfully!");
      }
      navigate("/dashboard/customer");
    } catch (error) {
      toast.error(isEdit ? "Failed to update customer" : "Failed to add customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="flex-start" p={3} sx={{ height: "calc(100vh - 130px)", overflowY: "auto" }}>
      <Paper sx={{ p: 3, width: "100%", maxWidth: 800 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          {isEdit ? "Update Customer" : "Add New Customer"}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <TextField label="Customer Name" name="customerName" value={formData.customerName} onChange={handleChange} required />
            <TextField label="Email" name="email" value={formData.email} onChange={handleChange} type="email" required />

            <TextField label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
            <TextField label="Fax Number" name="faxNumber" value={formData.faxNumber} onChange={handleChange} />

            <TextField label="Address Line 1" name="addressLine1" value={formData.addressLine1} onChange={handleChange} required />
            <TextField label="Address Line 2" name="addressLine2" value={formData.addressLine2} onChange={handleChange} />

            <TextField label="City" name="city" value={formData.city} onChange={handleChange} required />
            <TextField label="State" name="state" value={formData.state} onChange={handleChange} required />

            <TextField label="Zip Code" name="zipcode" value={formData.zipcode} onChange={handleChange} required />
            <TextField label="Country" name="country" value={formData.country} onChange={handleChange} required />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={(e) => setFormData((prev) => ({ ...prev, active: e.target.checked }))}
                  name="active"
                  color="primary"
                />
              }
              label="Active"
            />
          </Box>

          <Box mt={3} display="flex" gap={2}>
            <Button type="submit" variant="contained" disabled={loading} startIcon={loading && <CircularProgress size={20} />}>
              {loading ? (isEdit ? "Updating..." : "Saving...") : isEdit ? "Update Customer" : "Save Customer"}
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => navigate("/dashboard/customer")}>
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AddCustomer;
