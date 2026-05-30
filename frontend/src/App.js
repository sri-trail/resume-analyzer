import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Link,
  Button,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";

import React, { useState, useEffect, useRef } from "react";

import {
  Route,
  Routes,
  Link as RouterLink,
  useNavigate,
  Navigate,
  useLocation
} from "react-router-dom";

import ResumeUpload from "./components/ResumeUpload";
import Terms from "./components/Terms";
import Privacy from "./components/Privacy";
import Dashboard from "./components/Dashboard";
import CompareResume from "./components/CompareResume";

import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

// ----------------------
// Home Page
// ----------------------
const Home = ({ clearResume }) => {
  return (
    <Box sx={{ textAlign: "center", padding: 6 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
        Welcome to AI Resume Analyzer
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, opacity: 0.8 }}>
        Upload your resume or compare it with a job description.
      </Typography>

      <Button
        variant="contained"
        color="primary"
        component={RouterLink}
        to="/upload"
        onClick={clearResume}
        sx={{ px: 4, py: 1.5, borderRadius: 2, mr: 2 }}
      >
        Upload Resume
      </Button>

      <Button
        variant="outlined"
        color="primary"
        component={RouterLink}
        to="/compare"
        sx={{ px: 4, py: 1.5, borderRadius: 2 }}
      >
        Compare Resume
      </Button>
    </Box>
  );
};

// ----------------------
// Main App Component
// ----------------------
const App = ({ mode, toggleTheme }) => {
  const [resumeData, setResumeData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Clear resume on tab close
  useEffect(() => {
    const handleUnload = () => setResumeData(null);
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  const clearResume = () => setResumeData(null);

  const handleResumeUpload = (data) => {
    setResumeData(data);
    navigate("/dashboard");
  };

  // ⭐ Modern Convert Dropdown Logic
  const [anchorEl, setAnchorEl] = useState(null);
  const fileInputRef = useRef(null);
  const convertTypeRef = useRef(null);

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleSelectConversion = (type) => {
    convertTypeRef.current = type;
    handleCloseMenu();
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    if (convertTypeRef.current === "pdf-to-word") {
      await fetch("https://YOUR_BACKEND_URL/convert/pdf-to-word",  {
        method: "POST",
        body: formData
      })
        .then((res) => res.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = file.name.replace(".pdf", ".docx");
          a.click();
        });
    }

    if (convertTypeRef.current === "word-to-pdf") {
      await fetch("https://YOUR_BACKEND_URL/convert/word-to-pdf", {
        method: "POST",
        body: formData
      })
        .then((res) => res.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = file.name.replace(/\.(doc|docx)$/i, ".pdf");
          a.click();
        });
    }
  };

  return (
    <>
      <AppBar position="static" elevation={2}>
        <Toolbar sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            AI Resume Analyzer
          </Typography>

          <Button color="inherit" component={RouterLink} to="/" onClick={clearResume}>
            Home
          </Button>

          <Button color="inherit" component={RouterLink} to="/upload">
            Upload
          </Button>

          <Button color="inherit" component={RouterLink} to="/compare">
            Compare
          </Button>

          {/* ⭐ Modern Convert Dropdown */}
          <Button
            color="inherit"
            onClick={handleOpenMenu}
            startIcon={<SwapHorizIcon />}
            sx={{
              fontWeight: "bold",
              textTransform: "none",
              ml: 1
            }}
          >
            Convert
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            PaperProps={{
              elevation: 4,
              sx: { borderRadius: 2, minWidth: 220 }
            }}
          >
            <MenuItem onClick={() => handleSelectConversion("pdf-to-word")}>
              <ListItemIcon>
                <PictureAsPdfIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="PDF → Word (.docx)" />
            </MenuItem>

            <MenuItem onClick={() => handleSelectConversion("word-to-pdf")}>
              <ListItemIcon>
                <DescriptionIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Word (.docx) → PDF" />
            </MenuItem>
          </Menu>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <Button color="inherit" onClick={toggleTheme}>
            {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
          </Button>
        </Toolbar>
      </AppBar>

      {/* Debug Bar */}
      <Box sx={{ background: "#111", color: "white", p: 1, fontSize: "14px" }}>
        <div>PATH: {location.pathname}</div>
        <div>HAS RESUME: {resumeData ? "YES" : "NO"}</div>
      </Box>

      <Box sx={{ minHeight: "85vh", paddingTop: 4 }}>
        <Container sx={{ textAlign: "center" }}>
          <Routes>
            <Route path="/" element={<Home clearResume={clearResume} />} />

            <Route
              path="/upload"
              element={<ResumeUpload onUpload={handleResumeUpload} />}
            />

            <Route
              path="/dashboard"
              element={
                resumeData ? (
                  <Dashboard resumeData={resumeData} />
                ) : (
                  <Navigate to="/upload" replace />
                )
              }
            />

            <Route
              path="/compare"
              element={
                resumeData ? (
                  <CompareResume resumeData={resumeData} />
                ) : (
                  <Navigate to="/upload" replace />
                )
              }
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
        <Link component={RouterLink} to="/terms" sx={{ marginRight: 2, fontSize: "14px" }}>
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
