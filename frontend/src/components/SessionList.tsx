import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Avatar,
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Grid,
  CircularProgress,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  NetworkCheck as NetworkIcon,
} from "@mui/icons-material";
import type { Session, EventType } from "../types/logs";

interface SessionListProps {
  sessions: Session[];
  loading: boolean;
}

const eventTypeColors: Record<EventType, string> = {
  NEW_CONNECTION: "#00d4ff",
  RAW_IN: "#00ff88",
  VERSION_EXCHANGE: "#ffaa00",
  KEXINIT: "#ff006e",
  USERAUTH_REQUEST: "#ff4444",
};

export function SessionList({ sessions, loading }: SessionListProps) {
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const toggleExpand = (connId: string) => {
    setExpandedSession(expandedSession === connId ? null : connId);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress sx={{ color: "#00d4ff" }} />
      </Box>
    );
  }

  if (sessions.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <Typography color="textSecondary">No sessions available</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {sessions.map((session) => (
        <Grid item xs={12} key={session.CONN_ID}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #16213e 0%, #0f3460 100%)",
              borderLeft: "3px solid #00d4ff",
              cursor: "pointer",
            }}
          >
            <CardHeader
              avatar={
                <Avatar sx={{ backgroundColor: "#00d4ff", color: "#0a0e27" }}>
                  <NetworkIcon />
                </Avatar>
              }
              action={
                <IconButton onClick={() => toggleExpand(session.CONN_ID)}>
                  {expandedSession === session.CONN_ID ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </IconButton>
              }
              title={
                <Typography sx={{ fontWeight: 700, color: "#00d4ff" }}>
                  {session.SRC_HOST}:{session.SRC_PORT}
                </Typography>
              }
              subheader={
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    mt: 1,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Typography variant="caption" sx={{ color: "#adb5bd" }}>
                    {new Date(session.first_seen).toLocaleString()}
                  </Typography>
                  <Chip
                    label={`${session.event_count} events`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={session.last_event_type}
                    size="small"
                    sx={{
                      backgroundColor: `${eventTypeColors[session.last_event_type]}20`,
                      color: eventTypeColors[session.last_event_type],
                      fontWeight: 600,
                      border: `1px solid ${eventTypeColors[session.last_event_type]}`,
                    }}
                  />
                </Box>
              }
            />

            <Collapse
              in={expandedSession === session.CONN_ID}
              timeout="auto"
              unmountOnExit
            >
              <CardContent sx={{ borderTop: "1px solid #2c3e50" }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, mb: 2, color: "#00d4ff" }}
                >
                  Session Timeline
                </Typography>

                <Box
                  sx={{
                    backgroundColor: "#0f3460",
                    p: 2,
                    borderRadius: 1,
                    mb: 2,
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        display="block"
                      >
                        Connection ID
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                          wordBreak: "break-all",
                        }}
                      >
                        {session.CONN_ID}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        display="block"
                      >
                        Destination
                      </Typography>
                      <Typography
                        sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}
                      >
                        {session.DST_HOST}:{session.DST_PORT}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        display="block"
                      >
                        First Seen
                      </Typography>
                      <Typography sx={{ fontSize: "0.85rem" }}>
                        {new Date(session.first_seen).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        display="block"
                      >
                        Last Seen
                      </Typography>
                      <Typography sx={{ fontSize: "0.85rem" }}>
                        {new Date(session.last_seen).toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, mb: 1.5, color: "#00d4ff" }}
                >
                  Events ({session.events.length})
                </Typography>

                <List
                  sx={{ backgroundColor: "#0f3460", borderRadius: 1, p: 0 }}
                >
                  {session.events.map((event, idx) => (
                    <ListItem
                      key={idx}
                      divider={idx < session.events.length - 1}
                      sx={{
                        backgroundColor:
                          idx % 2 === 0
                            ? "transparent"
                            : "rgba(0, 212, 255, 0.03)",
                        py: 1,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              alignItems: "center",
                            }}
                          >
                            <Chip
                              label={event.EVENT}
                              size="small"
                              sx={{
                                backgroundColor: `${eventTypeColors[event.EVENT]}20`,
                                color: eventTypeColors[event.EVENT],
                                fontWeight: 600,
                                border: `1px solid ${eventTypeColors[event.EVENT]}`,
                              }}
                            />
                            {event.timestamp && (
                              <Typography
                                variant="caption"
                                sx={{ color: "#adb5bd" }}
                              >
                                {new Date(event.timestamp).toLocaleTimeString()}
                              </Typography>
                            )}
                          </Box>
                        }
                        secondary={Object.entries(event)
                          .filter(
                            ([key]) =>
                              ![
                                "EVENT",
                                "SRC_HOST",
                                "SRC_PORT",
                                "DST_HOST",
                                "DST_PORT",
                                "CONN_ID",
                                "timestamp",
                                "_id",
                              ].includes(key),
                          )
                          .map(([key, value]) => (
                            <Typography
                              key={key}
                              variant="caption"
                              sx={{
                                display: "block",
                                color: "#adb5bd",
                                fontFamily:
                                  value && typeof value === "string"
                                    ? "monospace"
                                    : "default",
                              }}
                            >
                              {key}: {String(value)}
                            </Typography>
                          ))}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Collapse>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
