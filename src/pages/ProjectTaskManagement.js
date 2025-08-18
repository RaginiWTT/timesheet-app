import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Edit, Height } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProjectTaskManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch active customers
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    axios
      .get("http://localhost:8080/api/customer/active", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error("Error loading customers", err));
  }, []);

  // Fetch projects by customer
  useEffect(() => {
    if (!selectedCustomer) return;
    const token = localStorage.getItem("accessToken");
    axios
      .get(`http://localhost:8080/api/project/customer/${selectedCustomer}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProjects(res.data))
      .catch((err) => console.error("Error loading projects", err));
  }, [selectedCustomer]);

  // Fetch tasks by project
  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    axios
      .get(`http://localhost:8080/api/tasks/by-project/${selectedProject}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTasks(res.data))
      .catch((err) => console.error("Error loading tasks", err))
      .finally(() => setLoading(false));
  }, [selectedProject]);

  const filteredTasks = tasks.filter((task) =>
    task.taskName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p={3} backgroundColor="white">
      <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
        Project Task Management
      </Typography>

      {/* Dropdowns */}
      <Box display="flex" gap={2} mb={3}>
        <FormControl fullWidth sx={{ minWidth: 200 }} size="small">
          <InputLabel>Select Customer</InputLabel>
          <Select
            value={selectedCustomer}
            onChange={(e) => {
              setSelectedCustomer(e.target.value);
              setSelectedProject(""); // reset project
              setTasks([]); // clear tasks
            }}
          >
            {customers.map((c) => (
              <MenuItem key={c.customerId} value={c.customerId}>
                {c.customerName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth disabled={!selectedCustomer} sx={{ minWidth: 200 }} size="small">
          <InputLabel>Select Project</InputLabel>
          <Select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            {projects.map((p) => (
              <MenuItem key={p.projectId} value={p.projectId}>
                {p.projectName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Search + Add Button */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <TextField
          label="Search Task"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => navigate("/dashboard/task/add")}
        >
          Add Task
        </Button>
      </Box>

      {/* Table */}
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: "bold", background: "#f0f0f0" } }}>
                <TableCell>Task Name</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TableRow key={task.taskId}>
                    <TableCell>{task.taskName}</TableCell>
                    <TableCell>{task.active ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() =>
                          navigate(`/dashboard/task/update/${task.taskId}`)
                        }
                      >
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No tasks found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ProjectTaskManagement;
