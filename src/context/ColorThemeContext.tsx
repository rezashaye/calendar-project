"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ColorTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
}

interface ColorThemeContextType {
  currentColorTheme: ColorTheme;
  availableColorThemes: ColorTheme[];
  setColorTheme: (theme: ColorTheme) => void;
  isHydrated: boolean;
}

// ============================================================================
// PREDEFINED COLOR THEMES
// ============================================================================

export const colorThemes: ColorTheme[] = [
  {
    id: "blue",
    name: "Ocean Blue",
    primary: "#1976d2",
    secondary: "#42a5f5",
    accent: "#1565c0",
    gradient: "linear-gradient(45deg, #1976d2, #42a5f5)",
  },
  {
    id: "purple",
    name: "Royal Purple",
    primary: "#7b1fa2",
    secondary: "#ba68c8",
    accent: "#4a148c",
    gradient: "linear-gradient(45deg, #7b1fa2, #ba68c8)",
  },
  {
    id: "green",
    name: "Forest Green",
    primary: "#388e3c",
    secondary: "#81c784",
    accent: "#1b5e20",
    gradient: "linear-gradient(45deg, #388e3c, #81c784)",
  },
  {
    id: "orange",
    name: "Sunset Orange",
    primary: "#f57c00",
    secondary: "#ffb74d",
    accent: "#e65100",
    gradient: "linear-gradient(45deg, #f57c00, #ffb74d)",
  },
  {
    id: "red",
    name: "Crimson Red",
    primary: "#d32f2f",
    secondary: "#ef5350",
    accent: "#b71c1c",
    gradient: "linear-gradient(45deg, #d32f2f, #ef5350)",
  },
  {
    id: "teal",
    name: "Ocean Teal",
    primary: "#00796b",
    secondary: "#4db6ac",
    accent: "#004d40",
    gradient: "linear-gradient(45deg, #00796b, #4db6ac)",
  },
  {
    id: "indigo",
    name: "Deep Indigo",
    primary: "#3f51b5",
    secondary: "#7986cb",
    accent: "#283593",
    gradient: "linear-gradient(45deg, #3f51b5, #7986cb)",
  },
  {
    id: "pink",
    name: "Rose Pink",
    primary: "#e91e63",
    secondary: "#f06292",
    accent: "#ad1457",
    gradient: "linear-gradient(45deg, #e91e63, #f06292)",
  },
];

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(
  undefined
);

export const useColorTheme = () => {
  const context = useContext(ColorThemeContext);
  if (!context) {
    throw new Error("useColorTheme must be used within a ColorThemeProvider");
  }
  return context;
};

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export const ColorThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentColorTheme, setCurrentColorTheme] = useState<ColorTheme>(
    colorThemes[0]
  );
  const [isHydrated, setIsHydrated] = useState(false);

  // Load color theme preference from localStorage on mount (client-side only)
  useEffect(() => {
    setIsHydrated(true);

    if (typeof window !== "undefined") {
      const savedColorTheme = localStorage.getItem("colorTheme");
      if (savedColorTheme) {
        try {
          const parsedTheme = JSON.parse(savedColorTheme);
          const foundTheme = colorThemes.find(
            (theme) => theme.id === parsedTheme.id
          );
          if (foundTheme) {
            setCurrentColorTheme(foundTheme);
          }
        } catch (error) {
          console.warn("Failed to parse saved color theme:", error);
        }
      }
    }
  }, []);

  // Save color theme preference to localStorage when it changes
  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      localStorage.setItem("colorTheme", JSON.stringify(currentColorTheme));
    }
  }, [currentColorTheme, isHydrated]);

  const setColorTheme = (theme: ColorTheme) => {
    setCurrentColorTheme(theme);
  };

  return (
    <ColorThemeContext.Provider
      value={{
        currentColorTheme,
        availableColorThemes: colorThemes,
        setColorTheme,
        isHydrated,
      }}
    >
      {children}
    </ColorThemeContext.Provider>
  );
};
