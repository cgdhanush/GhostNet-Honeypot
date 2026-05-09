import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  CircularProgress,
} from "@mui/material";

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { IpInfo } from "../types/logs";


export function IpLookupPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<IpInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ip, setIp] = useState("");

  const [searchParams] = useSearchParams();

  const fetchIpInfo = async (targetIp: string) => {
    if (!targetIp) return;

    setLoading(true);
    setData(null);
    setError(null);

    try {
      const res = await fetch(`http://ip-api.com/json/${targetIp}`);
      const json = await res.json();

      if (json.status === "fail") {
        setError(json.message || "Failed to fetch IP info");
        return;
      }

      setData(json);
    } catch (err) {
      setError("Network error while fetching IP info");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const urlIp = searchParams.get("ip");

    if (!urlIp) return;

    (async () => {
      setIp(urlIp);
      await fetchIpInfo(urlIp);
    })();
  }, [searchParams]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, color: "#00d4ff" }}>
        IP Location Lookup
      </Typography>

      {/* Input */}
      <Card sx={{ mb: 2, background: "#16213e" }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              label="Enter IP Address"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              sx={{
                input: { color: "white" },
                label: { color: "#adb5bd" },
              }}
            />

            <Button
              variant="contained"
              onClick={() => fetchIpInfo(ip)}
              disabled={!ip || loading}
              sx={{
                backgroundColor: "#00d4ff",
                color: "#0a0e27",
              }}
            >
              Lookup
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress sx={{ color: "#00d4ff" }} />
        </Box>
      )}

      {/* Error */}
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {/* Result */}
      {data && (
        <Card sx={{ background: "#0f3460" }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography
                  sx={{
                    color: "#00d4ff",
                    fontWeight: 700,
                    fontFamily: "monospace",
                  }}
                >
                  {data.query}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography>Country: {data.country}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography>Region: {data.regionName}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography>City: {data.city}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography>ISP: {data.isp}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography>Org: {data.org}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography>Timezone: {data.timezone}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography>Lat: {data.lat}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography>Lon: {data.lon}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
