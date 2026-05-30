import React from "react";
import { Box, LinearProgress, Typography } from "@mui/material";

const ScoreBar = ({ label, value }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ fontWeight: "bold", mb: 0.5 }}>{label}</Typography>
      <LinearProgress
        variant="determinate"
        value={value || 0}
        sx={{
          height: 10,
          borderRadius: 5,
          "& .MuiLinearProgress-bar": {
            backgroundColor: value >= 70 ? "#4caf50" : "#ff9800",
          },
        }}
      />
      <Typography sx={{ mt: 0.5, opacity: 0.7 }}>{value || 0}%</Typography>
    </Box>
  );
};

export default ScoreBar;
