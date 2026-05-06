import { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Storage as StorageIcon,
  Description as LogsIcon,
  Security as SecurityIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const DRAWER_WIDTH = 280;

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { isAuthenticated, logout, user } = useAuth();

  const navItems = isAuthenticated
    ? [
        { label: "Dashboard", path: "/", icon: DashboardIcon },
        { label: "Sessions", path: "/sessions", icon: StorageIcon },
        { label: "Raw Logs", path: "/logs", icon: LogsIcon },
      ]
    : [
        { label: "Login", path: "/login", icon: LoginIcon },
        { label: "Register", path: "/register", icon: RegisterIcon },
      ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar
        sx={{
          flexShrink: 0,
          background: "linear-gradient(135deg, #00d4ff 0%, #00a8cc 100%)",
        }}
      >
        <SecurityIcon sx={{ mr: 1, color: "#0a0e27" }} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#0a0e27",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          GhostNet
        </Typography>
      </Toolbar>

      <Divider sx={{ borderColor: "#2c3e50" }} />

      <List sx={{ flex: 1, pt: 2 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: "8px",
                  backgroundColor: isActive
                    ? "rgba(0, 212, 255, 0.1)"
                    : "transparent",
                  borderLeft: isActive
                    ? "3px solid #00d4ff"
                    : "3px solid transparent",
                  color: isActive ? "#00d4ff" : "inherit",
                  "&:hover": {
                    backgroundColor: "rgba(0, 212, 255, 0.05)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{ color: isActive ? "#00d4ff" : "#adb5bd", minWidth: 40 }}
                >
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    "& .MuiListItemText-primary": {
                      fontWeight: isActive ? 600 : 500,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box
        sx={{
          p: 2,
          borderTop: "1px solid #2c3e50",
          fontSize: "0.75rem",
          color: "#adb5bd",
        }}
      >
        <Typography variant="caption" display="block">
          SSH Honeypot Monitor
        </Typography>
        <Typography variant="caption" display="block">
          v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{ display: "flex", backgroundColor: "#0a0e27", minHeight: "100vh" }}
    >
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { xs: "100%", sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          backgroundColor: "#16213e",
          borderBottom: "1px solid #2c3e50",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: 700, color: "#00d4ff" }}
          >
            SSH Honeypot Logs
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {isAuthenticated ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ color: "#adb5bd", fontSize: "0.9rem" }}>
                {user?.username}
              </Typography>
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={logout}
                sx={{ textTransform: "none" }}
              >
                Logout
              </Button>
            </Box>
          ) : (
            <Button
              color="inherit"
              startIcon={<LoginIcon />}
              onClick={() => handleNavigation("/login")}
              sx={{ textTransform: "none" }}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              backgroundColor: "#16213e",
              borderRight: "1px solid #2c3e50",
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              backgroundColor: "#16213e",
              borderRight: "1px solid #2c3e50",
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { xs: "100%", sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: "64px",
          backgroundColor: "#0a0e27",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
