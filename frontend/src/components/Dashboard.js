import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleNavigateToUpload = () => {
    navigate('/upload');
  };

  return (
    <Box sx={{ textAlign: 'center', padding: 3 }}>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Welcome to the Dashboard
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: 3 }}>
        Manage your resume analysis and explore helpful job application suggestions.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleNavigateToUpload}
        sx={{ padding: '10px 20px', borderRadius: '8px' }}
      >
        Upload Resume
      </Button>
    </Box>
  );
};

export default Dashboard;
