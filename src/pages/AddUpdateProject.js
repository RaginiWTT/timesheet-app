import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const AddUpdateProject = () => {
  const { id } = useParams(); // projectId when editing
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    projectName: "",
    projectDescription: "",
    active: true,
    customerId: "",
  });

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch active customers for dropdown
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    axios
      .get("http://localhost:8080/api/customer/active", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCustomers(res.data))
      .catch(() => toast.error("Failed to load customers"));
  }, []);

  // If editing, fetch project details
  useEffect(() => {
    if (isEdit) {
      const token = localStorage.getItem("accessToken");
      axios
        .get(`http://localhost:8080/api/project/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const proj = res.data;
          setFormData({
            projectName: proj.projectName,
            projectDescription: proj.projectDescription,
            active: proj.active,
            customerId: proj.customer?.customerId || "",
          });
        })
        .catch(() => toast.error("Failed to load project"));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("accessToken");

    try {
      if (isEdit) {
        await axios.put(
          `http://localhost:8080/api/project/modify/${id}?customerId=${formData.customerId}`,
          {
            projectName: formData.projectName,
            projectDescription: formData.projectDescription,
            active: formData.active,
            modifiedBy: 3,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Project updated successfully!");
      } else {
        await axios.post(
          `http://localhost:8080/api/project/add/${formData.customerId}`,
          {
            projectName: formData.projectName,
            projectDescription: formData.projectDescription,
            active: true,
            createdBy: 2,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Project added successfully!");
      }
      navigate("/dashboard/project");
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" mt={4}>
      <Paper sx={{ p: 4, width: "600px" }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom align="center">
          {isEdit ? "Update Project" : "Add New Project"}
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Project Name"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Project Description"
            name="projectDescription"
            value={formData.projectDescription}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
          />

          {/* Customer Dropdown */}
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Select Customer</InputLabel>
            <Select
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
            >
              {customers.map((c) => (
                <MenuItem key={c.customerId} value={c.customerId}>
                  {c.customerName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Active */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              name="active"
              value={formData.active}
              onChange={(e) =>
                setFormData({ ...formData, active: e.target.value === "true" })
              }
            >
              <MenuItem value={true}>Active</MenuItem>
              <MenuItem value={false}>Inactive</MenuItem>
            </Select>
          </FormControl>

          <Box mt={2} textAlign="center">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : isEdit ? (
                "Update Project"
              ) : (
                "Save Project"
              )}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AddUpdateProject;
