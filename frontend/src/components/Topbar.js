import React from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Button, Typography } from "@mui/material";

function Topbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  function handleLogin() {
    navigate("/login");
  }

  function handleMyUploads() {
    navigate("/my-uploads");
  }

  return (
    <AppBar position="static" style={{ background: "#222" }}>
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, cursor: "pointer" }}
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
