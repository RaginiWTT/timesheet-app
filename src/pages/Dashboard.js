import React, { useState, useEffect } from "react";
import {
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
} from "@mui/material";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import FolderIcon from "@mui/icons-material/Folder";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useLocation, useNavigate, Outlet } from "react-router-dom";

const drawerWidth = 240;

const adminMenuItems = [
  { text: "Resource Management", icon: <PersonIcon />, path: "resource" },
  { text: "Customer Management", icon: <GroupIcon />, path: "customer" },
  { text: "Project Management", icon: <FolderIcon />, path: "project" },
  { text: "Project Task Management", icon: <AssignmentIcon />, path: "task" },
];

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openAdmin, setOpenAdmin] = useState(false);
  const role = localStorage.getItem("role"); // 👈 Get role

  // Expand admin dropdown if already on admin page
  useEffect(() => {
    const isAdminPath = adminMenuItems.some((item) =>
      location.pathname.includes(item.path)
    );
    setOpenAdmin(isAdminPath);
  }, [location.pathname]);

  const handleAdminClick = () => {
    setOpenAdmin(!openAdmin);
  };

  return (
    <>
      <CssBaseline />
      <Header />

      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Box sx={{ display: "flex", flexGrow: 1 }}>
          {/* Sidebar */}
          <Drawer
            variant="permanent"
            anchor="left"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                mt: "64px",
                height: "calc(100vh - 64px)",
                boxSizing: "border-box",
                backgroundColor: "#f8f9fa",
                borderRight: "1px solid #ddd",
              },
            }}
          >
            <List>
              {/* Only render Admin dropdown for role 1 */}
              {role === "1" && (
                <>
                  <ListItemButton onClick={handleAdminClick}>
                    <ListItemIcon>
                      <FolderIcon />
                    </ListItemIcon>
                    <ListItemText primary="Admin" />
                    {openAdmin ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>

                  <Collapse in={openAdmin} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {adminMenuItems.map((item, index) => (
                        <ListItemButton
                          key={index}
                          sx={{
                            pl: 5,
                            py: 1.2,
                            "&:hover": { backgroundColor: "#e3f2fd" },
                            backgroundColor:
                              location.pathname.endsWith(item.path)
                                ? "#bbdefb"
                                : "inherit",
                          }}
                          onClick={() => navigate(item.path)}
                        >
                          <ListItemIcon sx={{ minWidth: "32px" }}>{item.icon}</ListItemIcon>
                          <ListItemText
                            primary={item.text}
                            primaryTypographyProps={{
                              fontSize: "0.85rem",
                              noWrap: true,
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </>
              )}

              {/* Common menu items visible to all */}
              <ListItemButton
                sx={{
                  pl: 3,
                  py: 1.5,
                  "&:hover": { backgroundColor: "#e3f2fd" },
                  backgroundColor:
                    location.pathname.endsWith("/timesheet") ? "#bbdefb" : "inherit",
                }}
                onClick={() => navigate("timesheet")}
              >
                <ListItemIcon>
                  <AccessTimeIcon />
                </ListItemIcon>
                <ListItemText primary="Timesheet" />
              </ListItemButton>
            </List>

            <Divider />
          </Drawer>

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              bgcolor: "#f0f2f5",
              p: 3,
              mt: "64px",
              width: `calc(100% - ${drawerWidth}px)`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Outlet />
            </Box>
            <Footer />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Dashboard;
