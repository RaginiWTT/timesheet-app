// src/components/Header.js

import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import logo from "../assets/logo_wtt.jpg";

const Header = () => {
  return (
    <AppBar position="fixed" sx={{ backgroundColor: "#1976d2", zIndex: 1300 }} elevation={2}>
      <Toolbar>
        <Box display="flex" alignItems="center" marginInlineEnd={5}>
          <img
            src={logo}
            alt="Timetrax Logo"
            height="60"
            onError={(e) => {
              const text = document.createElement("div");
              text.innerText = "Timetrax";
              text.style.fontSize = "20px";
              text.style.fontWeight = "bold";
              e.target.replaceWith(text);
            }}
          />
          <Typography
            variant="h6"
            component="div"
            sx={{
              ml: 2,
              fontWeight: "bold",
              fontSize: "1.5rem",
              letterSpacing: 1,
              color: "white",
            }}
          >
            Timetrax
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
