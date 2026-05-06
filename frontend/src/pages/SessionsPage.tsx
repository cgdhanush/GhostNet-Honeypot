import { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { SessionList } from "../components/SessionList";
import apiClient from "../services/api";
import type { Session } from "../types/logs";

export function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getSessions();
        setSessions(data);
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setError(
          "Failed to load sessions. Make sure the backend API is running on http://localhost:8000",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (error) {
    return (
      <Box>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "#00d4ff", mb: 3 }}
        >
          Sessions
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, color: "#00d4ff", mb: 1 }}
      >
        Sessions
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Click on a session to view its event timeline
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress sx={{ color: "#00d4ff" }} />
        </Box>
      ) : (
        <SessionList sessions={sessions} loading={loading} />
      )}
    </Box>
  );
}
