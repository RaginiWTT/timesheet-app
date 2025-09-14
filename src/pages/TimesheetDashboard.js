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
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  parseISO,
} from "date-fns";
import AddIcon from "@mui/icons-material/Add";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useParams, useSearchParams, useLocation } from "react-router-dom";

const drawerWidth = 280;

const TimesheetDashboard = () => {
  const { timesheetId } = useParams(); // may be undefined for new
  const [searchParams] = useSearchParams();
  const modeParam = (searchParams.get("mode") || "").toLowerCase();
  const readOnly = modeParam === "view";

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

  const [timesheetExists, setTimesheetExists] = useState(false); // only for NEW

  const userName =
    (localStorage.getItem("firstName") || "") +
    " " +
    (localStorage.getItem("lastName") || "");
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
          const txt = await res.text().catch(() => "");
          console.error("fetchProjects response body:", txt);
          return;
        }
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };
    fetchProjects();
  }, [resourceId, token]);

  // Fetch tasks by projectId (and cache)
  const fetchTasks = async (projectId) => {
    if (!projectId || !token) return;
    // already cached?
    if (tasks[projectId]) return;

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
      setTasks((prev) => ({ ...prev, [projectId]: data || [] }));
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  // Check if timesheet exists for NEW creation only
  const checkExistingTimesheet = async (start, end) => {
    if (!token || !resourceId || timesheetId) return; // don't block edit
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

      const exists = await res.json();
      setTimesheetExists(Boolean(exists));
      if (exists) {
        alert(
          "Timesheet already exists for this week. You cannot create another one."
        );
      }
    } catch (err) {
      console.error("Error checking existing timesheet:", err);
    }
  };

  // Week pick (only for NEW; for existing we’ll set from API)
  const handleDateSelect = (date) => {
    if (!date || timesheetId) return; // lock week when editing existing ts
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    setSelectedWeek({ start, end });
    setWeekDates(eachDayOfInterval({ start, end }));

    checkExistingTimesheet(start, end);
  };

  // Add new empty row
  const handleAddRow = () => {
    if (readOnly) return;
    setRows((prev) => [...prev, { project: "", task: "", hours: {} }]);
  };

  // Open popup to edit a cell
  const handleCellClick = (rowIndex, date) => {
    if (readOnly) return;
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

  // Save popup values back to table
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

  // Grand totals
  const getGrandTotal = () => {
    let billable = 0,
      nonBillable = 0;
    rows.forEach((row) => {
      Object.values(row.hours || {}).forEach((h) => {
        billable += Number(h.billable || 0);
        nonBillable += Number(h.nonBillable || 0);
      });
    });
    return { billable, nonBillable, total: billable + nonBillable };
  };

  // Build payload + POST (create or update/upsert)
  const handleSave = async () => {
    try {
      if (!token || !resourceId) {
        alert("Session expired or missing. Please login again.");
        return;
      }
      if (!selectedWeek.start || !selectedWeek.end) {
        alert("Please pick a week first.");
        return;
      }

      const lines = [];

      for (const row of rows) {
        if (!row.project || !row.task) continue;

        const hoursArr = [];
        for (const d of weekDates) {
          const dateKey = d.toDateString();
          const entry = row.hours?.[dateKey];
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
              createdBy: Number(resourceId),
            });
          }
        }

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
        alert("No project/task with hours to save.");
        return;
      }

      const payload = {
        resourceId: Number(resourceId),
        createdBy: Number(resourceId),
        statusId: 1,
        weekStartDate: format(selectedWeek.start, "yyyy-MM-dd"),
        weekEndDate: format(selectedWeek.end, "yyyy-MM-dd"),
        lines,
      };

      const res = await fetch("http://localhost:8080/api/timesheets/submit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Timesheet saved successfully.");
      } else {
        let errorText = `Server returned ${res.status}`;
        try {
          const errJson = await res.json();
          errorText = errJson?.message || JSON.stringify(errJson);
        } catch {
          const txt = await res.text().catch(() => "");
          if (txt) errorText = txt;
        }
        alert("Failed to save timesheet: " + errorText);
      }
    } catch (err) {
      console.error("Error while saving timesheet:", err);
      alert("Error while saving timesheet. See console for details.");
    }
  };

  const handleSubmit = () => {
    // hook your submit/approval flow here if different from save
    alert("Submit pressed (not implemented).");
  };

  // -------- Load Existing Timesheet (Edit/View) --------
  useEffect(() => {
    const loadExisting = async () => {
      if (!timesheetId || !token) return;

      try {
        const res = await fetch(
          `http://localhost:8080/api/timesheets/${timesheetId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) {
          console.error("loadExisting status:", res.status);
          const txt = await res.text().catch(() => "");
          console.error("loadExisting response:", txt);
          return;
        }
        const data = await res.json();

        // Set week
        const start = parseISO(data.weekStartDate);
        const end = parseISO(data.weekEndDate);
        setSelectedWeek({ start, end });
        setWeekDates(eachDayOfInterval({ start, end }));

        // Build rows
        const builtRows = (data.lines || []).map((line) => {
          const hoursMap = {};
          (line.hours || []).forEach((h) => {
            const d = parseISO(h.weekDate);
            hoursMap[d.toDateString()] = {
              billable: Number(h.workingHours_Billable || 0),
              nonBillable: Number(h.workingHours_NotBillable || 0),
              description: h.notes || "",
            };
          });
          return {
            project: line.projectId,
            task: line.taskId,
            hours: hoursMap,
          };
        });

        setRows(builtRows);

        // Preload tasks for each unique project in lines
        const uniqueProjectIds = [
          ...new Set((data.lines || []).map((l) => l.projectId)),
        ];
        uniqueProjectIds.forEach((pid) => fetchTasks(pid));
      } catch (err) {
        console.error("Error loading existing timesheet:", err);
      }
    };

    loadExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timesheetId, token]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header />
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        {/* <Drawer
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
                disabled={Boolean(timesheetId)} // lock week for existing timesheets
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
        </Drawer> */}

 

        {/* Main content */}
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 2, mt: 6, overflow: "hidden" }}
        >

                    <Box sx={{ p: 0}}>
            {/* <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Name : {userName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Email : {email}
            </Typography>
            <Divider sx={{ my: 2 }} /> */}

            <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: "bold" }}>
              Select Week
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Pick any day"
                value={selectedWeek.start}
                onChange={handleDateSelect}
                disabled={Boolean(timesheetId)} // lock week for existing timesheets
                slotProps={{ textField: { fullWidth: true, size: "small" } }}
              />
            </LocalizationProvider>

            {/* {selectedWeek.start && selectedWeek.end && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Week Start: {selectedWeek.start.toDateString()}
                </Typography>
                <Typography variant="body2">
                  Week End: {selectedWeek.end.toDateString()}
                </Typography>
              </Box>
            )} */}
          </Box>
          {/* <Toolbar /> */}
          {weekDates.length > 0 && (
            <>
              <Box
                sx={{
                  mt:1,
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
                            <TableCell key={date.toISOString()}>
                              <b>{format(date, "MM-dd-yyyy")}</b>
                              <br />
                              <small>{format(date, "EEE")}</small>
                            </TableCell>
                          ))}
                          <TableCell>
                            <b>
                              Billable |<br />
                              NonBillable Hours
                            </b>
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
                                  disabled={readOnly}
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
                                  disabled={readOnly}
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
                                <TableCell key={date.toISOString()}>
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
                                      !readOnly &&
                                      handleCellClick(rowIndex, date)
                                    }
                                    size="small"
                                    InputProps={{
                                      readOnly: true,
                                      sx: {
                                        p: 0,
                                        fontSize: "0.8rem",
                                        width: 60,
                                        textAlign: "center",
                                      }, // compact input
                                    }}
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
                  value={`Total Hours: ${getGrandTotal().billable} | ${
                    getGrandTotal().nonBillable
                  }   (Grand Total: ${getGrandTotal().total})`}
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
                  disabled={readOnly}
                >
                  Add Project | Task
                </Button>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleSave}
                    disabled={readOnly}
                  >
                    Save
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={readOnly}
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
                disabled={readOnly}
              />
              <TextField
                label="Billable Hours"
                type="number"
                fullWidth
                margin="normal"
                value={billableHours}
                onChange={(e) => setBillableHours(e.target.value)}
                disabled={readOnly}
              />
              <TextField
                label="Non-Billable Hours"
                type="number"
                fullWidth
                margin="normal"
                value={nonBillableHours}
                onChange={(e) => setNonBillableHours(e.target.value)}
                disabled={readOnly}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              {!readOnly && (
                <Button onClick={handleSaveHours} variant="contained">
                  OK
                </Button>
              )}
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default TimesheetDashboard;
