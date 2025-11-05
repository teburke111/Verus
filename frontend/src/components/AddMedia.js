import { Box } from '@mui/material'
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import Images from '../pages/Images';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import ArticleIcon from '@mui/icons-material/Article';
import ImageIcon from '@mui/icons-material/Image';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function AddMedia() {

  function getBaseUrl() {
    const { protocol, hostname, port } = window.location;
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  }

  const baseUrl = getBaseUrl();
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB limit

  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [predictionResult, setPredictionResult] = useState(null);
  const navigate = useNavigate();

  const ImageClick = () => navigate("/Images");
  const TextClick = () => navigate("/Text");
  const AudioClick = () => navigate("/Audio");
  const VideoClick = () => navigate("/Video");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFileType("");

    if (!selectedFile) return;
    if (selectedFile.size > MAX_FILE_SIZE) {
      alert("File is too large! Maximum allowed size is 50 MB.");
      return;
    }

    setFile(selectedFile);
    setFileType(selectedFile.type);
    console.log("File selected:", selectedFile.name, selectedFile.type);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("Url", baseUrl);

    if (fileType.startsWith("image/")) formData.append("image", file);
    else if (fileType.startsWith("text/")) formData.append("text", file);
    else if (fileType.startsWith("audio/")) formData.append("audio", file);
    else if (fileType.startsWith("video/")) formData.append("video", file);
    else {
      alert("Unsupported file type");
      return;
    }

    let endpoint = "";
    if (fileType.startsWith("image/")) endpoint = "/image-process";
    if (fileType.startsWith("text/")) endpoint = "/text-process";
    if (fileType.startsWith("audio/")) endpoint = "/audio-process";
    if (fileType.startsWith("video/")) endpoint = "/video-process";

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Prediction failed");

      setPredictionResult(data);
      setMessage("Prediction complete!");
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error sending file to backend");
    }
  };

  // Save prediction result (only if logged in)
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You need to log in to save results.");
      navigate("/login");
      return;
    }

    if (!predictionResult) {
      alert("No prediction result to save yet.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/media/save`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: file.name,
          fileType: fileType,
          prediction: predictionResult,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save result");

      alert("Prediction saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving prediction.");
    }
  };

  return (
    <div className='AddMedia'>
      <div className='MediaBoxes'>
        <Box className='mediaBox' onClick={ImageClick} style={{borderColor: fileType.startsWith("image/") ? "white" : "black"}}>
          <h1 className='imageTitle'>Image</h1>
          <ImageIcon className='icon'/>
          <p className='allowedTypes'>.jpg</p>
        </Box>
        <Box className='mediaBox' onClick={TextClick} style={{borderColor: fileType.startsWith("text/") ? "white" : "black"}}>
          <h1 className='imageTitle'>Text</h1>
          <ArticleIcon className='icon'/>
          <p className='allowedTypes'>.txt</p>
        </Box>
        <Box className='mediaBox' onClick={AudioClick} style={{borderColor: fileType.startsWith("audio/") ? "white" : "black"}}>
          <h1 className='imageTitle'>Audio</h1>
          <AudioFileIcon className='icon'/>
          <p className='allowedTypes'>.mp3</p>
        </Box>
        <Box className='mediaBox' onClick={VideoClick} style={{borderColor: fileType.startsWith("video/") ? "white" : "black"}}>
          <h1 className='imageTitle'>Video</h1>
          <VideoFileIcon className='icon'/>
          <p className='allowedTypes'>.mp4</p>
        </Box>
      </div>

      <div className="uploadContainer">
        <Box className="uploadBox">
          {file && <p>Selected file: {file.name}</p>}
          <input
            id="fileInput"
            className="uploadButton"
            type="file"
            onChange={handleFileChange}
            style={{ display: "none" }}
            accept='.jpg,.mp3,.mp4,.txt'
          />
          <label htmlFor="fileInput" className="customFileButton">
            <AddCircleOutlineIcon className='addIcon' />
          </label>
        </Box>

        <button className="submitButton" onClick={handleUpload}>Predict</button>

        {predictionResult && (
          <button className="saveButton" onClick={handleSave}>Save Result</button>
        )}

        {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
      </div>
    </div>
  );
}

export default AddMedia;
