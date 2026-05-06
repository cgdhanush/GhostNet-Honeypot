import { Card, CardContent, Grid, Typography, Box } from "@mui/material";
import {
  StorageSharp as StorageIcon,
  NetworkCheckSharp as NetworkIcon,
  VpnKeySharp as AuthIcon,
  EventSharp as EventIcon,
} from "@mui/icons-material";
import type { Stats } from "../types/logs";

interface StatsCardsProps {
  stats: Stats | null;
  loading: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  const cardData = [
    {
      title: "Total Connections",
      value: stats?.total_connections || 0,
      icon: StorageIcon,
      color: "#00d4ff",
    },
    {
      title: "Unique Source IPs",
      value: stats?.unique_ips || 0,
      icon: NetworkIcon,
      color: "#00ff88",
    },
    {
      title: "Auth Attempts",
      value: stats?.total_auth_attempts || 0,
      icon: AuthIcon,
      color: "#ff006e",
    },
    {
      title: "Top Event Type",
      value:
        stats && Object.keys(stats.event_type_counts).length > 0
          ? Object.entries(stats.event_type_counts).sort(
              ([, a], [, b]) => b - a,
            )[0][0]
          : "N/A",
      icon: EventIcon,
      color: "#ffaa00",
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {cardData.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #16213e 0%, #0f3460 100%)",
                borderLeft: `4px solid ${card.color}`,
                cursor: loading ? "not-allowed" : "default",
                opacity: loading ? 0.6 : 1,
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box>
                    <Typography
                      color="textSecondary"
                      gutterBottom
                      sx={{ fontSize: "0.875rem" }}
                    >
                      {card.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "2rem",
                        fontWeight: 700,
                        color: card.color,
                      }}
                    >
                      {loading ? "..." : card.value}
                    </Typography>
                  </Box>
                  <IconComponent
                    sx={{ fontSize: "2.5rem", color: card.color, opacity: 0.3 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
