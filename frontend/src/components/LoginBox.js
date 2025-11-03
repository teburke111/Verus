import React from 'react';
import Box from '@mui/material/Box';
import { useState } from 'react';
import logo from '../assets/logo.png';
import { useAuth } from '../AuthContext'; 

const API_BASE_URL = "http://127.0.0.1:5000";

function LoginBox() {
    const { handleLogin } = useAuth();

    const [userName, setUserName] = useState("");
    const [passWord, setPassWord] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function handleSignupClick() {
        console.log("Sign Up clicked!");
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!userName || !passWord) {
            setError("Please enter both username and password.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: userName,
                    password: passWord
                })
            });

            const data = await response.json();

            if (response.ok && data.access_token) {
                handleLogin(data.access_token);
            } else {
                setError(data.message || "Login failed. Check your credentials.");
            }

        } catch (err) {
            setError("Network error. Could not reach the server.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className='loginBox' onSubmit={handleSubmit}> 
            <Box className="Box">
                <img src={logo} alt="Logo"/>
                <text className='loginTitle'>Welcome to Verus!</text>
                
                {/* 4. Bind input values to state */}
                <input 
                    className= "LoginInput" 
                    type='text' 
                    placeholder='Username'
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                />
                <input 
                    className= "LoginInput" 
                    type='password' 
                    placeholder='Password'
                    value={passWord}
                    onChange={(e) => setPassWord(e.target.value)}
                />
                
                <text className='error'>{error}</text>
                
                <button 
                    className='submit' 
                    type='submit' 
                    disabled={loading}
                >
                    {loading ? 'Logging In...' : 'Login'}
                </button>
                
                <div className="signup-text">
                    Need to <span className="clickable" onClick={handleSignupClick}>Sign Up</span>?
                </div>
            </Box>
        </form>
    );
}

export default LoginBox;
