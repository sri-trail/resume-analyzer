import React from "react";
import { Box, Typography } from "@mui/material";

const CircleMeter = ({ value = 0, label = "" }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <Box sx={{ textAlign: "center" }}>
      <svg width="150" height="150">
        <circle
          cx="75"
          cy="75"
          r={radius}
          stroke="#e0e0e0"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="75"
          cy="75"
          r={radius}
          stroke="#4caf50"
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "0.6s ease" }}
        />
      </svg>

      <Typography variant="h5" sx={{ mt: -8, fontWeight: "bold" }}>
        {value}%
      </Typography>

      <Typography variant="body1" sx={{ mt: 1, opacity: 0.8 }}>
        {label}
      </Typography>
    </Box>
  );
};

export default CircleMeter;
