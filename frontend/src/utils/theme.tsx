import { createTheme, ThemeProvider } from '@mui/material/styles';
import type { ReactNode } from 'react';

// Dark theme for cybersecurity dashboard
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00d4ff',
      light: '#33e0ff',
      dark: '#00a8cc',
    },
    secondary: {
      main: '#ff006e',
      light: '#ff4d7a',
      dark: '#c7004d',
    },
    background: {
      default: '#0a0e27',
      paper: '#16213e',
    },
    error: {
      main: '#ff4444',
    },
    warning: {
      main: '#ffaa00',
    },
    success: {
      main: '#00ff88',
    },
    text: {
      primary: '#e9ecef',
      secondary: '#adb5bd',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#00d4ff',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#00d4ff',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.95rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#16213e',
          borderLeft: '3px solid #00d4ff',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#2c3e50',
        },
        head: {
          backgroundColor: '#1a2845',
          fontWeight: 700,
          color: '#00d4ff',
        },
      },
    },
  },
});

interface ThemeWrapperProps {
  children: ReactNode;
}

export function ThemeWrapper({ children }: ThemeWrapperProps) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

export default theme;
