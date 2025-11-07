import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Button, Typography, Box } from "@mui/material";

function Topbar() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));

  // ✅ Reactively track login/logout across browser tabs
  useEffect(() => {
    const handleStorageChange = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  }

  function handleLogin() {
    navigate("/login");
  }

  function handleSignup() {
    navigate("/signup");
  }

  function handleMyUploads() {
    navigate("/my-uploads");
  }

  function handleHome() {
    navigate("/");
  }

  return (
    <AppBar position="static" sx={{ background: "#1e1e1e" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo / Brand */}
        <Typography
          variant="h6"
          sx={{
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "1.25rem",
            letterSpacing: "0.5px",
          }}
          onClick={handleHome}
        >
          Verus
        </Typography>

        {/* Right side buttons */}
        <Box>
          {token ? (
            <>
              <Button color="inherit" onClick={handleMyUploads}>
                My Uploads
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={handleLogin}>
                Login
              </Button>
              <Button color="inherit" onClick={handleSignup}>
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Topbar;
