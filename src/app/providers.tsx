"use client";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ThemeProvider } from "../context/ThemeContext";
import { ColorThemeProvider } from "../context/ColorThemeContext";
import { useHydrationSafeHTML } from "../hooks/useHydrationSafeHTML";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Handle dynamic HTML attributes that might cause hydration issues
  useHydrationSafeHTML();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ColorThemeProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </ColorThemeProvider>
    </LocalizationProvider>
  );
}
