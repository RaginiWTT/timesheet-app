import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Paper,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddUpdateTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [taskName, setTaskName] = useState("");
  const [active, setActive] = useState(true);
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const loggedInUserId = localStorage.getItem("resourceId");

  // Fetch active projects
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    axios
      .get("http://localhost:8080/api/project/all", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProjects(res.data))
      .catch((err) => console.error("Error loading projects:", err));
  }, []);

  // Fetch task if updating
  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem("accessToken");
    setLoading(true);
    axios
      .get(`http://localhost:8080/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setTaskName(res.data.taskName);
        setActive(res.data.active);
        setProjectId(res.data.projectId);
      })
      .catch((err) => {
        console.error("Error loading task:", err);
        toast.error("Failed to load task details");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");

    const payload = {
      taskName,
      active,
      projectId,
      ...(id ? { modifiedBy: loggedInUserId } : { createdBy: loggedInUserId }),
    };

    try {
      setLoading(true);
      if (id) {
        await axios.put(
          `http://localhost:8080/api/tasks/update/${id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Task updated successfully!");
      } else {
        await axios.post("http://localhost:8080/api/tasks/create", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Task created successfully!");
      }
      navigate("/dashboard/task");
    } catch (err) {
      console.error("Error saving task:", err);
      toast.error("Something went wrong while saving task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={600} mx="auto" mt={5} p={3} component={Paper} elevation={3}>
      <Typography variant="h5" align="center" gutterBottom>
        {id ? "Update Task" : "Add Task"}
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Task Name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            margin="normal"
            required
          />

          {/* Project Dropdown */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Project</InputLabel>
            <Select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
            >
              {projects.map((p) => (
                <MenuItem key={p.projectId} value={p.projectId}>
                  {p.projectName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Active Switch */}
          <FormControlLabel
            control={
              <Switch
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                color="primary"
              />
            }
            label={active ? "Active" : "Inactive"}
            sx={{ mt: 2 }}
          />

          <Box mt={3} display="flex" justifyContent="space-between">
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate("/dashboard/task")}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {id ? "Update Task" : "Add Task"}
            </Button>
          </Box>
        </form>
      )}
    </Box>
  );
};

export default AddUpdateTask;
