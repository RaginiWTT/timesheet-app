import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Drawer,
  Toolbar,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";

const drawerWidth = 260;

const TimesheetDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [rows, setRows] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState({ start: null, end: null });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState({ description: "", billable: "", nonBillable: "" });
  const [activeCell, setActiveCell] = useState(null);

  const userName = localStorage.getItem("userName");
  const email = localStorage.getItem("email");
  const resourceId = localStorage.getItem("resourceId"); // logged-in user resourceId

  // Fetch projects assigned to user
  useEffect(() => {
     console.log("Token:", localStorage.getItem("token"));
    const fetchProjects = async () => {
     

      try {
        const res = await fetch(`http://localhost:8080/api/assign-resource/resource/${resourceId}`, {
           headers: {
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json"
  }
        });
        const data = await res.json();

        const today = new Date();
        const arr = data
          .filter(
            (item) =>
              new Date(item.fromDate) <= today && new Date(item.toDate) >= today
          )
          .map((item) => ({
            id: item.projectId,
            name: item.projectName,
          }));

        setProjects(arr);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };
    if (resourceId) fetchProjects();
  }, [resourceId]);

  // Fetch tasks for a project
  const fetchTasks = async (projectId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/tasks/by-project/${projectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  // Calculate week start & end
  const handleDateSelect = (date) => {
    if (!date) return;
    const day = date.getDay();
    const diffToStart = date.getDate() - day;
    const start = new Date(date.setDate(diffToStart));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    setSelectedWeek({ start, end });
  };

  // Generate week days list
  const getWeekDays = () => {
    if (!selectedWeek.start) return [];
    const days = [];
    let current = new Date(selectedWeek.start);
    while (current <= selectedWeek.end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  // Open popup for hours
  const handleOpenDialog = (rowIndex, dateKey) => {
    setActiveCell({ rowIndex, dateKey });
    const existing = rows[rowIndex].hours?.[dateKey] || { description: "", billable: "", nonBillable: "" };
    setDialogData(existing);
    setDialogOpen(true);
  };

  const handleDialogSave = () => {
    if (!dialogData.billable || !dialogData.description) return; // validation
    const updated = [...rows];
    if (!updated[activeCell.rowIndex].hours) updated[activeCell.rowIndex].hours = {};
    updated[activeCell.rowIndex].hours[activeCell.dateKey] = dialogData;
    setRows(updated);
    setDialogOpen(false);
  };

  const handleAddRow = () => {
    setRows([...rows, { project: "", task: "", hours: {} }]);
  };

  // Compute totals
  const computeRowTotal = (hours) => {
    let billable = 0,
      nonBillable = 0;
    if (hours) {
      Object.values(hours).forEach((h) => {
        billable += Number(h.billable || 0);
        nonBillable += Number(h.nonBillable || 0);
      });
    }
    return { billable, nonBillable };
  };

  const computeGrandTotal = () => {
    let billable = 0,
      nonBillable = 0;
    rows.forEach((row) => {
      const t = computeRowTotal(row.hours);
      billable += t.billable;
      nonBillable += t.nonBillable;
    });
    return { billable, nonBillable };
  };

  const weekDays = getWeekDays();
  const grandTotal = computeGrandTotal();

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box", backgroundColor: "#f0f0f0" },
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
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 6 }}>
        <Toolbar />
        <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: "auto" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell><b>Project</b></TableCell>
                <TableCell><b>Task</b></TableCell>
                {weekDays.map((d, i) => (
                  <TableCell key={i}>
                    <b>
                      {d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                    </b>
                    <br />
                    {d.toLocaleDateString("en-US", { weekday: "short" })}
                  </TableCell>
                ))}
                <TableCell><b>Billable | NonBillable Hours</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, rowIndex) => {
                const total = computeRowTotal(row.hours);
                return (
                  <TableRow key={rowIndex}>
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
                          <MenuItem key={p.id} value={p.id}>
                            {p.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
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
                        {tasks
                          .filter((t) => t.projectId === row.project)
                          .map((t) => (
                            <MenuItem key={t.taskId} value={t.taskId}>
                              {t.taskName}
                            </MenuItem>
                          ))}
                      </TextField>
                    </TableCell>
                    {weekDays.map((d, i) => {
                      const dateKey = d.toDateString();
                      const value = row.hours?.[dateKey];
                      return (
                        <TableCell
                          key={i}
                          onClick={() => handleOpenDialog(rowIndex, dateKey)}
                          sx={{ cursor: "pointer", textAlign: "center" }}
                        >
                          {value ? `${value.billable || 0} | ${value.nonBillable || 0}` : "0 | 0"}
                        </TableCell>
                      );
                    })}
                    <TableCell>{`${total.billable} | ${total.nonBillable}`}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add Row */}
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddRow}
          >
            Add Project | Task
          </Button>
        </Box>

        {/* Grand Total */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">
            Grand Total: {grandTotal.billable} | {grandTotal.nonBillable}
          </Typography>
        </Box>

        {/* Save & Submit */}
        <Box
          sx={{
            mt: 3,
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            position: "sticky",
            bottom: 10,
            backgroundColor: "#fff",
            p: 2,
          }}
        >
          <Button variant="outlined">Save</Button>
          <Button variant="contained" color="primary">Submit</Button>
        </Box>
      </Box>

      {/* Popup for hours */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Enter Details</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            value={dialogData.description}
            onChange={(e) => setDialogData({ ...dialogData, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Billable Hours"
            type="number"
            fullWidth
            value={dialogData.billable}
            onChange={(e) => setDialogData({ ...dialogData, billable: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Non-Billable Hours"
            type="number"
            fullWidth
            value={dialogData.nonBillable}
            onChange={(e) => setDialogData({ ...dialogData, nonBillable: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDialogSave} variant="contained">OK</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimesheetDashboard;
