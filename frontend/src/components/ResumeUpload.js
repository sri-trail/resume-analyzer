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

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (
        !['application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ].includes(selected.type)
      ) {
        setError('Invalid file type. Please upload a PDF or DOCX file.');
        setFile(null);
      } else if (selected.size > 10 * 1024 * 1024) {
        setFileSizeError('File size exceeds the 10MB limit. Please upload a smaller file.');
        setFile(null);
      } else {
        setFile(selected);
        setError(null);
        setFileSizeError(null);
      }
    }
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
      form.append('resume', file);

      const res = await fetch('http://localhost:5000/api/resume/upload', {
        method: 'POST',
        body: form
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Server error during upload');
      }

      // Expecting JSON fields: summary, skills, recommendations
      const { summary, skills, recommendations } = json.analysisData || json;
      setAnalysisData({ summary, skills, recommendations });
      setFile(null);
    } catch (err) {
      console.error(err);
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
        type="file"
        onChange={handleFileChange}
        disabled={isUploading}
        aria-label="Upload resume"
        style={{
          padding: '10px',
          backgroundColor: 'white',
          borderRadius: 8,
          border: '1px solid #ccc',
          marginBottom: 20,
          cursor: 'pointer'
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
          '&:hover': { backgroundColor: '#0056b3' }
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
