import { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Divider,
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
  Tooltip,
  Avatar,
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
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  LocationCity as LocationCityIcon,
} from "@mui/icons-material";

import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const DRAWER_WIDTH = 280;
const COLLAPSED_WIDTH = 88;

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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
        { label: "IP Location Lookup", path: "/ip-lookup", icon: LocationCityIcon },
      ]
    : [
        { label: "Login", path: "/login", icon: LoginIcon },
        { label: "Register", path: "/register", icon: RegisterIcon },
      ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleNavigation = (path: string) => {
    navigate(path);

    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const currentDrawerWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Header */}
      <Toolbar
        sx={{
          flexShrink: 0,
          background: "linear-gradient(135deg, #00d4ff 0%, #00a8cc 100%)",
        }}
      >
        <SecurityIcon
          sx={{
            color: "#0a0e27",
            fontSize: 28,
            mx: collapsed ? "auto" : 0,
          }}
        />

        {!collapsed && (
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
        )}

        <Box sx={{ flexGrow: 1 }} />

        {!isMobile && (
          <IconButton onClick={toggleCollapsed}>
            {collapsed ? (
              <ChevronRightIcon sx={{ color: "#0a0e27" }} />
            ) : (
              <ChevronLeftIcon sx={{ color: "#0a0e27" }} />
            )}
          </IconButton>
        )}
      </Toolbar>

      <Divider sx={{ borderColor: "#2c3e50" }} />

      {/* Navigation */}
      <List sx={{ flex: 1, pt: 2 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <ListItem
              key={item.path}
              disablePadding
              sx={{
                mb: 1,
                px: 1.2,
              }}
            >
              <Tooltip
                title={collapsed ? item.label : ""}
                placement="right"
                arrow
              >
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    minHeight: 52,

                    borderRadius: "14px",

                    justifyContent: collapsed ? "center" : "flex-start",

                    px: collapsed ? 0 : 2,

                    backgroundColor: isActive
                      ? "rgba(0, 212, 255, 0.14)"
                      : "transparent",

                    color: isActive ? "#00d4ff" : "#d1d5db",

                    transition: "all 0.25s ease",

                    "&:hover": {
                      backgroundColor: "rgba(0, 212, 255, 0.08)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,

                      mr: collapsed ? 0 : 2,

                      justifyContent: "center",

                      color: isActive ? "#00d4ff" : "#94a3b8",

                      transition: "all 0.25s ease",
                    }}
                  >
                    <Icon />
                  </ListItemIcon>

                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      sx={{
                        "& .MuiListItemText-primary": {
                          fontSize: "0.95rem",
                          fontWeight: isActive ? 600 : 500,
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      {/* Footer */}
      {!collapsed && (
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
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        backgroundColor: "#0a0e27",
        minHeight: "100vh",
      }}
    >
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: {
            xs: "100%",
            sm: `calc(100% - ${currentDrawerWidth}px)`,
          },

          ml: {
            sm: `${currentDrawerWidth}px`,
          },

          backgroundColor: "#16213e",

          borderBottom: "1px solid #2c3e50",

          transition: "all 0.3s ease",
        }}
      >
        <Toolbar>
          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { sm: "none" },
            }}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>

          {/* Title */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              fontWeight: 700,
              color: "#00d4ff",
            }}
          >
            SSH Honeypot Logs
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {/* Auth Actions */}
          {isAuthenticated ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              {/* User Info */}
              {!isMobile && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.2,
                    py: 0.6,
                    borderRadius: "12px",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      background:
                        "linear-gradient(135deg, #00d4ff 0%, #00a8cc 100%)",
                      color: "#0a0e27",
                    }}
                  >
                    {user?.username?.charAt(0).toUpperCase()}
                  </Avatar>

                  <Typography
                    sx={{
                      color: "#e2e8f0",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                    }}
                  >
                    {user?.username}
                  </Typography>
                </Box>
              )}

              {/* Logout */}
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={logout}
                sx={{
                  textTransform: "none",
                  borderRadius: "10px",
                  px: 1.5,
                }}
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

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { sm: currentDrawerWidth },
          flexShrink: { sm: 0 },
        }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: {
              xs: "block",
              sm: "none",
            },

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
          open
          sx={{
            display: {
              xs: "none",
              sm: "block",
            },

            "& .MuiDrawer-paper": {
              boxSizing: "border-box",

              width: currentDrawerWidth,

              overflowX: "hidden",

              transition: "width 0.3s ease",

              backgroundColor: "#16213e",

              borderRight: "1px solid #2c3e50",
            },
          }}
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

          width: {
            xs: "100%",
            sm: `calc(100% - ${currentDrawerWidth}px)`,
          },

          mt: "64px",

          backgroundColor: "#0a0e27",

          transition: "all 0.3s ease",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
