import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Drawer,
  Toolbar,
  Typography,
  Divider,
  Table,
  TableHead,
  TableContainer,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
// import {
//   Box,
//   Paper,              // 👈 Add this
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TextField,
//   MenuItem,
// } from '@mui/material';
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import AddIcon from "@mui/icons-material/Add";
import Header from "../components/Header";
import Footer from "../components/Footer";

const drawerWidth = 280;

const TimesheetDashboard = () => {
  const [selectedWeek, setSelectedWeek] = useState({ start: null, end: null });
  const [weekDates, setWeekDates] = useState([]);
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentEdit, setCurrentEdit] = useState({
    rowIndex: null,
    date: null,
  });
  const [billableHours, setBillableHours] = useState("");
  const [nonBillableHours, setNonBillableHours] = useState("");
  const [description, setDescription] = useState("");

  const [projects, setProjects] = useState([]); // project dropdown data
  const [tasks, setTasks] = useState({}); // tasks mapped by projectId

  const userName =
    localStorage.getItem("firstName") + " " + localStorage.getItem("lastName");
  const email = localStorage.getItem("emailId");
  const resourceId = localStorage.getItem("resourceId");
  const token = localStorage.getItem("accessToken");
  // Fetch projects for logged-in user
  useEffect(() => {
    const fetchProjects = async () => {
      if (!resourceId || !token) return;
      try {
        const res = await fetch(
          `http://localhost:8080/api/assign-resource/resource/${resourceId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch projects");
        const data = await res.json();
        setProjects(data); // response is an array
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };
    fetchProjects();
  }, [resourceId, token]);

  // Fetch tasks by projectId
  // Fetch tasks by projectId
  const fetchTasks = async (projectId) => {
    if (!projectId || !token) return;
    try {
      const res = await fetch(
        `http://localhost:8080/api/tasks/by-project/${projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();

      // Save tasks under the projectId
      setTasks((prev) => ({ ...prev, [projectId]: data }));
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  // Week selection
  const handleDateSelect = (date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    setSelectedWeek({ start, end });
    setWeekDates(eachDayOfInterval({ start, end }));
  };

  // Add row
  const handleAddRow = () => {
    const newRow = { project: "", task: "", hours: {} };
    setRows([...rows, newRow]);
  };

  // Open popup
  const handleCellClick = (rowIndex, date) => {
    setCurrentEdit({ rowIndex, date });
    const existing = rows[rowIndex].hours[date.toDateString()] || {
      billable: 0,
      nonBillable: 0,
      description: "",
    };
    setBillableHours(existing.billable || "");
    setNonBillableHours(existing.nonBillable || "");
    setDescription(existing.description || "");
    setOpenDialog(true);
  };

  // Save popup values
  const handleSaveHours = () => {
    if (!billableHours || !description) {
      alert("Billable Hours and Description are required");
      return;
    }
    const updated = [...rows];
    updated[currentEdit.rowIndex].hours[currentEdit.date.toDateString()] = {
      billable: Number(billableHours),
      nonBillable: Number(nonBillableHours),
      description,
    };
    setRows(updated);
    setOpenDialog(false);
  };

  // Row total
  const getRowTotal = (row) => {
    let billable = 0,
      nonBillable = 0;
    Object.values(row.hours).forEach((h) => {
      billable += h.billable || 0;
      nonBillable += h.nonBillable || 0;
    });
    return { billable, nonBillable };
  };

  // Grand total
  const getGrandTotal = () => {
    let billable = 0,
      nonBillable = 0;
    rows.forEach((row) => {
      Object.values(row.hours).forEach((h) => {
        billable += h.billable || 0;
        nonBillable += h.nonBillable || 0;
      });
    });
    return { billable, nonBillable };
  };

  const handleSave = () => {
    alert("Timesheet saved (mock, no localStorage now)");
  };

  const handleSubmit = () => {
    alert("Timesheet submitted!");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header />
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
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
              Name : {userName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Email : {email}
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: "bold" }}>
              Select Week
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Pick any day"
                value={selectedWeek.start}
                onChange={handleDateSelect}
                slotProps={{ textField: { fullWidth: true, size: "small" } }}
              />
            </LocalizationProvider>
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Toolbar />
          {weekDates.length > 0 && (
            <>
              <Box
                sx={{
                  mt: 3,
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                {/* <Box sx={{ flexGrow: 1, overflow: "auto" }}>
                  <TableContainer
                    component={Paper}
                    sx={{ width: "100%", overflowX: "auto" }} // 👈 horizontal scroll here
                  > */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0,
                    minHeight: 0,
                  }}
                >
                  <TableContainer
                    component={Paper}
                    sx={{
                      width: "100%",
                      maxWidth: "100%",
                      minWidth: 0,
                      overflowX: "auto",
                      overflowY: "hidden",
                    }}
                  >
                    {/* <Table stickyHeader> */}
                    <Table
                      stickyHeader
                      size="small"
                      sx={{
                        minWidth: 1400, // bump to 1600/1800 if needed
                        "& th, & td": { whiteSpace: "nowrap" },
                      }}
                    >
                      <TableHead>
                        <TableRow
                          sx={{ "& th": { backgroundColor: "#f0f0f0" } }}
                        >
                          <TableCell>
                            <b>Project</b>
                          </TableCell>
                          <TableCell>
                            <b>Task</b>
                          </TableCell>
                          {weekDates.map((date) => (
                            <TableCell key={date}>
                              <b>{format(date, "MMM-dd-yyyy")}</b>
                              <br />
                              <small>{format(date, "EEE")}</small>
                            </TableCell>
                          ))}
                          <TableCell>
                            <b>Billable | NonBillable Hours</b>
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {rows.map((row, rowIndex) => {
                          const totals = getRowTotal(row);
                          return (
                            <TableRow key={rowIndex}>
                              {/* Project dropdown */}
                              <TableCell>
                                <TextField
                                  select
                                  value={row.project}
                                  onChange={(e) => {
                                    const updated = [...rows];
                                    updated[rowIndex].project = e.target.value;
                                    updated[rowIndex].task = "";
                                    setRows(updated);
                                    fetchTasks(e.target.value);
                                  }}
                                  fullWidth
                                  size="small"
                                >
                                  {projects.map((p) => (
                                    <MenuItem
                                      key={p.projectId}
                                      value={p.projectId}
                                    >
                                      {p.projectName}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </TableCell>

                              {/* Task dropdown */}
                              <TableCell>
                                <TextField
                                  select
                                  value={row.task}
                                  onChange={(e) => {
                                    const updated = [...rows];
                                    updated[rowIndex].task = e.target.value;
                                    setRows(updated);
                                  }}
                                  fullWidth
                                  size="small"
                                >
                                  {(tasks[row.project] || []).map((t) => (
                                    <MenuItem key={t.taskId} value={t.taskId}>
                                      {t.taskName}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              </TableCell>

                              {/* Hours per day */}
                              {weekDates.map((date) => (
                                <TableCell key={date}>
                                  <TextField
                                    value={
                                      row.hours[date.toDateString()]
                                        ? `${
                                            row.hours[date.toDateString()]
                                              .billable || 0
                                          } | ${
                                            row.hours[date.toDateString()]
                                              .nonBillable || 0
                                          }`
                                        : "0 | 0"
                                    }
                                    onClick={() =>
                                      handleCellClick(rowIndex, date)
                                    }
                                    fullWidth
                                    InputProps={{ readOnly: true }}
                                  />
                                </TableCell>
                              ))}

                              <TableCell>
                                {totals.billable} | {totals.nonBillable}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>

              <Box sx={{ mt: 2 }}>
                <TextField
                  value={`Grand Total: ${getGrandTotal().billable} | ${
                    getGrandTotal().nonBillable
                  }`}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Box>

              <Box
                sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}
              >
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddRow}
                >
                  Add Project | Task
                </Button>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button variant="outlined" onClick={handleSave}>
                    Save
                  </Button>
                  <Button variant="contained" onClick={handleSubmit}>
                    Submit
                  </Button>
                </Box>
              </Box>
            </>
          )}

          {/* Popup dialog */}
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
            <DialogTitle>Enter Details</DialogTitle>
            <DialogContent>
              <TextField
                label="Description"
                fullWidth
                margin="normal"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <TextField
                label="Billable Hours"
                type="number"
                fullWidth
                margin="normal"
                value={billableHours}
                onChange={(e) => setBillableHours(e.target.value)}
              />
              <TextField
                label="Non-Billable Hours"
                type="number"
                fullWidth
                margin="normal"
                value={nonBillableHours}
                onChange={(e) => setNonBillableHours(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveHours} variant="contained">
                OK
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default TimesheetDashboard;
