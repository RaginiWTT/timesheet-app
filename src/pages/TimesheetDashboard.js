import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Drawer,
  Divider,
  Toolbar,
  CssBaseline,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import AddIcon from "@mui/icons-material/Add";
import Header from "../components/Header";
import Footer from "../components/Footer";

const drawerWidth = 280;

const TimesheetDashboard = () => {
  const [selectedWeek, setSelectedWeek] = useState({ start: null, end: null });
  const [rows, setRows] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState({ rowId: null, date: null, description: "", hours: "" });

  // Mock project/task data
  const projects = [
    { id: 1, name: "Timesheet App" },
    { id: 2, name: "ERP System" },
  ];
  const tasks = {
    1: [{ id: 1, name: "Build UI" }, { id: 2, name: "Backend API" }],
    2: [{ id: 3, name: "Database Schema" }, { id: 4, name: "Integrations" }],
  };

  const userName = localStorage.getItem("userName") || "John Doe";
  const email = localStorage.getItem("email") || "john.doe@example.com";

  // Restore saved data
  useEffect(() => {
    const savedData = localStorage.getItem("timesheetData");
    if (savedData) {
      setRows(JSON.parse(savedData));
    }
  }, []);

  const handleDateSelect = (date) => {
    if (!date) return;
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    setSelectedWeek({ start, end });
  };

  const handleAddRow = () => {
    setRows([
      ...rows,
      { projectId: "", taskId: "", hours: {}, descriptions: {}, id: Date.now() },
    ]);
  };

  const handleRowChange = (rowId, field, value) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
  };

  // Popup logic
  const handleOpenDialog = (rowId, date, currentHour, currentDesc) => {
    setDialogData({
      rowId,
      date,
      hours: currentHour || "",
      description: currentDesc || "",
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogData({ rowId: null, date: null, description: "", hours: "" });
  };

  const handleSaveDialog = () => {
    const { rowId, date, hours, description } = dialogData;
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              hours: { ...row.hours, [date.toDateString()]: hours || 0 },
              descriptions: { ...row.descriptions, [date.toDateString()]: description },
            }
          : row
      )
    );
    handleCloseDialog();
  };

  // Save to localStorage
  const handleSaveToLocal = () => {
    localStorage.setItem("timesheetData", JSON.stringify(rows));
    alert("Timesheet saved locally ✅");
  };

  // Submit (for now mock)
  const handleSubmit = () => {
    console.log("Submitting Timesheet:", rows);
    alert("Timesheet submitted 🚀 (mock)");
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Header />

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box", backgroundColor: "#f5f5f5" },
        }}
      >
        <Toolbar />
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">MyTimesheet</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1">{userName}</Typography>
          <Typography variant="body2" color="textSecondary">{email}</Typography>
          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" sx={{ mt: 2 }}>Select Week</Typography>
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
              <Typography variant="body2">Week Start: {selectedWeek.start.toDateString()}</Typography>
              <Typography variant="body2">Week End: {selectedWeek.end.toDateString()}</Typography>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Main */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "background.default", p: 3, minHeight: "100vh" }}>
        <Toolbar />
        <Paper sx={{ p: 4, minHeight: "80vh" }}>
          <Typography variant="h5">Timesheet</Typography>

          {selectedWeek.start && selectedWeek.end ? (
            <TableContainer sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Project</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Task</TableCell>
                    {eachDayOfInterval({ start: selectedWeek.start, end: selectedWeek.end }).map((date) => (
                      <TableCell key={date.toDateString()} sx={{ fontWeight: "bold" }}>
                        {date.toLocaleDateString()}
                      </TableCell>
                    ))}
                    <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Select value={row.projectId} onChange={(e) => handleRowChange(row.id, "projectId", e.target.value)} fullWidth size="small">
                          {projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select value={row.taskId} onChange={(e) => handleRowChange(row.id, "taskId", e.target.value)} fullWidth size="small" disabled={!row.projectId}>
                          {row.projectId && tasks[row.projectId]?.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                        </Select>
                      </TableCell>
                      {eachDayOfInterval({ start: selectedWeek.start, end: selectedWeek.end }).map((date) => (
                        <TableCell
                          key={date.toDateString()}
                          onClick={() => handleOpenDialog(row.id, date, row.hours[date.toDateString()], row.descriptions[date.toDateString()])}
                          sx={{ cursor: "pointer" }}
                        >
                          {row.hours[date.toDateString()] || 0}
                        </TableCell>
                      ))}
                      <TableCell>
                        <IconButton onClick={handleAddRow}><AddIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {rows.length === 0 && (
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddRow}>Add Project|Task</Button>
                </Box>
              )}
            </TableContainer>
          ) : (
            <Typography sx={{ mt: 3 }}>Select a week to start filling timesheet.</Typography>
          )}
        </Paper>

        {/* Fixed Save & Submit Buttons */}
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: drawerWidth,
            right: 0,
            p: 2,
            bgcolor: "white",
            borderTop: "1px solid #ddd",
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
          }}
        >
          <Button variant="outlined" onClick={handleSaveToLocal}>Save</Button>
          <Button variant="contained" onClick={handleSubmit}>Submit</Button>
        </Box>

        <Footer />
      </Box>

      {/* Popup Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Fill Timesheet</DialogTitle>
        <DialogContent>
          <TextField
            label="Description"
            fullWidth
            margin="dense"
            value={dialogData.description}
            onChange={(e) => setDialogData({ ...dialogData, description: e.target.value })}
          />
          <TextField
            label="Hours"
            type="number"
            fullWidth
            margin="dense"
            value={dialogData.hours}
            onChange={(e) => setDialogData({ ...dialogData, hours: e.target.value })}
            inputProps={{ min: 0, max: 24 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveDialog} variant="contained">OK</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimesheetDashboard;
