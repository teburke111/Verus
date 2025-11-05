import React, { useState } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import VideoFileIcon from "@mui/icons-material/VideoFile";
import AudioFileIcon from "@mui/icons-material/AudioFile";
import ArticleIcon from "@mui/icons-material/Article";
import ImageIcon from "@mui/icons-material/Image";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function AddMedia() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
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
      alert("File is too large! Max allowed size is 50 MB.");
      return;
    }

    setFile(selectedFile);
    setFileType(selectedFile.type);
    console.log("Selected:", selectedFile.name, selectedFile.type);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    setMessage("Uploading...");
    const token = localStorage.getItem("token");
    const saveRequested = !!token; // only save if user logged in

    const formData = new FormData();
    formData.append("file", file);
    formData.append("save", saveRequested ? "true" : "false");

    try {
      const response = await fetch(`${API_BASE}/media/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Upload failed");

      setMessage(
        data.saved
          ? `✅ Saved successfully! Media ID: ${data.media_id}`
          : `Prediction complete: ${data.message}`
      );
    } catch (error) {
      console.error("Error:", error);
      setMessage("❌ " + error.message);
    }

    setFile(null);
    setFileType("");
  };

  return (
    <div className="AddMedia">
      <div className="MediaBoxes">
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
          {file && <p>Selected file: {file.name}</p>}
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

        <button className="submitButton" onClick={handleUpload}>
          {localStorage.getItem("token") ? "Save Upload" : "Predict"}
        </button>

        {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
      </div>
    </div>
  );
}

export default AddMedia;
