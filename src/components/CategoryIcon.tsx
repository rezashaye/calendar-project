import React from "react";
import { Box, Tooltip } from "@mui/material";
import type { Category } from "../stores/calendarStore";

interface CategoryIconProps {
  category?: Category;
  size?: "small" | "medium" | "large";
  showTooltip?: boolean;
}

export function CategoryIcon({
  category,
  size = "small",
  showTooltip = true,
}: CategoryIconProps) {
  if (!category) {
    return null;
  }

  const sizeStyles = {
    small: {
      width: 20,
      height: 20,
      fontSize: "12px",
      borderRadius: "4px",
    },
    medium: {
      width: 24,
      height: 24,
      fontSize: "14px",
      borderRadius: "6px",
    },
    large: {
      width: 32,
      height: 32,
      fontSize: "16px",
      borderRadius: "8px",
    },
  };

  const iconComponent = (
    <Box
      sx={{
        ...sizeStyles[size],
        backgroundColor: `${category.color}20`,
        border: `1px solid ${category.color}40`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: category.color,
        fontWeight: "bold",
        cursor: showTooltip ? "help" : "default",
        transition: "all 0.2s ease",
        "&:hover": showTooltip
          ? {
              backgroundColor: `${category.color}30`,
              transform: "scale(1.1)",
            }
          : {},
      }}
    >
      {category.icon}
    </Box>
  );

  if (showTooltip) {
    return (
      <Tooltip title={category.name} arrow>
        {iconComponent}
      </Tooltip>
    );
  }

  return iconComponent;
}
