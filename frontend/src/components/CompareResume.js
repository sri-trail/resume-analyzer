import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  Divider,
  Alert
} from "@mui/material";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import {
  compareResumeToJob,
  generateTailoredResume,
  generateCoverLetter
} from "../api";

const CompareResume = ({ resumeData }) => {
  const [jobDescription, setJobDescription] = useState("");

  const [loadingCompare, setLoadingCompare] = useState(false);
  const [loadingTailored, setLoadingTailored] = useState(false);
  const [loadingCover, setLoadingCover] = useState(false);

  const [result, setResult] = useState(null);
  const [tailoredResume, setTailoredResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [error, setError] = useState("");

  // ONLY one of: "none" | "compare" | "resume" | "cover"
  const [activeSection, setActiveSection] = useState("none");

  const resumeText = resumeData?.extractedText || "";

  const handleCompare = async () => {
    if (!resumeText.trim()) {
      setError("No resume found. Please upload a resume first.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please paste a job description.");
      return;
    }

    setError("");
    setTailoredResume("");
    setCoverLetter("");
    setResult(null);
    setActiveSection("compare");

    try {
      setLoadingCompare(true);
      const data = await compareResumeToJob(resumeText, jobDescription);

      if (!data) {
        setError("Failed to compare resume and job description.");
        setActiveSection("none");
        return;
      }

      setResult({
        matchScore: data.matchScore || 0,
        missingKeywords: data.missingKeywords || [],
        missingSkills: data.missingSkills || [],
        presentKeywords: data.presentKeywords || [],
        experienceAlignment: data.experienceAlignment || {
          summary: "",
          details: []
        },
        jobKeywords: data.jobKeywords || {},
        improvedSummary: data.improvedSummary || "",
        improvedBullets: data.improvedBullets || [],
        recommendations: data.recommendations || []
      });
    } catch (err) {
      console.error("Compare Error:", err);
      setError("An error occurred while comparing. Please try again.");
      setActiveSection("none");
    } finally {
      setLoadingCompare(false);
    }
  };

  const handleGenerateTailoredResume = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError("Please ensure resume and job description are provided.");
      return;
    }

    setError("");
    setResult(null);
    setCoverLetter("");
    setTailoredResume("");
    setActiveSection("resume");

    try {
      setLoadingTailored(true);
      const data = await generateTailoredResume(resumeText, jobDescription);

      if (data?.tailoredResume) {
        setTailoredResume(data.tailoredResume);
      } else {
        setError("Failed to generate tailored resume.");
        setActiveSection("none");
      }
    } catch (err) {
      console.error("Tailored Resume Error:", err);
      setError("An error occurred while generating tailored resume.");
      setActiveSection("none");
    } finally {
      setLoadingTailored(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError("Please ensure resume and job description are provided.");
      return;
    }

    setError("");
    setResult(null);
    setTailoredResume("");
    setCoverLetter("");
    setActiveSection("cover");

    try {
      setLoadingCover(true);
      const data = await generateCoverLetter(resumeText, jobDescription);

      if (data?.coverLetter) {
        setCoverLetter(data.coverLetter);
      } else {
        setError("Failed to generate cover letter.");
        setActiveSection("none");
      }
    } catch (err) {
      console.error("Cover Letter Error:", err);
      setError("An error occurred while generating cover letter.");
      setActiveSection("none");
    } finally {
      setLoadingCover(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, py: 4 }}>
      <Typography
        variant="h4"
        sx={{ mb: 3, fontWeight: "bold", textAlign: "center" }}
      >
        Job Description Comparison
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      <TextField
        label="Paste Job Description"
        multiline
        minRows={10}
        fullWidth
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCompare}
          disabled={loadingCompare}
        >
          {loadingCompare ? "Comparing..." : "Compare"}
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          onClick={handleGenerateTailoredResume}
          disabled={loadingTailored}
          sx={{ ml: 2 }}
        >
          {loadingTailored ? "Generating..." : "Generate Tailored Resume"}
        </Button>

        <Button
          variant="outlined"
          color="success"
          onClick={handleGenerateCoverLetter}
          disabled={loadingCover}
          sx={{ ml: 2 }}
        >
          {loadingCover ? "Generating..." : "Generate Cover Letter"}
        </Button>
      </Box>

      {loadingCompare && (
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {activeSection === "compare" && result && (
        <Box sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 3 }}>
          <Card sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              ATS Match Score
            </Typography>

            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <CircularProgress
                variant="determinate"
                value={result.matchScore}
                size={150}
                thickness={5}
                color={
                  result.matchScore >= 80
                    ? "success"
                    : result.matchScore >= 60
                    ? "warning"
                    : "error"
                }
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: "absolute",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  fontWeight: "bold"
                }}
              >
                {result.matchScore}%
              </Box>
            </Box>
          </Card>

          <Card>
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <ErrorOutlineIcon color="error" /> Missing Keywords
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {result.missingKeywords.length > 0 ? (
                  result.missingKeywords.map((kw, i) => (
                    <Chip key={i} label={kw} color="error" />
                  ))
                ) : (
                  <Typography>No missing keywords 🎉</Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <ErrorOutlineIcon color="warning" /> Missing Skills
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {result.missingSkills.length > 0 ? (
                  result.missingSkills.map((skill, i) => (
                    <Chip key={i} label={skill} color="warning" />
                  ))
                ) : (
                  <Typography>No missing skills 🎉</Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <TrendingUpIcon color="primary" /> Experience Alignment
              </Typography>

              <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                {result.experienceAlignment.summary}
              </Typography>

              <List>
                {result.experienceAlignment.details.map((item, i) => (
                  <React.Fragment key={i}>
                    <ListItem>
                      <strong>{item.section}:</strong>&nbsp; {item.score}%
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <TipsAndUpdatesIcon color="primary" /> Job Description Keywords
              </Typography>

              {Object.entries(result.jobKeywords).map(([key, list]) => (
                <Box key={key} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    {key.replace(/([A-Z])/g, " $1").toUpperCase()}
                  </Typography>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {list.map((kw, i) => (
                      <Chip key={i} label={kw} variant="outlined" />
                    ))}
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <TipsAndUpdatesIcon color="primary" /> Improved Summary
              </Typography>

              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {result.improvedSummary}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <TipsAndUpdatesIcon color="primary" /> Improved Bullet Points
              </Typography>

              <List>
                {result.improvedBullets.map((bullet, i) => (
                  <ListItem key={i}>• {bullet}</ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <CheckCircleIcon color="success" /> Recommendations
              </Typography>

              <List>
                {result.recommendations.map((rec, i) => (
                  <ListItem key={i}>• {rec}</ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      )}

      {activeSection === "resume" && tailoredResume && (
        <Box sx={{ mt: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Tailored Resume
              </Typography>

              <Typography
                variant="body1"
                sx={{ whiteSpace: "pre-wrap", opacity: 0.9 }}
              >
                {tailoredResume}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {activeSection === "cover" && coverLetter && (
        <Box sx={{ mt: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Tailored Cover Letter
              </Typography>

              <Typography
                variant="body1"
                sx={{ whiteSpace: "pre-wrap", opacity: 0.9 }}
              >
                {coverLetter}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button variant="outlined" color="primary" href="/dashboard">
          Back to Dashboard
        </Button>
      </Box>
    </Box>
  );
};

export default CompareResume;
