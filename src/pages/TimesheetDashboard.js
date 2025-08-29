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
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) {
          console.error("fetchProjects status:", res.status);
          // try to read body for debugging
          let txt = "";
          try {
            txt = await res.text();
          } catch (e) {}
          console.error("fetchProjects response body:", txt);
          return;
        }
        const data = await res.json();
        setProjects(data); // response is an array with projectId/projectName etc.
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };
    fetchProjects();
  }, [resourceId, token]);

  // Fetch tasks by projectId
  const fetchTasks = async (projectId) => {
    if (!projectId || !token) return;
    try {
      const res = await fetch(
        `http://localhost:8080/api/tasks/by-project/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        console.error("fetchTasks status:", res.status);
        return;
      }
      const data = await res.json();
      // Save tasks grouped by projectId
      setTasks((prev) => ({ ...prev, [projectId]: data }));
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  ///////////////////

  // --- new state ---
  const [timesheetExists, setTimesheetExists] = useState(false);

  // ---- NEW: check existing timesheet ----
  const checkExistingTimesheet = async (start, end) => {
    if (!token || !resourceId) return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/timesheets/check-exists?resourceId=${resourceId}&weekStartDate=${format(
          start,
          "yyyy-MM-dd"
        )}&weekEndDate=${format(end, "yyyy-MM-dd")}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        console.error("checkExistingTimesheet status:", res.status);
        return;
      }

      const exists = await res.json(); // backend returns true/false
      setTimesheetExists(exists);

      if (exists) {
        alert(
          "Timesheet already exists for this week. You cannot create another one."
        );
      }
    } catch (err) {
      console.error("Error checking existing timesheet:", err);
    }
  };
  ////////////

  // Week selection handler
  // const handleDateSelect = (date) => {
  //   if (!date) return;
  //   const start = startOfWeek(date, { weekStartsOn: 1 });
  //   const end = endOfWeek(date, { weekStartsOn: 1 });
  //   setSelectedWeek({ start, end });
  //   setWeekDates(eachDayOfInterval({ start, end }));
  // };

  // --- update handleDateSelect ---
  const handleDateSelect = (date) => {
    if (!date) return;
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    setSelectedWeek({ start, end });
    setWeekDates(eachDayOfInterval({ start, end }));

    // check if timesheet already exists for this week
    checkExistingTimesheet(start, end);
  };

  // Add new empty row
  const handleAddRow = () => {
    setRows([...rows, { project: "", task: "", hours: {} }]);
  };

  // Open dialog for editing a specific cell (rowIndex, date)
  const handleCellClick = (rowIndex, date) => {
    setCurrentEdit({ rowIndex, date });
    const existing = rows[rowIndex].hours?.[date.toDateString()] || {
      billable: 0,
      nonBillable: 0,
      description: "",
    };
    setBillableHours(existing.billable || "");
    setNonBillableHours(existing.nonBillable || "");
    setDescription(existing.description || "");
    setOpenDialog(true);
  };

  // Save values from popup into rows
  const handleSaveHours = () => {
    if (!billableHours || !description) {
      alert("Billable Hours and Description are required.");
      return;
    }
    const updated = [...rows];
    if (!updated[currentEdit.rowIndex].hours)
      updated[currentEdit.rowIndex].hours = {};
    updated[currentEdit.rowIndex].hours[currentEdit.date.toDateString()] = {
      billable: Number(billableHours),
      nonBillable: Number(nonBillableHours) || 0,
      description,
    };
    setRows(updated);
    setOpenDialog(false);
  };

  // Row totals
  const getRowTotal = (row) => {
    let billable = 0,
      nonBillable = 0;
    Object.values(row.hours || {}).forEach((h) => {
      billable += Number(h.billable || 0);
      nonBillable += Number(h.nonBillable || 0);
    });
    return { billable, nonBillable };
  };

  // Grand total
  const getGrandTotal = () => {
    let billable = 0,
      nonBillable = 0;
    rows.forEach((row) => {
      Object.values(row.hours || {}).forEach((h) => {
        billable += Number(h.billable || 0);
        nonBillable += Number(h.nonBillable || 0);
      });
    });
    return { billable, nonBillable };
  };

  // ---- NEW: build payload and POST to backend ----
  const handleSave = async () => {
    try {
      if (!token || !resourceId) {
        alert("Session expired or missing. Please login again.");
        return;
      }

      // Build lines[]
      const lines = [];

      // iterate rows
      for (const row of rows) {
        // skip incomplete row (no project or no task)
        if (!row.project || !row.task) continue;

        // collect hours for this line across selected weekDates
        const hoursArr = [];

        for (const d of weekDates) {
          const dateKey = d.toDateString();
          const entry = row.hours?.[dateKey];
          // only include if user provided some data (billable/nonBillable >0 or description present)
          if (
            entry &&
            ((Number(entry.billable) || 0) > 0 ||
              (Number(entry.nonBillable) || 0) > 0 ||
              (entry.description && entry.description.trim() !== ""))
          ) {
            hoursArr.push({
              weekDate: format(d, "yyyy-MM-dd"),
              workingHours_Billable: Number(entry.billable) || 0,
              workingHours_NotBillable: Number(entry.nonBillable) || 0,
              notes: entry.description || "",
              createdBy: Number(resourceId), // as per your note: createdBy is logged in user
            });
          }
        }

        // if no hours added for this row, skip it
        if (hoursArr.length === 0) continue;

        lines.push({
          projectId: Number(row.project),
          taskId: Number(row.task),
          status: "New",
          createdBy: Number(resourceId),
          hours: hoursArr,
        });
      }

      if (lines.length === 0) {
        alert(
          "No project/task with hours to save. Please add hours before saving."
        );
        return;
      }

      const payload = {
        resourceId: Number(resourceId),
        createdBy: Number(resourceId), // createdBy same as logged-in user
        weekStartDate: format(selectedWeek.start, "yyyy-MM-dd"),
        weekEndDate: format(selectedWeek.end, "yyyy-MM-dd"),
        statusId: 1,
        lines,
      };

      // POST to backend
      const res = await fetch("http://localhost:8080/api/timesheets/submit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // success
        alert("Timesheet saved successfully.");
        // optionally you can clear rows or mark as saved — keeping rows as-is for now
        return;
      } else {
        // try to parse server error message
        let errorText = `Server returned ${res.status}`;
        try {
          const errJson = await res.json();
          if (errJson && errJson.message) errorText = errJson.message;
          else errorText = JSON.stringify(errJson);
        } catch (e) {
          // fallback to text
          try {
            const txt = await res.text();
            if (txt) errorText = txt;
          } catch (e2) {}
        }
        alert("Failed to save timesheet: " + errorText);
      }
    } catch (err) {
      console.error("Error while saving timesheet:", err);
      alert("Error while saving timesheet. See console for details.");
    }
  };

  // keep submit as before (you can wire it to a different endpoint if needed)
  const handleSubmit = () => {
    alert("Submit pressed (not implemented).");
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

            {selectedWeek.start && selectedWeek.end && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Week Start: {selectedWeek.start.toDateString()}
                </Typography>
                <Typography variant="body2">
                  Week End: {selectedWeek.end.toDateString()}
                </Typography>
              </Box>
            )}
          </Box>
        </Drawer>

        {/* Main content */}
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, mt: 8, overflow: "hidden" }}
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
                    <Table
                      stickyHeader
                      size="small"
                      sx={{
                        minWidth: 1400,
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
                                      row.hours?.[date.toDateString()]
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
                {/* <Box sx={{ display: "flex", gap: 2 }}>
                  <Button variant="outlined" onClick={handleSave}>Save</Button>
                  <Button variant="contained" onClick={handleSubmit}>Submit</Button>
                </Box> */}
                // --- update Save button ---
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleSave}
                    disabled={timesheetExists} // disable if exists
                  >
                    Save
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={timesheetExists} // disable if exists
                  >
                    Submit
                  </Button>
                </Box>
              </Box>
            </>
          )}

          {/* Dialog */}
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
