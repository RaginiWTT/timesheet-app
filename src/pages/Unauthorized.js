// src/pages/Unauthorized.js
import React from "react";
import { Typography, Container } from "@mui/material";

const Unauthorized = () => {
  return (
    <Container sx={{ mt: 8 }}>
      <Typography variant="h4" color="error" gutterBottom>
        Unauthorized Access
      </Typography>
      <Typography>
        You do not have permission to view this page. Please contact your administrator.
      </Typography>
    </Container>
  );
};

export default Unauthorized;
