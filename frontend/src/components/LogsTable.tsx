import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import type { SSHLog, EventType } from "../types/logs";

interface LogsTableProps {
  logs: SSHLog[];
  loading: boolean;
  maxRows?: number;
}

const eventTypeColors: Record<EventType, string> = {
  NEW_CONNECTION: "#00d4ff",
  RAW_IN: "#00ff88",
  VERSION_EXCHANGE: "#ffaa00",
  KEXINIT: "#ff006e",
  USERAUTH_REQUEST: "#ff4444",
};

export function LogsTable({ logs, loading, maxRows = 50 }: LogsTableProps) {
  const displayLogs = logs.slice(0, maxRows);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <Typography color="textSecondary">Loading logs...</Typography>
      </Box>
    );
  }

  if (logs.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <Typography color="textSecondary">No logs available</Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        backgroundColor: "#16213e",
        "& .MuiTable-root": {
          borderCollapse: "collapse",
        },
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: "#1a2845" }}>
            <TableCell sx={{ fontWeight: 700, color: "#00d4ff" }}>
              EVENT
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: "#00d4ff" }}>
              SRC_HOST
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, color: "#00d4ff" }}>
              SRC_PORT
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, color: "#00d4ff" }}>
              DST_PORT
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: "#00d4ff" }}>
              CONN_ID
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: "#00d4ff" }}>
              Timestamp
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayLogs.map((log, index) => (
            <TableRow
              key={index}
              sx={{
                "&:hover": {
                  backgroundColor: "rgba(0, 212, 255, 0.05)",
                },
                "&:last-child td, &:last-child th": {
                  border: 0,
                },
              }}
            >
              <TableCell>
                <Chip
                  label={log.EVENT}
                  size="small"
                  sx={{
                    backgroundColor: `${eventTypeColors[log.EVENT]}20`,
                    color: eventTypeColors[log.EVENT],
                    fontWeight: 600,
                    border: `1px solid ${eventTypeColors[log.EVENT]}`,
                  }}
                />
              </TableCell>
              <TableCell sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                {log.SRC_HOST}
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}
              >
                {log.SRC_PORT}
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}
              >
                {log.DST_PORT}
              </TableCell>
              <TableCell
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  maxWidth: "150px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {log.CONN_ID}
              </TableCell>
              <TableCell sx={{ fontSize: "0.75rem", color: "#adb5bd" }}>
                {log.timestamp
                  ? new Date(log.timestamp).toLocaleString()
                  : "N/A"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {logs.length > maxRows && (
        <Box sx={{ p: 2, textAlign: "center", borderTop: "1px solid #2c3e50" }}>
          <Typography variant="caption" color="textSecondary">
            Showing {displayLogs.length} of {logs.length} logs
          </Typography>
        </Box>
      )}
    </TableContainer>
  );
}
