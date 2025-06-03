// frontend/src/components/ResumeUpload.js

import React, { useState } from 'react';
import {
  Button,
  Typography,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [fileSizeError, setFileSizeError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Point to whichever backend you’ve deployed (Express or Flask).
  // E.g. "https://python-analyzer-8kda.onrender.com" or "https://resume-analyzer-backend-pcl8.onrender.com"
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:10000';

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    // only PDF or DOCX
    if (
      ![
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ].includes(selected.type)
    ) {
      setError('Invalid file type. Please upload a PDF or DOCX file.');
      setFile(null);
      setAnalysisData(null);
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setFileSizeError('File size exceeds the 10 MB limit. Please upload a smaller file.');
      setFile(null);
      setAnalysisData(null);
      return;
    }

    setFile(selected);
    setError(null);
    setFileSizeError(null);
    setAnalysisData(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a resume file first.');
      return;
    }

    setIsUploading(true);
    setLoading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append('resume', file);

      // Hit whichever “/api/analyze” your backend exposes.
      // Example for Express: `${API_BASE}/api/analyze`
      // Example for Flask: `${API_BASE}/analyze`
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        body: form,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || `Server error ${res.status}`);
      }

      // Expect { filename, preview, feedback }
      setAnalysisData(json);
      setFile(null);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f4f4f9',
        p: 3,
      }}
    >
      <Typography variant="h4" sx={{ mb: 3, color: '#333' }}>
        Upload Your Resume
      </Typography>

      <input
        id="resume-upload"
        type="file"
        onChange={handleFileChange}
        disabled={isUploading}
        style={{
          padding: '10px',
          backgroundColor: 'white',
          borderRadius: 8,
          border: '1px solid #ccc',
          marginBottom: 20,
          cursor: isUploading ? 'not-allowed' : 'pointer',
        }}
      />

      {fileSizeError && (
        <Snackbar open autoHideDuration={6000} onClose={() => setFileSizeError(null)}>
          <Alert onClose={() => setFileSizeError(null)} severity="error" sx={{ width: '100%' }}>
            {fileSizeError}
          </Alert>
        </Snackbar>
      )}

      {error && (
        <Snackbar open autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}

      <Button
        variant="contained"
        onClick={handleUpload}
        disabled={!file || isUploading}
        sx={{
          px: 3,
          py: 1.5,
          borderRadius: 2,
          backgroundColor: '#007BFF',
          '&:hover': { backgroundColor: '#0056b3' },
          mb: 2,
        }}
      >
        {isUploading ? 'Uploading...' : 'Upload Resume'}
      </Button>

      {loading && !analysisData && (
        <Box sx={{ mt: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {analysisData && (
        <Paper sx={{ p: 4, maxWidth: 600, mt: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
            Resume Analysis Results
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Typography variant="h6">Filename:</Typography>
          <Typography paragraph>{analysisData.filename}</Typography>

          <Typography variant="h6">Preview:</Typography>
          <Typography paragraph>{analysisData.preview || 'No preview available.'}</Typography>

          <Typography variant="h6">AI Feedback:</Typography>
          <Typography paragraph>{analysisData.feedback || 'No feedback available.'}</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ResumeUpload;
