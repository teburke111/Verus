import React, { useState } from "react";
import Box from "@mui/material/Box";
import logo from "../assets/logo.png";

// FINAL FIX: Using the public Head Node IP and the assigned NodePort (30246)
// This is the only URL the external browser can resolve.
const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://130.127.133.148:30246";

function LoginBox() {
  const [userName, setUserName] = useState("");
  const [passWord, setPassWord] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const displayError = (msg) => {
    setError(msg);
  };

  function handleSignupClick() {
    window.location.href = "/signup"; // Redirect to signup page
  }

  async function handleLogin() {
    setError("");
    setMessage("");

    if (!userName || !passWord) {
      displayError("Username and password are required");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userName, password: passWord }),
      });

      if (!response.ok) {
        // Attempt to read JSON error response even if status is non-200
        const data = await response.json();
        throw new Error(data.error || `Login failed with status ${response.status}`);
      }
      
      const data = await response.json();

      // Ensure token key is 'jwtToken' for consistency with Topbar.js
      localStorage.setItem("jwtToken", data.token); 
      
      setMessage("Login successful!");
      console.log("✅ Logged in successfully. Token key: jwtToken");

      // Redirect to home (or dashboard)
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (err) {
      console.error(err);
      displayError("❌ " + err.message);
    }
  }

  return (
    <div className="loginBox">
      <Box className="Box">
        <img src={logo} alt="Verus Logo" />
        <div className="loginTitle">Welcome to Verus!</div>

        <input
          className="LoginInput"
          type="text"
          placeholder="Username"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <input
          className="LoginInput"
          type="password"
          placeholder="Password"
          value={passWord}
          onChange={(e) => setPassWord(e.target.value)}
        />

        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}

        <button className="submit" onClick={handleLogin}>
          Login
        </button>

        <div className="signup-text">
          Need to{" "}
          <span className="clickable" onClick={handleSignupClick}>
            Sign Up
          </span>
          ?
        </div>
      </Box>
    </div>
  );
}

export default LoginBox;
