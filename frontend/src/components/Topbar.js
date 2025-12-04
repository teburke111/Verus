import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from '../assets/logo.png'
import { AppBar, Toolbar, Button, Typography, Box } from "@mui/material";

function Topbar() {
  const navigate = useNavigate();
  // State to hold the token value from localStorage
  const [token, setToken] = useState(localStorage.getItem("jwtToken"));

  // This function is now responsible for handling the Save action.
  // It checks for authentication and redirects if the token is missing.
  function handleSave() {
    if (!token) {
      // User is NOT logged in. Redirect to the login page to authenticate.
      console.log("Save requested: User not authenticated, redirecting to login.");
      navigate("/login");
      return;
    }
    
    // User IS logged in. Proceed with the actual save logic.
    console.log("Save functionality triggered for authenticated user.");
    // NOTE: Add your actual save API call or state management here later.
  }

  // Reactively track login/logout across browser tabs (required for single sign-out)
  useEffect(() => {
    const handleStorageChange = () => setToken(localStorage.getItem("jwtToken"));
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  function handleLogout() {
    localStorage.removeItem("jwtToken");
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
    <AppBar position="static" sx={{ background: "#A8A8A8" }}>
      <Toolbar className="toolbar" sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo / Brand */}
        {/* <Typography
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
        </Typography> */}

        <img  className="logo" src={logo} style= {{height: "70px", cursor: "pointer"}} onClick={handleHome}/>

        {/* Right side buttons - Using flex and gap for clean spacing */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          
          {/* SAVE BUTTON: ALWAYS VISIBLE, placed first for prominence */}
          // <Button
          //   variant="contained"
          //   color="primary"
          //   onClick={handleSave}
          //   sx={{ fontWeight: 'bold' }}
          // >
          //   Save
          // </Button>

          {token ? (
            // Logged In View: My Uploads, Logout
            <>
              <Button color="inherit" onClick={handleMyUploads}>
                My Uploads
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            // Logged Out View: Login, Sign Up
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
