import { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { StatsCards } from "../components/StatsCards";
import { LogsTable } from "../components/LogsTable";
import apiClient from "../services/api";
import type { Stats, SSHLog } from "../types/logs";

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<SSHLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsData, logsData] = await Promise.all([
          apiClient.getStats(),
          apiClient.getLogs(),
        ]);

        setStats(statsData);
        setLogs(logsData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          "Failed to load dashboard data. Make sure the backend API is running on http://localhost:8000",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <Box>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "#00d4ff", mb: 3 }}
        >
          Dashboard
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, color: "#00d4ff", mb: 3 }}
      >
        Dashboard
      </Typography>

      <StatsCards stats={stats} loading={loading} />

      <Typography
        variant="h6"
        sx={{ fontWeight: 700, color: "#00d4ff", mb: 2 }}
      >
        Recent Logs
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress sx={{ color: "#00d4ff" }} />
        </Box>
      ) : (
        <LogsTable logs={logs} loading={loading} maxRows={20} />
      )}
    </Box>
  );
}
