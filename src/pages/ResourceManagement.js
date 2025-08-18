import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  Tooltip,
  TablePagination,
  TextField,
  LinearProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import api from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";

const ResourceManagement = () => {
  const [resources, setResources] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchResources = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await api.get("http://localhost:8080/api/resource/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResources(res.data);
    } catch (err) {
      console.error("Error fetching resources", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // ✅ Refresh the list if we came back from AddResource page
  useEffect(() => {
    if (location.state?.refresh) {
      fetchResources();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // const handleModify = (id) => {
  //   navigate(`/dashboard/resource/${id}/edit`);
  // };

  // Modify navigation to point to update page
const handleModify = (id) => {
  navigate(`/dashboard/resource/update/${id}`);
};


  const handleAddResource = () => {
    navigate("/dashboard/resource/add");
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const filteredResources = resources.filter((res) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      `${res.firstName} ${res.lastName}`.toLowerCase().includes(searchLower) ||
      res.emailId.toLowerCase().includes(searchLower) ||
      (res.phoneNumber && res.phoneNumber.toLowerCase().includes(searchLower))
    );
  });

  const displayedResources = filteredResources.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3, backgroundColor: "White", height: "100%" }}>
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Top row */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title="Add New Resource">
            <IconButton color="primary" onClick={handleAddResource}>
              <AddCircleIcon fontSize="large" />
            </IconButton>
          </Tooltip>
          <Typography variant="h5" fontWeight="bold">
            Resource Management
          </Typography>
        </Box>

        <TextField
          variant="outlined"
          size="small"
          placeholder="Search by name, email, or phone"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 200 }}
        />
      </Box>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          maxHeight: "65vh",
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: "#f1f1f1", fontWeight: "bold" }}>
                Full Name
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1", fontWeight: "bold" }}>
                Email
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1", fontWeight: "bold" }}>
                Phone Number
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1", fontWeight: "bold" }}>
                User Type
              </TableCell>
              <TableCell sx={{ backgroundColor: "#f1f1f1", fontWeight: "bold" }}>
                Status
              </TableCell>
              <TableCell
                sx={{ backgroundColor: "#f1f1f1", fontWeight: "bold" }}
                align="center"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedResources.map((res) => (
              <TableRow
                key={res.resourceId}
                sx={{
                  "&:hover": { backgroundColor: "#f0f8ff" },
                  height: 45,
                }}
              >
                <TableCell>{`${res.firstName} ${res.lastName}`}</TableCell>
                <TableCell>{res.emailId}</TableCell>
                <TableCell>{res.phoneNumber}</TableCell>
                <TableCell>{res.role === 1 ? "Admin" : "User"}</TableCell>
                <TableCell>{res.active ? "Active" : "Inactive"}</TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleModify(res.resourceId)}
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredResources.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No resources found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredResources.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10]}
        />
      </TableContainer>
    </Box>
  );
};

export default ResourceManagement;
