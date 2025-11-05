import React, { useState } from "react";
import Box from "@mui/material/Box";
import logo from "../assets/logo.png";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function SignupBox() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [passWord, setPassWord] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSignup() {
    setError("");
    setMessage("");

    if (!userName || !passWord || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (passWord !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userName,
          password: passWord,
          role: "user", // default role
          first_name: firstName,
          last_name: lastName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      setMessage("Account created successfully! Redirecting...");
      console.log("✅ Registered successfully:", data);

      // Redirect to login after short delay
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  function handleLoginClick() {
    window.location.href = "/login";
  }

  return (
    <div className="signupBox">
      <Box className="Box2">
        <img src={logo} alt="Verus Logo" />
        <div className="signupTitle">Create an Account</div>

        <input
          className="Input"
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          className="Input"
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          className="Input"
          type="text"
          placeholder="Username"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <input
          className="Input"
          type="password"
          placeholder="Password"
          value={passWord}
          onChange={(e) => setPassWord(e.target.value)}
        />
        <input
          className="Input"
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}

        <button className="submit" onClick={handleSignup}>
          Sign Up
        </button>

        <div className="signup-text">
          Already have an account?
          <span className="clickable" onClick={handleLoginClick}>
            {" "}
            Sign In
          </span>
        </div>
      </Box>
    </div>
  );
}

export default SignupBox;
