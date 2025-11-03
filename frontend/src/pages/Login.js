import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginBox from '../components/LoginBox';
import SignupBox from '../components/SignupBox';
import { useAuth } from '../AuthContext'; 

function Login() {
    const { isLoggedIn, pendingSaveData } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn) {
           
            if (pendingSaveData) {
                navigate('/Text', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        }
    }, [isLoggedIn, pendingSaveData, navigate]);

    return (
        <div className='loginPage' style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '50px' }}>
            {/* Show a message if there is pending data */}
            {pendingSaveData && (
                <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeeba', color: '#856404', padding: '15px', borderRadius: '5px', marginBottom: '20px', position: 'absolute', top: '20px' }}>
                    Please log in to finalize saving your prediction result.
                </div>
            )}
            
            {/* Note: I'm assuming you pass the handleLogin function down to LoginBox/SignupBox */}
            <LoginBox /> 
            <SignupBox />
        </div>
    );
}

export default Login;
