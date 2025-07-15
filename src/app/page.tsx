"use client";

import dynamic from "next/dynamic";
import { Box, CircularProgress, Typography } from "@mui/material";

// Dynamically import the calendar component to avoid hydration issues
const CalendarApp = dynamic(() => import("@/components/CalendarApp"), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        gap: 2,
      }}
    >
      <CircularProgress size={40} />
      <Typography variant="body1" color="text.secondary">
        Loading Calendar...
      </Typography>
    </Box>
  ),
});

export default function Home() {
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      <CalendarApp />
    </Box>
  );
}
