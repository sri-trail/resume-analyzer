import { AppBar, Toolbar, Typography, Container, Link } from '@mui/material';
import React, { useState } from 'react';
import { Route, Routes, Link as RouterLink, useNavigate } from 'react-router-dom';
import ResumeUpload from './components/ResumeUpload';
import Terms from './components/Terms';
import Privacy from './components/Privacy';
import Dashboard from './components/Dashboard'; // ✅ Correct casing

const App = () => {
  const [resumeData, setResumeData] = useState(null);
  const navigate = useNavigate();

  const handleResumeUpload = (data) => {
    setResumeData(data);
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            AI Resume Analyzer
          </Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ marginTop: 4, textAlign: 'center' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} /> {/* ✅ Add this */}
          <Route path="/upload" element={<ResumeUpload onUpload={handleResumeUpload} />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

        </Routes>

        <footer style={{ marginTop: '20px', textAlign: 'center', padding: '10px 0' }}>
          <Link component={RouterLink} to="/terms" sx={{ marginRight: 2, fontSize: '14px' }}>
            Terms
          </Link>
          <Link component={RouterLink} to="/privacy" sx={{ fontSize: '14px' }}>
            Privacy
          </Link>
        </footer>
      </Container>
    </>
  );
};

export default App;
