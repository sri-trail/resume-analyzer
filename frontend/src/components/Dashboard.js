import React from "react";
import {
  Box,
  Typography,
  Divider,
  Chip,
  Grid,
  Card,
  CardContent
} from "@mui/material";
import ATSScore from "../components/ATSScore";

const Dashboard = ({ resumeData }) => {
  const safe = (arr) => (Array.isArray(arr) ? arr : []);

  if (!resumeData) {
    return (
      <Box sx={{ textAlign: "center", padding: 6 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
          No Resume Uploaded
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.8 }}>
          Please upload a resume to view your analysis.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4, maxWidth: 1100, margin: "0 auto" }}>
      <Typography
        variant="h4"
        sx={{ mb: 4, textAlign: "center", fontWeight: "bold" }}
      >
        Resume Analysis Dashboard
      </Typography>

      {/* TOP SCORES */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <ATSScore score={resumeData.ats_score || 0} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: 3,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              padding: 3
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              Overall Score
            </Typography>
            <Chip
              label={`${resumeData.overall_score || 0}/10`}
              color={(resumeData.overall_score || 0) >= 7 ? "success" : "warning"}
              sx={{ fontSize: "20px", padding: "12px 24px" }}
            />
          </Card>
        </Grid>
      </Grid>

      {/* SUMMARY */}
      <Card sx={{ padding: 3, borderRadius: 3, boxShadow: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Summary
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Typography sx={{ mt: 1, opacity: 0.9 }}>
          {resumeData.summary || "No summary available."}
        </Typography>
      </Card>

      {/* STRENGTHS + WEAKNESSES */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ padding: 3, borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Strengths
            </Typography>
            <Divider sx={{ my: 1 }} />
            <ul>
              {safe(resumeData.strengths).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ padding: 3, borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Weaknesses
            </Typography>
            <Divider sx={{ my: 1 }} />
            <ul>
              {safe(resumeData.weaknesses).map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </Card>
        </Grid>
      </Grid>

      {/* MISSING KEYWORDS */}
      <Card sx={{ padding: 3, borderRadius: 3, boxShadow: 3, mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Missing Keywords
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
          {safe(resumeData.missing_keywords).map((skill, i) => (
            <Chip key={i} label={skill} variant="outlined" />
          ))}
        </Box>
      </Card>

      {/* SUGGESTED BULLETS */}
      <Card sx={{ padding: 3, borderRadius: 3, boxShadow: 3, mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Suggested Bullet Points
        </Typography>
        <Divider sx={{ my: 1 }} />
        <ul>
          {safe(resumeData.suggested_bullets).map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </Card>
    </Box>
  );
};

export default Dashboard;
