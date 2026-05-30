import React from "react";
import { Card, CardContent, Typography, Chip, Box, LinearProgress } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";

const KeywordGapAnalyzer = ({ present = [], missing = [], jobKeywords = {} }) => {
  const total = present.length + missing.length;
  const coverage = total === 0 ? 0 : Math.round((present.length / total) * 100);

  // Suggested keywords = job keywords not in present or missing
  const jdKeywords = Object.values(jobKeywords).flat();
  const suggestions = jdKeywords.filter(
    (kw) => !present.includes(kw) && !missing.includes(kw)
  );

  return (
    <Card sx={{ p: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Keyword Gap Analyzer
        </Typography>

        {/* Coverage Score */}
        <Typography sx={{ fontWeight: "bold", mb: 1 }}>
          Keyword Coverage: {coverage}%
        </Typography>
        <LinearProgress
          variant="determinate"
          value={coverage}
          sx={{ height: 10, borderRadius: 5, mb: 3 }}
          color={coverage >= 70 ? "success" : coverage >= 40 ? "warning" : "error"}
        />

        {/* Present Keywords */}
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}
        >
          <CheckCircleIcon color="success" /> Present Keywords
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          {present.length > 0 ? (
            present.map((kw, i) => <Chip key={i} label={kw} color="success" />)
          ) : (
            <Typography>No present keywords found.</Typography>
          )}
        </Box>

        {/* Missing Keywords */}
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}
        >
          <ErrorOutlineIcon color="error" /> Missing Keywords
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          {missing.length > 0 ? (
            missing.map((kw, i) => <Chip key={i} label={kw} color="error" />)
          ) : (
            <Typography>No missing keywords 🎉</Typography>
          )}
        </Box>

        {/* Suggested Keywords */}
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}
        >
          <TipsAndUpdatesIcon color="primary" /> Suggested Keywords
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {suggestions.length > 0 ? (
            suggestions.map((kw, i) => <Chip key={i} label={kw} variant="outlined" />)
          ) : (
            <Typography>You're covering all major keywords 🎉</Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default KeywordGapAnalyzer;
