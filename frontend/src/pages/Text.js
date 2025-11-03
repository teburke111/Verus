import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import Topbar from '../components/Topbar';
import { Button } from '@mui/material';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import SaveIcon from '@mui/icons-material/Save'; 
import { useAuth } from '../AuthContext'; 

const API_BASE_URL = "http://127.0.0.1:5000";

function Text() {
    const navigate = useNavigate();
    const { isLoggedIn, token, setPendingSaveData, pendingSaveData, setToken } = useAuth(); 
    
   
    const initialContent = pendingSaveData ? pendingSaveData.content : '';
    const initialScore = pendingSaveData ? pendingSaveData.score : null;

    const [content, setContent] = useState(initialContent);
    const [predictionScore, setPredictionScore] = useState(initialScore); 
    const [saveStatus, setSaveStatus] = useState(pendingSaveData ? 'saving' : 'idle'); 
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        if (pendingSaveData && isLoggedIn && saveStatus === 'saving') {
            
            handleSave(true); 
        }
    }, [isLoggedIn]); 

    const Return = () => {
        navigate("/");
    };

    const handlePredict = async () => {
        if (!content.trim()) return;

        setIsLoading(true);
        setPredictionScore(null);
        setSaveStatus('idle'); 
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockScore = parseFloat((Math.random() * 1).toFixed(2)); 
        
        setPredictionScore(mockScore);
        setIsLoading(false);
    };


    const handleSave = useCallback(async (isAuthenticated = false) => {
        if (predictionScore === null) return;

        if (!isLoggedIn && !isAuthenticated) {
            const dataToSave = { content, score: predictionScore };
            setPendingSaveData(dataToSave);
            navigate('/Login');
            return;
        }

        setSaveStatus('saving');
        setPendingSaveData(null); /

        try {
            const textBlob = new Blob([content], { type: 'text/plain' });
            const formData = new FormData();
            
            const filename = `prediction_${Date.now()}_score_${Math.round(predictionScore * 100)}.txt`;
            formData.append('file', textBlob, filename); 

            const response = await fetch(`${API_BASE_URL}/media/upload?save=true`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, 
                },
                body: formData,
            });

            if (response.ok) {
                setSaveStatus('success');
            } else {
                const errorData = await response.json();
                if (response.status === 401) {
                    setSaveStatus('error-auth');
                    setToken(null); 
                } else {
                    setSaveStatus('error');
                }
                console.error("Save API Error:", errorData);
            }

        } catch (error) {
            setSaveStatus('error');
            console.error("Network Error during save:", error);
        }
    }, [isLoggedIn, content, predictionScore, token, navigate, setPendingSaveData, setToken]);


    const scoreColor = useMemo(() => {
        if (predictionScore === null) return '#666';
        return predictionScore > 0.7 ? '#e53e3e' : '#38a169'; 
    }, [predictionScore]);

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <Topbar />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Text Analysis and Prediction</h1>
                <Button className='returnButton' onClick={Return} startIcon={<KeyboardReturnIcon className='returnIcon'/>}>
                    Return
                </Button>
            </div>

            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your text content here for AI likelihood prediction..."
                style={{ width: '100%', minHeight: '200px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px', fontSize: '16px' }}
                disabled={isLoading}
            />

            <Button
                onClick={handlePredict}
                disabled={isLoading || !content.trim()}
                variant="contained"
                style={{ marginTop: '15px', width: '100%', padding: '10px', backgroundColor: '#3f51b5', color: 'white' }}
            >
                {isLoading ? 'Predicting...' : 'Predict AI Likelihood'}
            </Button>

            {/* --- Prediction Results and SAVE Button --- */}
            {predictionScore !== null && (
                <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                    <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>
                        Prediction Score: 
                        <span style={{ marginLeft: '10px', fontWeight: 'bold', color: scoreColor }}>
                            {Math.round(predictionScore * 100)}%
                        </span>
                    </h3>
                    
                    <Button
                        onClick={() => handleSave(false)} 
                        disabled={saveStatus === 'saving' || saveStatus === 'success'}
                        variant="contained"
                        color={isLoggedIn ? (saveStatus === 'success' ? 'success' : 'primary') : 'secondary'}
                        startIcon={<SaveIcon />}
                        style={{ width: '100%', padding: '10px' }}
                    >
                        {saveStatus === 'saving' && 'Saving...'}
                        {saveStatus === 'success' && 'Saved Successfully!'}
                        {saveStatus === 'error' && 'Save Failed. Try again.'}
                        {saveStatus === 'error-auth' && 'Session Expired. Please Login.'}
                        {saveStatus === 'idle' && isLoggedIn && 'Save Result to History'}
                        {saveStatus === 'idle' && !isLoggedIn && 'Login to Save Result'}
                    </Button>

                    {!isLoggedIn && (
                        <p style={{ marginTop: '10px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
                            You must log in to finalize saving this prediction result.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default Text;
