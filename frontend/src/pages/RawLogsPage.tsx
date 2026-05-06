import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Stack,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import { LogsTable } from "../components/LogsTable";
import apiClient from "../services/api";
import type { SSHLog, EventType } from "../types/logs";

const EVENT_TYPES: EventType[] = [
  "NEW_CONNECTION",
  "RAW_IN",
  "VERSION_EXCHANGE",
  "KEXINIT",
  "USERAUTH_REQUEST",
];

export function RawLogsPage() {
  const [logs, setLogs] = useState<SSHLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SSHLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [eventFilter, setEventFilter] = useState<string>("");
  const [ipFilter, setIpFilter] = useState<string>("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getLogs();
        setLogs(data);
        setFilteredLogs(data);
      } catch (err) {
        console.error("Error fetching logs:", err);
        setError(
          "Failed to load logs. Make sure the backend API is running on http://localhost:8000",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = logs;

    if (eventFilter) {
      filtered = filtered.filter((log) => log.EVENT === eventFilter);
    }

    if (ipFilter) {
      filtered = filtered.filter(
        (log) =>
          log.SRC_HOST.includes(ipFilter) || log.DST_HOST.includes(ipFilter),
      );
    }

    setFilteredLogs(filtered);
  }, [logs, eventFilter, ipFilter]);

  const handleClearFilters = () => {
    setEventFilter("");
    setIpFilter("");
  };

  if (error) {
    return (
      <Box>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "#00d4ff", mb: 3 }}
        >
          Raw Logs
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, color: "#00d4ff", mb: 3 }}
      >
        Raw Logs
      </Typography>

      {/* Filters */}
      <Box
        sx={{
          backgroundColor: "#16213e",
          p: 2,
          borderRadius: 1,
          mb: 3,
          borderLeft: "3px solid #00d4ff",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Event Type</InputLabel>
              <Select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                label="Event Type"
              >
                <MenuItem value="">All</MenuItem>
                {EVENT_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="IP Address"
              variant="outlined"
              value={ipFilter}
              onChange={(e) => setIpFilter(e.target.value)}
              placeholder="Filter by IP..."
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} sx={{ height: "100%" }}>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ display: "flex", alignItems: "center" }}
              >
                {filteredLogs.length} logs
              </Typography>
              <Box sx={{ flex: 1 }} />
              <Button
                variant="outlined"
                size="small"
                onClick={handleClearFilters}
                disabled={!eventFilter && !ipFilter}
              >
                Clear Filters
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress sx={{ color: "#00d4ff" }} />
        </Box>
      ) : (
        <LogsTable logs={filteredLogs} loading={loading} />
      )}
    </Box>
  );
}
