import React, { useState } from "react";
import Box from "@mui/material/Box";
import logo from "../assets/logo.png";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function LoginBox() {
  const [userName, setUserName] = useState("");
  const [passWord, setPassWord] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function handleSignupClick() {
    window.location.href = "/signup"; // Redirect to signup page
  }

  async function handleLogin() {
    setError("");
    setMessage("");

    if (!userName || !passWord) {
      setError("Username and password are required");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userName, password: passWord }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // ✅ Save JWT
      localStorage.setItem("token", data.token);
      setMessage("Login successful!");
      console.log("✅ Logged in successfully:", data);

      // Redirect to home (or dashboard)
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(err.message);
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
