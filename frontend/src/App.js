import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Link,
  Button,
  Box
} from "@mui/material";
import React, { useState } from "react";
import {
  Route,
  Routes,
  Link as RouterLink,
  useNavigate
} from "react-router-dom";

import ResumeUpload from "./components/ResumeUpload";
import Terms from "./components/Terms";
import Privacy from "./components/Privacy";
import Dashboard from "./components/Dashboard";

// Simple Home Page
const Home = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ textAlign: "center", padding: 6 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
        Welcome to AI Resume Analyzer
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, opacity: 0.8 }}>
        Upload your resume to receive AI‑powered insights.
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/upload")}
        sx={{ px: 4, py: 1.5, borderRadius: 2 }}
      >
        Upload Resume
      </Button>
    </Box>
  );
};

const App = () => {
  const [resumeData, setResumeData] = useState(null);
  const navigate = useNavigate();

  const handleResumeUpload = (data) => {
    setResumeData(data);
    navigate("/dashboard"); // Go to dashboard after upload
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            AI Resume Analyzer
          </Typography>

          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            disabled={window.location.pathname === "/"}
          >
            Home
          </Button>

          <Button
            color="inherit"
            component={RouterLink}
            to="/upload"
            disabled={window.location.pathname === "/upload"}
          >
            Upload
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ minHeight: "85vh", paddingTop: 4 }}>
        <Container sx={{ textAlign: "center" }}>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route
              path="/upload"
              element={<ResumeUpload onUpload={handleResumeUpload} />}
            />

            <Route
              path="/dashboard"
              element={<Dashboard resumeData={resumeData} />}
            />

            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            <Route path="*" element={<Typography>Page not found</Typography>} />
          </Routes>
        </Container>
      </Box>

      <footer
        style={{
          marginTop: "20px",
          textAlign: "center",
          padding: "10px 0"
        }}
      >
        <Link
          component={RouterLink}
          to="/terms"
          sx={{ marginRight: 2, fontSize: "14px" }}
        >
          Terms
        </Link>
        <Link component={RouterLink} to="/privacy" sx={{ fontSize: "14px" }}>
          Privacy
        </Link>
      </footer>
    </>
  );
};

export default App;
