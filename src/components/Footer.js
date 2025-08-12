import React from "react";
import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#1565c0",
        color: "white",
        textAlign: "center",
        py: 1,
        mt: "auto",
      }}
    >
      <Typography variant="body2">
        © {new Date().getFullYear()} Timetrax. All Rights Reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
