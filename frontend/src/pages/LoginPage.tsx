import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Typography,
  Alert,
  Link,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ username, password });
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to log in. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 440, backgroundColor: "#16213e" }}>
        <CardHeader
          title="Login"
          subheader="Access your GhostNet dashboard"
          titleTypographyProps={{ sx: { color: "#00d4ff", fontWeight: 700 } }}
          subheaderTypographyProps={{ sx: { color: "#adb5bd" } }}
        />
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              fullWidth
              label="Username"
              variant="outlined"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              InputLabelProps={{ sx: { color: "#adb5bd" } }}
              InputProps={{ sx: { color: "#e9ecef" } }}
              required
            />
            <TextField
              margin="normal"
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              InputLabelProps={{ sx: { color: "#adb5bd" } }}
              InputProps={{ sx: { color: "#e9ecef" } }}
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, mb: 1, backgroundColor: "#00d4ff" }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </Box>

          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            New here?{" "}
            <Link component={RouterLink} to="/register" underline="hover">
              Create a new account
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
