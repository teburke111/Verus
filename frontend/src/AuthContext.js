import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('jwtToken'));
    

    const [pendingSaveData, setPendingSaveData] = useState(null); 
    
    const [user, setUser] = useState(null); 
    
    const isLoggedIn = !!token;

    const decodeTokenAndSetUser = useCallback((jwtToken) => {
        if (!jwtToken) {
            setUser(null);
            return;
        }
        try {
            const payloadBase64 = jwtToken.split('.')[1];
            const payload = JSON.parse(atob(payloadBase64));
            
            setUser({ 
                id: payload.sub, 
                username: payload.username || 'User' 
            });
        } catch (e) {
            console.error("Failed to decode token for UI:", e);
            setToken(null);
            localStorage.removeItem('jwtToken');
        }
    }, []);


    useEffect(() => {
        decodeTokenAndSetUser(token);
    }, [token, decodeTokenAndSetUser]);

    const handleLogin = (jwtToken) => {
        localStorage.setItem('jwtToken', jwtToken);
        setToken(jwtToken);
    };

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        setToken(null);
        setUser(null);
        setPendingSaveData(null); 
    };

    const value = {
        token,
        user,
        isLoggedIn,
        pendingSaveData, 
        setPendingSaveData, 
        handleLogin,
        handleLogout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
