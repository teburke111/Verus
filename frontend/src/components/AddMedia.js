import React, { useState } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import VideoFileIcon from "@mui/icons-material/VideoFile";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import ArticleIcon from "@mui/icons-material/Article";
import ImageIcon from "@mui/icons-material/Image";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://130.127.133.148:30246";

function AddMedia() {
  const navigate = useNavigate();

  const displayMessage = (msg) => {
    setMessage(msg);
  };

  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [fileToSave, setFileToSave] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [fileType, setFileType] = useState("");
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

  const ImageClick = () => navigate("/Images");
  const TextClick = () => navigate("/Text");
  const AudioClick = () => navigate("/Audio");
  const VideoClick = () => navigate("/Video");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      displayMessage("File is too large! Max allowed size is 50 MB.");
      return;
    }

    setFile(selectedFile);
    setFileToSave(selectedFile);
    setPredictionData(null);
    setMessage("");
    setFileType(selectedFile.type);
    console.log("Selected:", selectedFile.name, selectedFile.type);
  };

  // --- 1. PREDICT FUNCTION (Sends token if available) ---
  const handleUpload = async () => {
    if (!file) {
      displayMessage("Please select a file first!");
      return;
    }

    setMessage("Uploading and Predicting...");
    
    const formData = new FormData();
    formData.append("file", file);
    
    const token = localStorage.getItem("jwtToken"); 
    
    const headers = {};
    // Include Authorization header if logged in, ensuring prediction is tied to the user
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const uploadUrl = `${API_BASE}/media/upload`; 

    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: headers, 
        body: formData,
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }
      
      const data = await response.json();

      setPredictionData(data);
      
      // FIX: Restoring the score display as requested: "Prediction complete: (Score: 0.95)"
      setMessage(`Prediction complete: (Score: ${data.confidence || 'N/A'})`);

    } catch (error) {
      console.error("Error:", error);
      setMessage("❌ " + error.message);
    }
  };

  // --- 2. SAVE FUNCTION (Auth Gated) ---
  const handleSave = async () => {
    // 1. Check for Authentication
    const token = localStorage.getItem("jwtToken");

    if (!token) {
      displayMessage("Please log in or sign up to save your media.");
      navigate("/Login"); 
      return;
    }
    
    // 2. User is Logged In, perform the actual save upload
    if (!fileToSave) {
      setMessage("Error: No file data to save.");
      return;
    }
    
    setMessage("Saving to your profile...");
    
    const formData = new FormData();
    formData.append("file", fileToSave);
    
    const saveUrl = `${API_BASE}/media/upload?save=true`; 

    try {
      const response = await fetch(saveUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, 
        body: formData,
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();

      setMessage(`✅ Saved successfully! Media ID: ${data.media_id}`);
      
      setPredictionData(null); 
      setFileToSave(null); 
      setFile(null);
      
    } catch (error) {
      console.error("Error saving:", error);
      setMessage("❌ Save failed: " + error.message);
    }
  };


  return (
    <div className="AddMedia">
      <div className="MediaBoxes">
        {/* ... existing MediaBoxes code remains the same ... */}
        <Box
          className="mediaBox"
          onClick={ImageClick}
          style={{
            borderColor: fileType.startsWith("image/") ? "white" : "black",
          }}
        >
          <h1 className="imageTitle">Image</h1>
          <ImageIcon className="icon" />
          <p className="allowedTypes">.jpg</p>
        </Box>

        <Box
          className="mediaBox"
          onClick={TextClick}
          style={{
            borderColor: fileType.startsWith("text/") ? "white" : "black",
          }}
        >
          <h1 className="imageTitle">Text</h1>
          <ArticleIcon className="icon" />
          <p className="allowedTypes">.txt</p>
        </Box>

        <Box
          className="mediaBox"
          onClick={AudioClick}
          style={{
            borderColor: fileType.startsWith("audio/") ? "white" : "black",
          }}
        >
          <h1 className="imageTitle">Audio</h1>
          <AudioFileIcon className="icon" />
          <p className="allowedTypes">.mp3</p>
        </Box>

        <Box
          className="mediaBox"
          onClick={VideoClick}
          style={{
            borderColor: fileType.startsWith("video/") ? "white" : "black",
          }}
        >
          <h1 className="imageTitle">Video</h1>
          <VideoFileIcon className="icon" />
          <p className="allowedTypes">.mp4</p>
        </Box>
      </div>

      <div className="uploadContainer">
        <Box className="uploadBox">
          {fileToSave && <p>Selected file: {fileToSave.name}</p>}
          <input
            id="fileInput"
            className="uploadButton"
            type="file"
            onChange={handleFileChange}
            style={{ display: "none" }}
            accept=".jpg,.jpeg,.txt,.mp3,.mp4"
          />
          <label htmlFor="fileInput" className="customFileButton">
            <AddCircleOutlineIcon className="addIcon" />
          </label>
        </Box>

        {/* Show Predict button if no prediction has been made */}
        {!predictionData && (
            <button 
                className="submitButton" 
                onClick={handleUpload}
                disabled={!fileToSave}
            >
                Predict
            </button>
        )}

        {/* Show Save button if prediction is complete */}
        {predictionData && (
            <button 
                className="submitButton" 
                onClick={handleSave}
                style={{ marginLeft: '10px' }}
            >
                Save Media
            </button>
        )}

        {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
      </div>
    </div>
  );
}

export default AddMedia;
