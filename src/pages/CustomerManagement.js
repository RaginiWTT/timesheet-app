import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Pagination,
  TextField,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const itemsPerPage = 10;

const CustomerManagement = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get("http://localhost:8080/api/customer/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = () => {
    navigate("/dashboard/customer/add");
  };

  const handleEditCustomer = (customerId) => {
    navigate(`/dashboard/customer/update/${customerId}`);
  };

  // Filter customers by search query (name, email, phone)
  const filteredCustomers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => {
      const fields = [
        c.customerName,
        c.email,
        c.phoneNumber,
        c.active ? "active" : "inactive",
      ];
      return fields.some((v) => String(v || "").toLowerCase().includes(q));
    });
  }, [customers, query]);

  // Reset to first page whenever the filter changes
  useEffect(() => {
    setPage(1);
  }, [query]);

  const paginatedCustomers = useMemo(
    () =>
      filteredCustomers.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [filteredCustomers, page]
  );

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: "#fff",
        borderRadius: 2,
        p: 3,
        boxShadow: 2,
        height: "calc(100vh - 130px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header: title, search, add button */}
      <Box
        display="flex"
        alignItems="center"
        gap={2}
        mb={2}
        sx={{ flexWrap: "wrap" }}
      >
        <Typography variant="h5" fontWeight="bold" sx={{ mr: "auto" }}>
          Customer Management
        </Typography>

        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, phone, active/inactive"
          size="small"
          sx={{ minWidth: 280 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: query ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddCustomer}
        >
          Add Customer
        </Button>
      </Box>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{ flex: 1, overflow: "auto", borderRadius: 2 }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", background: "#f5f5f5" }}>
                  Customer Name
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", background: "#f5f5f5" }}>
                  Email
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", background: "#f5f5f5" }}>
                  Phone Number
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", background: "#f5f5f5" }}>
                  Active
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", background: "#f5f5f5" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((cust) => (
                  <TableRow key={cust.customerId} hover>
                    <TableCell>{cust.customerName}</TableCell>
                    <TableCell>{cust.email}</TableCell>
                    <TableCell>{cust.phoneNumber}</TableCell>
                    <TableCell>{cust.active ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditCustomer(cust.customerId)}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {query
                      ? "No customers match your search."
                      : "No Customers Found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Pagination */}
      {filteredCustomers.length > itemsPerPage && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={Math.ceil(filteredCustomers.length / itemsPerPage)}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default CustomerManagement;
