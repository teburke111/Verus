import React, { useEffect, useState } from "react";
import Topbar from "../components/Topbar";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function MyUploads() {
  const [uploads, setUploads] = useState([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("Please log in to view your uploads.");
      return;
    }

    fetch(`${API_BASE}/media/my_uploads`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setUploads(data.uploads || []);
      })
      .catch(() => setError("Failed to load uploads."));
  }, [token]);

  async function handleClearUploads() {
    if (!window.confirm("Are you sure you want to delete all uploads?")) return;

    try {
      const response = await fetch(`${API_BASE}/media/clear_uploads`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to clear uploads");
      alert("✅ All uploads deleted!");
      setUploads([]);
    } catch (err) {
      alert("❌ " + err.message);
    }
  }

  return (
    <div>
      <Topbar />
      <div style={{ padding: "1rem" }}>
        <h2>My Uploads</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!error && uploads.length > 0 && (
          <>
            <button onClick={handleClearUploads} style={{ marginBottom: "1rem" }}>
              Clear All Uploads
            </button>
            <ul>
              {uploads.map((u) => (
                <li key={u.id}>
                  <strong>{u.filename}</strong> ({u.media_type}) —{" "}
                  {Math.round(u.size_bytes / 1024)} KB
                </li>
              ))}
            </ul>
          </>
        )}
        {!error && uploads.length === 0 && <p>No uploads yet.</p>}
      </div>
    </div>
  );
}

export default MyUploads;
