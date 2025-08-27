import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Pagination,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";

const AssignResourceManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const token = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  // Fetch active customers
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/customer/active", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCustomers(res.data))
      .catch(() => toast.error("Failed to load customers"));
  }, [token]);

  // Fetch projects when customer selected
  useEffect(() => {
    if (!selectedCustomer) {
      setProjects([]);
      return;
    }
    axios
      .get(`http://localhost:8080/api/project/customer/${selectedCustomer}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProjects(res.data))
      .catch(() => toast.error("Failed to load projects"));
  }, [selectedCustomer, token]);

  // Fetch assignments
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      //let url = "http://localhost:8080/api/assign-resource/all";
      let url="";
      if (selectedProject) {
         url = `http://localhost:8080/api/assign-resource/project/${selectedProject}`;
      }
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignments(res.data);
      setPage(1); // reset pagination on reload
    } catch {
      toast.error("Failed to load assigned resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [selectedProject]);

  // Paginated data
  const paginatedAssignments = assignments.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <Box backgroundColor="white" p={3} borderRadius={2}   >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" align="center" fontWeight="bold">
          Manage Assigned Resources
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          color="primary"
          onClick={() => navigate("/dashboard/assign-resource/add-update")}
        >
          Assign Resource
        </Button>
      </Box>

      {/* Dropdown Filters */}
      <Box display="flex" gap={2} mb={3}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Customer</InputLabel>
          <Select
            value={selectedCustomer}
            onChange={(e) => {
              setSelectedCustomer(e.target.value);
              setSelectedProject(""); // reset project
              setAssignments([]);
            }}
          >
            {customers.map((c) => (
              <MenuItem key={c.customerId} value={c.customerId}>
                {c.customerName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }} disabled={!selectedCustomer}>
          <InputLabel>Project</InputLabel>
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

      {/* Table */}
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Resource Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Project Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>From Date</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>To Date</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedAssignments.length > 0 ? (
                paginatedAssignments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.resourceName}</TableCell>
                    <TableCell>{a.projectName}</TableCell>
                    <TableCell>{a.fromDate}</TableCell>
                    <TableCell>{a.toDate}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() =>
                          navigate(`/dashboard/assign-resource/add-update/${a.id}`)
                        }
                      >
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No assigned resources found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={Math.ceil(assignments.length / rowsPerPage)}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default AssignResourceManagement;
