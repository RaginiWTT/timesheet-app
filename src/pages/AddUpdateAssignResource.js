import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Paper,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AddUpdateAssignResource = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [resources, setResources] = useState([]);

  const [customerId, setCustomerId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());

  const token = localStorage.getItem("accessToken");
  const createdBy = localStorage.getItem("resourceId");

  // ✅ Fetch customers, resources, and existing assignment if editing
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, resRes] = await Promise.all([
          axios.get("http://localhost:8080/api/customer/active", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8080/api/resource/all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCustomers(custRes.data);
        setResources(resRes.data);

        // ✅ If editing, fetch existing assignment
        if (id) {
          const assignRes = await axios.get(
            `http://localhost:8080/api/assign-resource/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const assignment = assignRes.data;
          setProjectId(assignment.projectId);
          setResourceId(assignment.resourceId);
          setFromDate(new Date(assignment.fromDate));
          setToDate(new Date(assignment.toDate));

          // ✅ Fetch project & customer from projectId
          const projRes = await axios.get(
            `http://localhost:8080/api/project/${assignment.projectId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setCustomerId(projRes.data.customer.customerId);

          // Load projects of that customer
          const projList = await axios.get(
            `http://localhost:8080/api/project/customer/${projRes.data.customer.customerId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setProjects(projList.data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load data");
      }
    };

    fetchData();
  }, [id, token]);

  // ✅ Load projects when customer changes
  const handleCustomerChange = async (custId) => {
    setCustomerId(custId);
    setProjectId("");
    if (!custId) return;
    try {
      const res = await axios.get(
        `http://localhost:8080/api/project/customer/${custId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjects(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load projects");
    }
  };

  // ✅ Save / Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      projectId,
      resourceId,
      fromDate: fromDate.toISOString().split("T")[0],
      toDate: toDate.toISOString().split("T")[0],
      [id ? "modifiedBy" : "assignedBy"]: createdBy,
    };

    try {
      if (id) {
        await axios.put(`http://localhost:8080/api/assign-resource/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Resource updated successfully!");
      } else {
        await axios.post("http://localhost:8080/api/assign-resource", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Resource assigned successfully!");
      }
      navigate("/dashboard/assign-resource");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save resource assignment");
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        {id ? "Update Assigned Resource" : "Assign New Resource"}
      </Typography>

      <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
        {/* Customer Dropdown */}
        <TextField
          select
          label="Customer"
          value={customerId}
          onChange={(e) => handleCustomerChange(e.target.value)}
          required
        >
          {customers.map((cust) => (
            <MenuItem key={cust.customerId} value={cust.customerId}>
              {cust.customerName}
            </MenuItem>
          ))}
        </TextField>

        {/* Project Dropdown */}
        <TextField
          select
          label="Project"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          required
        >
          {projects.map((proj) => (
            <MenuItem key={proj.projectId} value={proj.projectId}>
              {proj.projectName}
            </MenuItem>
          ))}
        </TextField>

        {/* Resource Dropdown */}
        <TextField
          select
          label="Resource"
          value={resourceId}
          onChange={(e) => setResourceId(e.target.value)}
          required
        >
          {resources.map((res) => (
            <MenuItem key={res.resourceId} value={res.resourceId}>
              {res.firstName} {res.lastName}
            </MenuItem>
          ))}
        </TextField>

        {/* From Date */}
        <label>From Date</label>
        <DatePicker
          selected={fromDate}
          onChange={(date) => setFromDate(date)}
          dateFormat="yyyy-MM-dd"
          className="form-control"
        />

        {/* To Date */}
        <label>To Date</label>
        <DatePicker
          selected={toDate}
          onChange={(date) => setToDate(date)}
          dateFormat="yyyy-MM-dd"
          className="form-control"
        />

        {/* Submit */}
        <Button type="submit" variant="contained" color="primary">
          {id ? "Update Assignment" : "Assign Resource"}
        </Button>
      </Box>
    </Paper>
  );
};

export default AddUpdateAssignResource;
