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

export function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({ username, email, password });
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to register. Please try again.",
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
          title="Register"
          subheader="Create your GhostNet account"
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
              label="Email"
              type="email"
              variant="outlined"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
              {loading ? "Creating account..." : "Register"}
            </Button>
          </Box>

          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Already have an account?{" "}
            <Link component={RouterLink} to="/login" underline="hover">
              Sign in instead
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
