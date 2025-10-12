import React from 'react'
import Box from '@mui/material/Box';
import { useState } from 'react';
import logo from '../assets/logo.png'



function LoginBox() {
    const [userName, setUserName] = useState("");
    const [passWord, setPassWord] = useState("");
    const [error, setError] = useState("");

    function handleSignupClick() {
    // e.g., navigate to signup page
    console.log("Sign Up clicked!");
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