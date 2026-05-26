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
  const [error, setError] = useState(null);
  const [fileSizeError, setFileSizeError] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  const handleFileChange = (selected) => {
    if (!selected) return;

    // ❌ Wrong file type
    if (!allowedTypes.includes(selected.type)) {
      setError("Invalid file type. Please upload a PDF, DOC, or DOCX file.");
      setFile(null);
      return;
    }

    // ❌ Too large
    if (selected.size > 10 * 1024 * 1024) {
      setFileSizeError("File size exceeds the 10 MB limit.");
      setFile(null);
      return;
    }

    // ✔ Valid file
    setFile(selected);
    setError(null);
    setFileSizeError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const selected = e.dataTransfer.files[0];
    handleFileChange(selected);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a resume file first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append("resume", file);

      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        body: form
      });

      let json;
      try {
        json = await res.json();
      } catch {
        throw new Error("Server returned invalid JSON");
      }

      if (!res.ok) {
        throw new Error(json?.error || `Server error ${res.status}`);
      }

      onUpload(json);
      setFile(null);
      document.getElementById("resume-upload").value = "";
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "0 auto", padding: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        Upload Your Resume
      </Typography>

      {/* DRAG & DROP ZONE */}
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
      >
        <Typography sx={{ mb: 2 }}>
          Drag & drop your resume here, or click to select a file
        </Typography>

        <input
          id="resume-upload"
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

      {/* UPLOAD BUTTON */}
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

      {/* ERRORS */}
      {error && (
        <Snackbar open autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      )}

      {fileSizeError && (
        <Snackbar
          open
          autoHideDuration={6000}
          onClose={() => setFileSizeError(null)}
        >
          <Alert severity="error">{fileSizeError}</Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default ResumeUpload;
