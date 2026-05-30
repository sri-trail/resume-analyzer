import React from "react";
import { Box, Typography, LinearProgress, Paper } from "@mui/material";

const ScoreBar = ({ label, value }) => {
  const color =
    value >= 80 ? "success" : value >= 50 ? "warning" : "error";

  return (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ fontWeight: "bold", mb: 0.5 }}>
        {label}: {value}%
      </Typography>
      <LinearProgress
        variant="determinate"
        value={value}
        color={color}
        sx={{ height: 10, borderRadius: 5 }}
      />
    </Box>
  );
};

const ResumeStrengthMeter = ({ scores }) => {
  const total =
    (scores.ats +
      scores.keywords +
      scores.experience +
      scores.skills +
      scores.formatting) /
    5;

  return (
    <Paper
      elevation={4}
      sx={{ p: 3, borderRadius: 3, mt: 4, background: "#fdfdfd" }}
    >
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
        Resume Strength Meter
      </Typography>

      <ScoreBar label="ATS Match" value={scores.ats} />
      <ScoreBar label="Keyword Match" value={scores.keywords} />
      <ScoreBar label="Experience Quality" value={scores.experience} />
      <ScoreBar label="Skills Coverage" value={scores.skills} />
      <ScoreBar label="Formatting Score" value={scores.formatting} />

      <Typography
        variant="h6"
        sx={{ mt: 3, textAlign: "center", fontWeight: "bold" }}
      >
        Overall Score: {Math.round(total)}%
      </Typography>
    </Paper>
  );
};

export default ResumeStrengthMeter;
