import React, { useEffect, useState } from "react";
import {
  Box,
  Toolbar,
  Drawer,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const drawerWidth = 240;

const ManageTimesheet = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTimesheets();
  }, []);

  const fetchTimesheets = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const resourceId = localStorage.getItem("resourceId");
      const response = await fetch(
        `http://localhost:8080/api/timesheets/by-resource/${resourceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch timesheets");
      }

      const data = await response.json();
      setRows(data || []);
    } catch (error) {
      console.error("Error fetching timesheets:", error);
    } finally {
      setLoading(false);
    }
  };

  const userName =
    (localStorage.getItem("firstName") || "") +
    " " +
    (localStorage.getItem("lastName") || "");
  const email = localStorage.getItem("emailId") || "";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

      <Box sx={{ display: "flex", flexGrow: 1 }}>
        {/* Sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
              backgroundColor: "#f0f0f0",
            },
          }}
        >
          <Toolbar />
          <Box sx={{ p: 2 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Name : {userName.trim() || "Guest"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Email : {email || "guest@example.com"}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: "bold" }}>
              Manage Timesheets
            </Typography>
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Manage Timesheet
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/timesheet-dashboard")}
            >
              Add New Timesheet
            </Button>
          </Box>

          {loading ? (
            <CircularProgress />
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Resource Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Week Start Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Week End Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Total Hours</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.timesheetId}>
                      <TableCell>{row.resourceName}</TableCell>
                      <TableCell>{row.weekStartDate}</TableCell>
                      <TableCell>{row.weekEndDate}</TableCell>
                      <TableCell>{row.totalHours}</TableCell>
                      <TableCell>{row.statusName}</TableCell>
                      <TableCell>
                        {row.statusName === "New" ? (
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() =>
                              navigate(`/timesheet-dashboard/${row.timesheetId}?mode=edit`)
                            }
                          >
                            Edit
                          </Button>
                        ) : (
                          <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            onClick={() =>
                              navigate(`/timesheet-dashboard/${row.timesheetId}?mode=view`)
                            }
                          >
                            View
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>

      <Footer />
    </Box>
  );
};

export default ManageTimesheet;
