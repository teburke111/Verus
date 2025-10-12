import React from 'react'
import Box from '@mui/material/Box';
import logo from '../assets/logo.png'
import { useState } from 'react';


function SignupBox() {

    const [userName, setUserName] = useState("");
    const [passWord, setPassWord] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [error, setError] = useState("");



  return (
    <div className='signupBox'>
        <Box className="Box2">
            <img src={logo}/>
            <text className='signupTitle'>Create an Account</text>
            <input className= "Input" type='text' placeholder='First Name' />
            <input className= "Input" type='text' placeholder='Last Name'/>
            <input className= "Input" type='text' placeholder='Username'/>
            <input className= "Input" type='text' placeholder='Password'/>
            <input className= "Input" type='text' placeholder='Confirm Password'/>
            <text className='error'>{error}</text>
            <button className='submit'>
                Sign Up
            </button>
            <div className="signup-text">
                Already have an account?<span className="clickable" > Sign in</span>
            </div>
        </Box>
    </div>
  )
}

export default SignupBox