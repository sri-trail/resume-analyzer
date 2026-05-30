import React, { useState } from "react";
import {
  Button,
  Typography,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  Paper
} from "@mui/material";

const ResumeUpload = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [popup, setPopup] = useState({ open: false, message: "", severity: "error" });
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://localhost:10000";

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/jpeg",
    "image/png"
  ];

  const showPopup = (message, severity = "error") => {
    setPopup({ open: true, message, severity });
  };

  const handleFileChange = (selected) => {
    if (!selected) return;

    if (!allowedTypes.includes(selected.type)) {
      showPopup("Unsupported file type. Upload PDF, DOCX, DOC, TXT, JPG, or PNG.");
      setFile(null);
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      showPopup("File size exceeds the 10 MB limit.");
      setFile(null);
      return;
    }

    setFile(selected);
    showPopup(`Selected: ${selected.name}`, "info");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const selected = e.dataTransfer.files[0];
    handleFileChange(selected);
  };

  const handleUpload = async () => {
    if (!file) {
      showPopup("Please select a resume file first.");
      return;
    }

    setLoading(true);

    try {
      // STEP 1: Extract text
      const form = new FormData();
      form.append("resume", file);

      const extractRes = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        body: form
      });

      const raw = await extractRes.text();
      let extractJson;

      if (extractRes.headers.get("content-type")?.includes("application/json")) {
        extractJson = JSON.parse(raw);
      } else {
        throw new Error("Server returned non‑JSON response while extracting text.");
      }

      if (!extractRes.ok) {
        throw new Error(extractJson?.error || "Failed to extract text.");
      }

      const extractedText = extractJson.extractedText;

      // STEP 2: ATS analysis
      const atsRes = await fetch(`${API_BASE}/analyze-resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: extractedText })
      });

      const atsJson = await atsRes.json();

      if (!atsRes.ok) {
        throw new Error(atsJson?.error || "Failed to analyze resume.");
      }

      // STEP 3: AI‑enhanced PDF → Word conversion (ONLY if PDF)
      
      if (file.type === "application/pdf") {
        const convertForm = new FormData();
        convertForm.append("file", file);

        const convertRes = await fetch(`${API_BASE}/convert/pdf-to-word`, {
          method: "POST",
          body: convertForm
        });

        if (!convertRes.ok) {
          throw new Error("PDF → Word conversion failed.");
        }

        const blob = await convertRes.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = file.name.replace(".pdf", "_cleaned.docx");
        a.click();
      }

      // STEP 4: Send ATS results to dashboard
      onUpload({
        ...atsJson,
        extractedText
      });

      showPopup("Resume analyzed successfully!", "success");

      setFile(null);
      const input = document.getElementById("resume-upload");
      if (input) input.value = "";

    } catch (err) {
      console.error("Upload error:", err);
      showPopup(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "0 auto", padding: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        Upload Your Resume
      </Typography>

      <Paper
        elevation={3}
        sx={{
          padding: 4,
          borderRadius: 3,
          textAlign: "center",
          border: "2px dashed #888",
          cursor: "pointer",
          mb: 3,
          backgroundColor: "#fafafa"
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => document.getElementById("resume-upload").click()}
      >
        <Typography sx={{ mb: 2 }}>
          Drag & drop your resume here, or click to select a file
        </Typography>

        <input
          id="resume-upload"
          name="resume"
          type="file"
          onChange={(e) => handleFileChange(e.target.files[0])}
          disabled={loading}
          style={{ display: "none" }}
        />

        <Button
          variant="outlined"
          onClick={() => document.getElementById("resume-upload").click()}
        >
          Choose File
        </Button>

        {file && (
          <Typography sx={{ mt: 2, fontWeight: "bold" }}>
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </Typography>
        )}
      </Paper>

      <Button
        variant="contained"
        fullWidth
        onClick={handleUpload}
        disabled={!file || loading}
        sx={{ py: 1.5, borderRadius: 2 }}
      >
        {loading ? "Uploading..." : "Upload Resume"}
      </Button>

      {loading && (
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <CircularProgress />
        </Box>
      )}

      <Snackbar
        open={popup.open}
        autoHideDuration={5000}
        onClose={() => setPopup({ ...popup, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setPopup({ ...popup, open: false })}
          severity={popup.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {popup.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResumeUpload;
