"use client";

import React from "react";
import { Box, Typography, Tooltip, Menu, Paper, alpha } from "@mui/material";
import { Palette, Check } from "@mui/icons-material";
import { useColorTheme, ColorTheme } from "../context/ColorThemeContext";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ColorPickerProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

interface ColorSampleProps {
  theme: ColorTheme;
  isSelected: boolean;
  onClick: () => void;
}

// ============================================================================
// COLOR SAMPLE COMPONENT
// ============================================================================

const ColorSample: React.FC<ColorSampleProps> = ({
  theme,
  isSelected,
  onClick,
}) => {
  return (
    <Tooltip title={theme.name} placement="top">
      <Paper
        onClick={onClick}
        sx={{
          position: "relative",
          width: 60,
          height: 60,
          borderRadius: 3,
          background: theme.gradient,
          cursor: "pointer",
          border: isSelected ? "3px solid" : "2px solid transparent",
          borderColor: isSelected ? "text.primary" : "transparent",
          transition: "all 0.2s ease-in-out",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
            border: "2px solid",
            borderColor: "text.secondary",
          },
        }}
      >
        {isSelected && (
          <Check
            sx={{
              color: "white",
              fontSize: 24,
              fontWeight: "bold",
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
            }}
          />
        )}

        {/* Color preview dots */}
        <Box
          sx={{
            position: "absolute",
            bottom: 4,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 0.5,
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: theme.primary,
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          />
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: theme.secondary,
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          />
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: theme.accent,
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          />
        </Box>
      </Paper>
    </Tooltip>
  );
};

// ============================================================================
// COLOR PICKER COMPONENT
// ============================================================================

const ColorPicker: React.FC<ColorPickerProps> = ({
  anchorEl,
  open,
  onClose,
}) => {
  const { currentColorTheme, availableColorThemes, setColorTheme } =
    useColorTheme();

  const handleColorSelect = (theme: ColorTheme) => {
    setColorTheme(theme);
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          mt: 1,
          borderRadius: 3,
          minWidth: 320,
          maxWidth: 400,
          p: 2,
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(
              theme.palette.background.paper,
              0.95
            )}, ${alpha(theme.palette.background.default, 0.95)})`,
          backdropFilter: "blur(10px)",
          border: "1px solid",
          borderColor: "divider",
        },
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
    >
      <Box>
        {/* Header */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              background: currentColorTheme.gradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Palette sx={{ color: currentColorTheme.primary }} />
            Choose Your Theme Color
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Customize your header appearance
          </Typography>
        </Box>

        {/* Color Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 1.5,
          }}
        >
          {availableColorThemes.map((theme) => (
            <ColorSample
              key={theme.id}
              theme={theme}
              isSelected={currentColorTheme.id === theme.id}
              onClick={() => handleColorSelect(theme)}
            />
          ))}
        </Box>

        {/* Selected Theme Info */}
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 2,
            background: alpha(currentColorTheme.primary, 0.08),
            border: "1px solid",
            borderColor: alpha(currentColorTheme.primary, 0.2),
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: currentColorTheme.primary,
              mb: 0.5,
            }}
          >
            Current Theme: {currentColorTheme.name}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Colors:
            </Typography>
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: currentColorTheme.primary,
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            />
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: currentColorTheme.secondary,
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            />
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: currentColorTheme.accent,
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            />
          </Box>
        </Box>
      </Box>
    </Menu>
  );
};

export default ColorPicker;
