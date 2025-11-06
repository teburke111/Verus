import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Button, Typography } from "@mui/material";

function Topbar() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    // Watch for token changes (login/logout)
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

  function handleMyUploads() {
    navigate("/my-uploads");
  }

  return (
    <AppBar position="static" sx={{ background: "#1e1e1e" }}>
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, cursor: "pointer", fontWeight: 600 }}
          onClick={() => navigate("/")}
        >
          Verus
        </Typography>

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
          <Button color="inherit" onClick={handleLogin}>
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Topbar;
