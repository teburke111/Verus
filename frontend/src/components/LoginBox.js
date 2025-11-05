import React from 'react'
import Box from '@mui/material/Box';
import { useState } from 'react';
import logo from '../assets/logo.png'
const API_BASE = process.env.REACT_APP_API_BASE_URL;




function LoginBox() {
    const [userName, setUserName] = useState("");
    const [passWord, setPassWord] = useState("");
    const [error, setError] = useState("");

    function handleSignupClick() {
    // e.g., navigate to signup page
    console.log("Sign Up clicked!");
    }
    async function handleLogin() {
  setError(""); // reset any previous error

  // Check if fields are filled
  if (!userName || !passWord) {
    setError("Username and password are required");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: userName,
        password: passWord,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    // ✅ Save the token locally
    localStorage.setItem("token", data.token);
    console.log("Logged in successfully:", data);

    // TODO: redirect to home or dashboard later
  } catch (err) {
    console.error(err);
    setError(err.message);
  }
}

  return (
    <div className='loginBox'>
        <Box className="Box">
            <img src={logo}/>
            <text className='loginTitle'>Welcome to Verus!</text>
            <input className= "LoginInput" type='text' placeholder='Username'/>
            <input className= "LoginInput" type='text' placeholder='Password'/>
            <text className='error'>{error}</text>
            <button className='submit'>
                Login
            </button>
            <div className="signup-text">
                Need to <span className="clickable" onClick={handleSignupClick}>Sign Up</span>?
            </div>
        </Box>
    </div>
  )
}

export default LoginBox
