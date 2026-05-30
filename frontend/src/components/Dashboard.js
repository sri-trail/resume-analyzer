import React, { useState } from "react";
import {
  Box,
  Card,
  Typography,
  Chip,
  Grid,
  List,
  ListItem,
  Divider,
  LinearProgress,
  Button,
  Stack
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DownloadIcon from "@mui/icons-material/Download";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

import html2pdf from "html2pdf.js";
import CircleMeter from "./CircleMeter";

const Dashboard = ({ resumeData }) => {
  const [convertFile, setConvertFile] = useState(null);

  if (!resumeData) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", mt: 6, textAlign: "center" }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
          No resume loaded
        </Typography>
        <Typography sx={{ opacity: 0.8 }}>
          Please upload a resume first to see your ATS analysis.
        </Typography>
      </Box>
    );
  }

  const {
    matchScore = 0,
    missingKeywords = [],
    presentKeywords = [],
    experienceAlignment = { summary: "", details: [] },
    improvedSummary = "",
    improvedBullets = [],
    recommendations = []
  } = resumeData.analysis || resumeData;

  // -----------------------------
  // DOWNLOAD PDF
  // -----------------------------
  const downloadPDF = () => {
    const element = document.getElementById("ats-report");
    const options = {
      margin: 0.5,
      filename: "ATS_Report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
    };
    html2pdf().set(options).from(element).save();
  };

  // -----------------------------
  // FILE CONVERTERS
  // -----------------------------
  const handleConvertFileChange = (e) => {
    setConvertFile(e.target.files[0] || null);
  };

  const convertWordToPdf = async () => {
    if (!convertFile) return;
    const formData = new FormData();
    formData.append("file", convertFile);

    const res = await fetch("http://localhost:10000/convert/word-to-pdf", {
      method: "POST",
      body: formData
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      convertFile.name.replace(/\.(doc|docx)$/i, "") + "_converted.pdf";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const convertPdfToWord = async () => {
    if (!convertFile) return;
    const formData = new FormData();
    formData.append("file", convertFile);

    const res = await fetch("http://localhost:10000/convert/pdf-to-word", {
      method: "POST",
      body: formData
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      convertFile.name.replace(/\.pdf$/i, "") + "_converted.docx";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // -----------------------------
  // RENDER UI
  // -----------------------------
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, py: 4 }}>
      {/* TOP ACTION BAR */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
          gap: 2,
          flexWrap: "wrap"
        }}
      >
        {/* LEFT SIDE: DOWNLOAD BUTTONS */}
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={downloadPDF}
          >
            Download PDF
          </Button>
        </Stack>

        {/* RIGHT SIDE: FILE CONVERTERS */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Button variant="outlined" component="label">
            Choose File
            <input
              type="file"
              hidden
              onChange={handleConvertFileChange}
              accept=".pdf,.doc,.docx"
            />
          </Button>

          <Typography sx={{ maxWidth: 200, fontSize: 12, opacity: 0.8 }}>
            {convertFile ? convertFile.name : "No file selected"}
          </Typography>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<SwapHorizIcon />}
            onClick={convertWordToPdf}
            disabled={!convertFile || !/\.(doc|docx)$/i.test(convertFile.name)}
          >
            Word → PDF
          </Button>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<SwapHorizIcon />}
            onClick={convertPdfToWord}
            disabled={!convertFile || !/\.pdf$/i.test(convertFile.name)}
          >
            PDF → Word
          </Button>
        </Stack>
      </Box>

      {/* ATS REPORT CONTENT */}
      <Box id="ats-report" sx={{ p: 2, background: "white" }}>
        <Typography
          variant="h4"
          sx={{ mb: 3, fontWeight: "bold", textAlign: "center" }}
        >
          Resume ATS Dashboard
        </Typography>

        {/* SCORE + EXPERIENCE */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
                ATS Match Score
              </Typography>

              {CircleMeter ? (
                <CircleMeter value={matchScore} size={150} />
              ) : (
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: "bold",
                    color: "primary.main",
                    mt: 2,
                    mb: 1
                  }}
                >
                  {matchScore}%
                </Typography>
              )}

              <Typography sx={{ opacity: 0.8, mt: 1 }}>
                {matchScore >= 80
                  ? "Great match! You’re highly aligned with this role."
                  : matchScore >= 60
                  ? "Decent match. Improve keywords and experience alignment."
                  : "Low match. Consider tailoring your resume more to this job."}
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ p: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 1,
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <TrendingUpIcon color="primary" /> Experience Alignment
              </Typography>

              <Typography sx={{ mb: 2, opacity: 0.9 }}>
                {experienceAlignment.summary ||
                  "Your experience alignment summary will appear here."}
              </Typography>

              {experienceAlignment.details?.length > 0 && (
                <List dense>
                  {experienceAlignment.details.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <ListItem sx={{ display: "block" }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 0.5
                          }}
                        >
                          <Typography sx={{ fontWeight: "bold" }}>
                            {item.section}
                          </Typography>
                          <Typography sx={{ fontWeight: "bold" }}>
                            {item.score}%
                          </Typography>
                        </Box>

                        <LinearProgress
                          variant="determinate"
                          value={item.score}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </ListItem>

                      {idx < experienceAlignment.details.length - 1 && (
                        <Divider />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Card>
          </Grid>
        </Grid>

        {/* KEYWORDS */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 1.5,
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <ErrorOutlineIcon color="error" /> Missing Keywords
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {missingKeywords.length > 0 ? (
                  missingKeywords.map((kw, i) => (
                    <Chip key={i} label={kw} color="error" size="small" />
                  ))
                ) : (
                  <Typography sx={{ opacity: 0.8 }}>
                    No missing keywords 🎉
                  </Typography>
                )}
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 1.5,
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <CheckCircleIcon color="success" /> Present Keywords
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {presentKeywords.length > 0 ? (
                  presentKeywords.map((kw, i) => (
                    <Chip
                      key={i}
                      label={kw}
                      color="success"
                      size="small"
                      variant="outlined"
                    />
                  ))
                ) : (
                  <Typography sx={{ opacity: 0.8 }}>
                    No recognized keywords yet. Try adding more role-specific
                    terms.
                  </Typography>
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* AI SUMMARY + BULLETS */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, height: "100%" }}>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 1.5,
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <TipsAndUpdatesIcon color="primary" /> AI Improved Summary
              </Typography>

              <Typography sx={{ whiteSpace: "pre-wrap", opacity: 0.9 }}>
                {improvedSummary ||
                  "Your AI improved professional summary will appear here."}
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, height: "100%" }}>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 1.5,
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <TipsAndUpdatesIcon color="primary" /> AI Improved Bullet Points
              </Typography>

              {improvedBullets?.length > 0 ? (
                <List dense>
                  {improvedBullets.map((bullet, i) => (
                    <ListItem key={i} sx={{ display: "list-item", pl: 2 }}>
                      {bullet}
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography sx={{ opacity: 0.9 }}>
                  Improved bullet points will appear here once analysis is
                  complete.
                </Typography>
              )}
            </Card>
          </Grid>
        </Grid>

        {/* RECOMMENDATIONS */}
        <Box sx={{ mt: 3 }}>
          <Card sx={{ p: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{
                mb: 1.5,
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: 1
              }}
            >
              <CheckCircleIcon color="success" /> Recommendations
            </Typography>

            {recommendations?.length > 0 ? (
              <List dense>
                {recommendations.map((rec, i) => (
                  <ListItem key={i} sx={{ display: "list-item", pl: 2 }}>
                    {rec}
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography sx={{ opacity: 0.9 }}>
                Tailored recommendations will appear here after analysis.
              </Typography>
            )}
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
