"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, Theme } from "@mui/material/styles";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Create RTL cache
const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

const cacheLtr = createCache({
  key: "muiltr",
  stylisPlugins: [prefixer],
});

// Theme Context
interface ThemeContextType {
  isDarkMode: boolean;
  isRTL: boolean;
  toggleDarkMode: () => void;
  toggleRTL: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Create theme function
const createAppTheme = (isDarkMode: boolean, isRTL: boolean): Theme => {
  return createTheme({
    direction: isRTL ? "rtl" : "ltr",
    palette: {
      mode: isDarkMode ? "dark" : "light",
      primary: {
        main: "#1976d2",
        light: "#42a5f5",
        dark: "#1565c0",
      },
      secondary: {
        main: "#dc004e",
        light: "#ff5983",
        dark: "#9a0036",
      },
      background: {
        default: isDarkMode ? "#121212" : "#fafafa",
        paper: isDarkMode ? "#1e1e1e" : "#ffffff",
      },
      text: {
        primary: isDarkMode ? "#ffffff" : "#212121",
        secondary: isDarkMode ? "#b3b3b3" : "#757575",
      },
    },
    typography: {
      fontFamily: roboto.style.fontFamily,
      h1: { fontWeight: 600 },
      h2: { fontWeight: 600 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 8,
            fontWeight: 500,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: isDarkMode
              ? "0 2px 12px rgba(0,0,0,0.3)"
              : "0 2px 12px rgba(0,0,0,0.08)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff",
            color: isDarkMode ? "#ffffff" : "#212121",
            boxShadow: isDarkMode
              ? "0 1px 3px rgba(0,0,0,0.3)"
              : "0 1px 3px rgba(0,0,0,0.1)",
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: isDarkMode
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.04)",
            },
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: isDarkMode ? "#2d2d2d" : "#ffffff",
            color: isDarkMode ? "#ffffff" : "#212121",
          },
        },
      },
    },
  });
};

// Theme Provider Component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRTL, setIsRTL] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load theme and RTL preferences from localStorage on mount (client-side only)
  useEffect(() => {
    setIsHydrated(true);

    // Only access localStorage after hydration
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("darkMode");
      const savedRTL = localStorage.getItem("rtlMode");

      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
      if (savedRTL !== null) {
        setIsRTL(JSON.parse(savedRTL));
      }
    }
  }, []);

  // Save theme preference to localStorage when it changes (client-side only)
  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    }
  }, [isDarkMode, isHydrated]);

  // Save RTL preference to localStorage when it changes (client-side only)
  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      localStorage.setItem("rtlMode", JSON.stringify(isRTL));
    }
  }, [isRTL, isHydrated]);

  // Update HTML dir attribute when RTL changes
  useEffect(() => {
    if (isHydrated && typeof document !== "undefined") {
      document.documentElement.dir = isRTL ? "rtl" : "ltr";
      document.documentElement.lang = isRTL ? "ar" : "en";
    }
  }, [isRTL, isHydrated]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleRTL = () => {
    setIsRTL(!isRTL);
  };

  const theme = createAppTheme(isDarkMode, isRTL);
  const cache = isRTL ? cacheRtl : cacheLtr;

  // Prevent flash of unstyled content during hydration
  if (!isHydrated) {
    // Use light theme and LTR during SSR and initial hydration
    const ssrTheme = createAppTheme(false, false);
    return (
      <ThemeContext.Provider
        value={{ isDarkMode: false, isRTL: false, toggleDarkMode, toggleRTL }}
      >
        <CacheProvider value={cacheLtr}>
          <MuiThemeProvider theme={ssrTheme}>
            <CssBaseline />
            {children}
          </MuiThemeProvider>
        </CacheProvider>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider
      value={{ isDarkMode, isRTL, toggleDarkMode, toggleRTL }}
    >
      <CacheProvider value={cache}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </MuiThemeProvider>
      </CacheProvider>
    </ThemeContext.Provider>
  );
};
