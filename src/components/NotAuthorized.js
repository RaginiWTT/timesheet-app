import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotAuthorized = () => {
  const navigate = useNavigate();
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="80vh">
      <Typography variant="h4" color="error" gutterBottom>
        🚫 Access Denied
      </Typography>
      <Typography variant="body1" mb={2}>
        You do not have permission to view this page.
      </Typography>
      <Button variant="contained" onClick={() => navigate("/dashboard")}>
        Go to Dashboard
      </Button>
    </Box>
  );
};

export default NotAuthorized;
