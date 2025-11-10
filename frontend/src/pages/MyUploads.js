import React, { useEffect, useState } from "react";
// Topbar is imported and rendered only in App.js now.
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://130.127.133.148:30246";

function MyUploads() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("jwtToken"); 

  useEffect(() => {
    if (!token) {
      setError("Please log in to view your uploads.");
      setLoading(false);
      return;
    }

    async function fetchUploads() {
      try {
        const response = await fetch(`${API_BASE}/media/my_uploads`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) {
          if (response.status === 401) {
             localStorage.removeItem("jwtToken");
             setError("Session expired. Please log in again.");
          } else {
             throw new Error(data.error || "Failed to load uploads");
          }
        } else {
          setUploads(data.uploads || []);
        }
      } catch (err) {
        console.error("Fetch uploads error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUploads();
  }, [token]);

  async function handleClearUploads() {
    if (!window.confirm("Are you sure you want to delete all your uploads?")) return; 

    try {
      const response = await fetch(`${API_BASE}/media/clear_uploads`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to clear uploads");
      
      console.log("✅ All uploads deleted successfully!");
      setError("All uploads deleted successfully!"); 
      setUploads([]);
    } catch (err) {
      console.error("❌ Clear uploads failed: ", err.message);
      setError("❌ Clear uploads failed: " + err.message);
    }
  }

  if (!token) {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Typography variant="h6" color="error">
          Please log in to view your uploads.
        </Typography>
        <Button variant="contained" onClick={() => (window.location.href = "/login")} sx={{ mt: 2 }}>
          Go to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        My Uploads
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : uploads.length === 0 ? (
        <Typography>No uploads yet.</Typography>
      ) : (
        <>
          <Button
            variant="contained"
            color="error"
            onClick={handleClearUploads}
            sx={{ mb: 2 }}
          >
            Clear All Uploads
          </Button>

          <List>
            {uploads.map((u) => (
              <ListItem key={u.id} divider>
                <ListItemText
                  primary={u.filename}
                  secondary={`Type: ${u.media_type} • ${Math.round(
                    u.size_bytes / 1024
                  )} KB • Uploaded: ${new Date(
                    u.created_at
                  ).toLocaleString()}`}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );
}

export default MyUploads;
