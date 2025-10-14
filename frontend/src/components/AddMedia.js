import { Box } from '@mui/material'
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import Images from '../pages/Images';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import ArticleIcon from '@mui/icons-material/Article';
import ImageIcon from '@mui/icons-material/Image';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

function AddMedia() {

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB in bytes


  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("")
  const navigate = useNavigate();

  const ImageClick = () => {
    navigate("/Images");
  };

  const TextClick = () => {
    navigate("/Text");
  };

  const AudioClick = () => {
    navigate("/Audio");
  };

  const VideoClick = () => {
    navigate("/Video");
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFileType("")

    if (selectedFile.size > MAX_FILE_SIZE) {
        alert("File is too large! Maximum allowed size is 10 MB.");
        return;
    }

    setFile(selectedFile);

    if (selectedFile) {
        setFileType(selectedFile.type)
        console.log("File name:", selectedFile.name);
        console.log("File type:", selectedFile.type); // <-- this is the MIME type
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    console.log("Uploading:", file);

    if (fileType.startsWith("image/")) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await fetch("/image-process", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to send image to backend");
        }

        const data = await response.json();
        setMessage(data.message);
      } catch (error) {
        console.error("Error:", error);
        setMessage("Error sending image to backend");
      }
    } else {
      setMessage("Only image uploads are supported for now.");
    }

    setFile(null);
    setFileType("");
  };

  return (
    <div className='AddMedia'>
        <div className='MediaBoxes'>
            <Box className='mediaBox' onClick={ImageClick} style={{borderColor: fileType.startsWith("image/") ? "white" : "black",}}>
                <h1 className='imageTitle'>Image</h1>
                <ImageIcon className='icon'/>
                <p className='allowedTypes'>.jpg</p>
            </Box>
            <Box className='mediaBox' onClick={TextClick} style={{borderColor: fileType.startsWith("text/") ? "white" : "black",}}>
                <h1 className='imageTitle'>Text</h1>
                <ArticleIcon className='icon'/>
                <p className='allowedTypes'>.txt</p>
            </Box>
            <Box className='mediaBox' onClick={AudioClick} style={{borderColor: fileType.startsWith("audio/") ? "white" : "black",}}>
                <h1 className='imageTitle'>Audio</h1>
                <AudioFileIcon className='icon'/>
                <p className='allowedTypes'>.mp3</p>
            </Box>
            <Box className='mediaBox' onClick={VideoClick} style={{borderColor: fileType.startsWith("video/") ? "white" : "black",}}>
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
            {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
        </div>
    </div>
  )
}

export default AddMedia
