import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import { Add, Edit } from "@mui/icons-material";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ProjectManagement = () => {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  // Fetch customers for dropdown
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    axios
      .get("http://localhost:8080/api/customer/active", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCustomers(res.data))
      .catch(() => toast.error("Failed to load customers"));
  }, []);

  // Fetch projects (all or by customer)
  useEffect(() => {
    fetchProjects();
  }, [selectedCustomer]);

  const fetchProjects = () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    let url = "http://localhost:8080/api/project/all";
    if (selectedCustomer) {
      url = `http://localhost:8080/api/project/customer/${selectedCustomer}`;
    }
    axios
      .get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProjects(res.data))
      .catch(() => toast.error("Failed to load projects"))
      .finally(() => setLoading(false));
  };

  // Filtered & Paginated data
  const filteredProjects = projects.filter(
    (p) =>
      p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customer?.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedProjects = filteredProjects.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Box p={2}>
      {/* Header Row */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Typography variant="h5" fontWeight="bold">
          Project Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ textTransform: "none", height: 40 }}
          onClick={() => navigate("/dashboard/project/add")}
        >
          Add Project
        </Button>
      </Box>

      {/* Filters Row */}
      <Box display="flex" gap={2} mb={1}>
        {/* Customer Dropdown */}
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>Select Customer</InputLabel>
          <Select
            value={selectedCustomer}
            onChange={(e) => {
              setSelectedCustomer(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">All Customers</MenuItem>
            {customers.map((customer) => (
              <MenuItem key={customer.customerId} value={customer.customerId}>
                {customer.customerName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Search Box */}
        <TextField
          placeholder="Search by project or customer"
            size="small"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          fullWidth
        />
      </Box>

      {/* Project Table */}
      <Paper>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 350 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow sx={{ "& th": { padding: "6px 12px" } }}>
                  <TableCell sx={{ fontWeight: "bold", background: "#f5f5f5" }}>Project Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold", background: "#f5f5f5" }}>Project Description</TableCell>
                  <TableCell sx={{ fontWeight: "bold", background: "#f5f5f5" }}>Customer Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold", background: "#f5f5f5" }}>Active</TableCell>
                  <TableCell sx={{ fontWeight: "bold", background: "#f5f5f5" }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProjects.map((project) => (
                  <TableRow
                    key={project.projectId}
                    sx={{ "& td": { padding: "6px 12px" } }}
                  >
                    <TableCell>{project.projectName}</TableCell>
                    <TableCell>{project.projectDescription}</TableCell>
                    <TableCell>{project.customer?.customerName}</TableCell>
                    <TableCell>{project.active ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() =>
                          navigate(
                            `/dashboard/project/update/${project.projectId}`
                          )
                        }
                      >
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={Math.ceil(filteredProjects.length / itemsPerPage)}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default ProjectManagement;
