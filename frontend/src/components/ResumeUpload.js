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
  Divider
} from '@mui/material';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [fileSizeError, setFileSizeError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);

  // This should point at your Node backend!!
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (
      ![
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ].includes(selected.type)
    ) {
      setError('Invalid file type. Please upload a PDF or DOCX file.');
      setFile(null);
      setAnalysisData(null);
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setFileSizeError('File size exceeds the 10 MB limit. Please upload a smaller file.');
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
      setError('Please select a resume file first');
      return;
    }

    setIsUploading(true);
    setLoading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append('resume', file);  // <-- must match multer’s upload.single('resume')

      // ⚠️ Note the URL here: /api/analyze
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        body: form
      });

      const text = await res.text();
      if (!res.ok) {
        throw new Error(`Server error ${res.status}: ${text}`);
      }

      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error('Invalid JSON response from server.');
      }

      // Flask returns { summary, skills, recommendations }
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
        p: 3
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
          cursor: isUploading ? 'not-allowed' : 'pointer'
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
          mb: 2
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

          <Typography variant="h6">Summary:</Typography>
          <Typography paragraph>
            {analysisData.summary || 'No summary available.'}
          </Typography>

          <Typography variant="h6">Skills:</Typography>
          {analysisData.skills?.length ? (
            <ul>
              {analysisData.skills.map((skill, i) => (
                <li key={i}>
                  <Typography>{skill}</Typography>
                </li>
              ))}
            </ul>
          ) : (
            <Typography>No skills detected.</Typography>
          )}

          <Typography variant="h6">Recommendations:</Typography>
          <Typography paragraph>
            {analysisData.recommendations || 'No recommendations available.'}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ResumeUpload;
