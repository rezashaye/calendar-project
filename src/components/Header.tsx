"use client";

// React imports
import React from "react";
import { useState } from "react";

// Material-UI imports
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Chip,
} from "@mui/material";
import {
  CalendarMonth,
  Add,
  ViewWeek,
  ViewAgenda,
  ViewModule,
  ViewDay,
  Today,
  ChevronLeft,
  ChevronRight,
  Settings,
  AccountCircle,
  Notifications,
  LightMode,
  DarkMode,
} from "@mui/icons-material";

// Local imports
import { useTheme } from "../context/ThemeContext";
import { useColorTheme } from "../context/ColorThemeContext";
import { useCalendarStore, CalendarView } from "../stores/calendarStore";
import { useCalendarHelpers } from "../hooks/useCalendarHelpers";
import { formatJalaliMonthYear } from "../utils/jalaliHelper";
import ColorPicker from "./ColorPicker";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface HeaderProps {
  onAddEvent?: (anchorEl: HTMLElement) => void;
}

/**
 * Header component for the calendar application
 *
 * Features:
 * - App branding and logo
 * - Date navigation (Today, Previous/Next)
 * - View selector (Month, Week, Day, Agenda)
 * - Event count badge
 * - Add Event button
 * - Dark/Light mode toggle
 * - User profile menu
 *
 * @param props.onAddEvent - Callback function when Add Event button is clicked
 */
const Header: React.FC<HeaderProps> = ({ onAddEvent }) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [viewAnchorEl, setViewAnchorEl] = useState<null | HTMLElement>(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [colorPickerAnchorEl, setColorPickerAnchorEl] =
    useState<null | HTMLElement>(null);

  // ============================================================================
  // HOOKS & STORES
  // ============================================================================
  // Calendar state from Zustand store
  const {
    currentView,
    currentDate,
    setCurrentView,
    navigateToToday,
    navigateDate,
  } = useCalendarStore();

  // Calendar calculations
  const { currentWeekEventsCount, currentMonthEventsCount } =
    useCalendarHelpers();

  // Theme context
  const { isDarkMode, toggleDarkMode } = useTheme();

  // Color theme context
  const { currentColorTheme } = useColorTheme();

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  /**
   * Get events count based on current view
   */
  const getEventsCount = (): number => {
    switch (currentView) {
      case "هفتگی":
        return currentWeekEventsCount;
      case "ماهانه":
        return currentMonthEventsCount;
      default:
        return currentMonthEventsCount;
    }
  };

  /**
   * Format current date for display
   */
  const formatCurrentDate = (): string => {
    return formatJalaliMonthYear(currentDate);
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  const handleViewMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setViewAnchorEl(event.currentTarget);
  };

  const handleViewMenuClose = () => {
    setViewAnchorEl(null);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleColorPickerOpen = (event: React.MouseEvent<HTMLElement>) => {
    setColorPickerAnchorEl(event.currentTarget);
  };

  const handleColorPickerClose = () => {
    setColorPickerAnchorEl(null);
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view as CalendarView);
    handleViewMenuClose();
  };

  const goToToday = () => {
    navigateToToday();
  };

  // ============================================================================
  // CONSTANTS
  // ============================================================================
  const viewOptions = [
    { name: "ماهانه", icon: <ViewModule /> },
    { name: "هفتگی", icon: <ViewWeek /> },
    { name: "روزانه", icon: <ViewDay /> },
    { name: "برنامه", icon: <ViewAgenda /> },
  ];

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: 3 }}>
        {/* ================================================================== */}
        {/* LEFT SECTION - LOGO & NAVIGATION */}
        {/* ================================================================== */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Logo & App Title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={handleColorPickerOpen}
              sx={{
                p: 0.5,
                borderRadius: 2,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "action.hover",
                  transform: "scale(1.05)",
                },
              }}
              title="Customize header colors"
            >
              <CalendarMonth
                sx={{
                  fontSize: 32,
                  color: currentColorTheme.primary,
                  transition: "color 0.3s ease-in-out",
                }}
              />
            </IconButton>
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 600,
                background: currentColorTheme.gradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                transition: "background 0.3s ease-in-out",
              }}
            >
              برنامه تقویم
            </Typography>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Date Navigation Controls */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Today />}
              onClick={goToToday}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                borderColor: currentColorTheme.primary,
                color: currentColorTheme.primary,
                "&:hover": {
                  borderColor: currentColorTheme.accent,
                  backgroundColor: `${currentColorTheme.primary}08`,
                },
                transition: "all 0.3s ease-in-out",
              }}
            >
              امروز
            </Button>

            <IconButton
              onClick={() => navigateDate("next")}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                "&:hover": {
                  borderColor: currentColorTheme.primary,
                  backgroundColor: `${currentColorTheme.primary}08`,
                },
                transition: "all 0.3s ease-in-out",
              }}
            >
              <ChevronRight />
            </IconButton>

            <IconButton
              onClick={() => navigateDate("prev")}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                "&:hover": {
                  borderColor: currentColorTheme.primary,
                  backgroundColor: `${currentColorTheme.primary}08`,
                },
                transition: "all 0.3s ease-in-out",
              }}
            >
              <ChevronLeft />
            </IconButton>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                minWidth: 200,
                textAlign: "center",
              }}
            >
              {formatCurrentDate()}
            </Typography>
          </Box>
        </Box>

        {/* ================================================================== */}
        {/* RIGHT SECTION - VIEW CONTROLS & PROFILE */}
        {/* ================================================================== */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* View Selector */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleViewMenuOpen}
              endIcon={<ChevronRight sx={{ transform: "rotate(90deg)" }} />}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                borderColor: currentColorTheme.secondary,
                color: currentColorTheme.secondary,
                "&:hover": {
                  borderColor: currentColorTheme.primary,
                  backgroundColor: `${currentColorTheme.secondary}08`,
                },
                transition: "all 0.3s ease-in-out",
              }}
            >
              {currentView}
            </Button>

            <Menu
              anchorEl={viewAnchorEl}
              open={Boolean(viewAnchorEl)}
              onClose={handleViewMenuClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: 2,
                  minWidth: 150,
                },
              }}
            >
              {viewOptions.map((option) => (
                <MenuItem
                  key={option.name}
                  onClick={() => handleViewChange(option.name)}
                  sx={{
                    gap: 1,
                    borderRadius: 1,
                    mx: 1,
                    mb: 0.5,
                  }}
                >
                  {option.icon}
                  {option.name}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Event Count Badge */}
          <Chip
            label={`${getEventsCount()} رویداد`}
            size="small"
            variant="outlined"
            sx={{
              borderRadius: 2,
              fontWeight: 500,
              borderColor: currentColorTheme.primary,
              color: currentColorTheme.primary,
              backgroundColor: `${currentColorTheme.primary}08`,
              transition: "all 0.3s ease-in-out",
            }}
          />

          {/* Add Event Button */}
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={(e) => onAddEvent?.(e.currentTarget)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              background: currentColorTheme.gradient,
              "&:hover": {
                background: `linear-gradient(45deg, ${currentColorTheme.accent}, ${currentColorTheme.primary})`,
                transform: "translateY(-1px)",
                boxShadow: `0 4px 12px ${currentColorTheme.primary}40`,
              },
              transition: "all 0.3s ease-in-out",
            }}
          >
            افزودن رویداد
          </Button>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Dark Mode Toggle */}
          <IconButton
            onClick={toggleDarkMode}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <LightMode /> : <DarkMode />}
          </IconButton>

          {/* Notifications */}
          <IconButton
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Notifications />
          </IconButton>

          {/* Profile Menu */}
          <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: "primary.main",
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              RS
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={profileAnchorEl}
            open={Boolean(profileAnchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: 2,
                minWidth: 200,
              },
            }}
          >
            <MenuItem onClick={handleProfileMenuClose} sx={{ gap: 1 }}>
              <AccountCircle />
              پروفایل
            </MenuItem>
            <MenuItem onClick={handleProfileMenuClose} sx={{ gap: 1 }}>
              <Settings />
              تنظیمات
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleProfileMenuClose} sx={{ gap: 1 }}>
              خروج
            </MenuItem>
          </Menu>

          {/* Color Picker */}
          <ColorPicker
            anchorEl={colorPickerAnchorEl}
            open={Boolean(colorPickerAnchorEl)}
            onClose={handleColorPickerClose}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
