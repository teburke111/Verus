import React from 'react';
import Box from '@mui/material/Box';
import logo from '../assets/logo.png';
import { useState } from 'react';
import { useAuth } from '../AuthContext'; 

const API_BASE_URL = "http://127.0.0.1:5000"; 
function SignupBox() {
    const { handleLogin } = useAuth();

    const [userName, setUserName] = useState("");
    const [passWord, setPassWord] = useState("");
    const [confirmPassword, setConfirmPassword] = useState(""); 
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setError("");

        if (!userName || !passWord || !firstName || !lastName || !confirmPassword) {
            setError("All fields are required.");
            return;
        }

        if (passWord !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: userName,
                    password: passWord,
                    first_name: firstName,
                    last_name: lastName,
                })
            });

            const data = await response.json();

            if (response.ok && data.access_token) {
                handleLogin(data.access_token);
            } else {
                setError(data.message || "Registration failed. Username may be taken.");
            }

        } catch (err) {
            setError("Network error. Could not reach the server.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className='signupBox' onSubmit={handleSubmit}>
            <Box className="Box2">
                <img src={logo} alt="Logo"/>
                <text className='signupTitle'>Create an Account</text>
                
                {/* 5. Bind input values to state */}
                <input 
                    className= "Input" 
                    type='text' 
                    placeholder='First Name' 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />
                <input 
                    className= "Input" 
                    type='text' 
                    placeholder='Last Name'
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
                <input 
                    className= "Input" 
                    type='text' 
                    placeholder='Username'
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                />
                <input 
                    className= "Input" 
                    type='password' // Use type='password'
                    placeholder='Password'
                    value={passWord}
                    onChange={(e) => setPassWord(e.target.value)}
                />
                <input 
                    className= "Input" 
                    type='password' 
                    placeholder='Confirm Password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <text className='error'>{error}</text>
                
                <button className='submit' type='submit' disabled={loading}>
                    {loading ? 'Signing Up...' : 'Sign Up'}
                </button>
                
                <div className="signup-text">
                    Already have an account?<span className="clickable" > Sign in</span>
                </div>
            </Box>
        </form>
    );
}

export default SignupBox;
