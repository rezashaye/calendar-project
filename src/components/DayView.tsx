"use client";

import React from "react";
import { Box, Typography, Paper, IconButton } from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  AccessTime,
  Person,
  Circle,
} from "@mui/icons-material";
import { useCalendarStore, Event } from "../stores/calendarStore";
import { useCalendarHelpers } from "../hooks/useCalendarHelpers";

interface DayViewProps {
  onEventClick?: (event: Event) => void;
  onEventEdit?: (event: Event) => void;
  onDateClick?: (date: Date, mouseEvent?: React.MouseEvent) => void;
}

const DayView: React.FC<DayViewProps> = React.memo(
  ({ onEventClick, onEventEdit, onDateClick }) => {
    // Add console.log to avoid unused variable warning for now
    console.log("DayView handlers:", {
      onEventClick,
      onEventEdit,
      onDateClick,
    });

    // Use Zustand store for calendar state
    const { currentDate, navigateDate } = useCalendarStore();

    // Use custom hook for calendar helpers
    const { timeSlots, getEventsForDate, formatTime, formatDateFull } =
      useCalendarHelpers();

    // Use store date
    const workingDate = currentDate;

    // Get events for the specific day
    const dayEvents = getEventsForDate(workingDate);

    const getEventPosition = (startTime: string, endTime: string) => {
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;
      const durationMinutes = endTotalMinutes - startTotalMinutes;

      // Calculate position relative to the visible hours (6 AM = 360 minutes from midnight)
      const visibleStartMinutes = 6 * 60; // 6 AM
      const topPosition = ((startTotalMinutes - visibleStartMinutes) / 60) * 80; // 80px per hour
      const height = (durationMinutes / 60) * 80; // 80px per hour

      return { top: topPosition, height };
    };

    const renderMiniCalendar = () => {
      const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const lastDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
      const firstDayWeekday = firstDayOfMonth.getDay();
      const daysInMonth = lastDayOfMonth.getDate();

      const days = [];
      const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

      // Add empty cells for days before the first day of the month
      for (let i = 0; i < firstDayWeekday; i++) {
        days.push(null);
      }

      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
      }

      return (
        <Box sx={{ width: 280, p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <IconButton size="small" onClick={() => navigateDate("prev")}>
              <ChevronLeft />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </Typography>
            <IconButton size="small" onClick={() => navigateDate("next")}>
              <ChevronRight />
            </IconButton>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 1,
              mb: 2,
            }}
          >
            {weekdays.map((day) => (
              <Typography
                key={day}
                variant="caption"
                sx={{
                  textAlign: "center",
                  fontWeight: 600,
                  color: "text.secondary",
                  py: 1,
                }}
              >
                {day}
              </Typography>
            ))}
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 1,
            }}
          >
            {days.map((day, index) => (
              <Box
                key={index}
                sx={{
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 1,
                  cursor: day ? "pointer" : "default",
                  backgroundColor:
                    day === currentDate.getDate()
                      ? "primary.main"
                      : "transparent",
                  color:
                    day === currentDate.getDate() ? "white" : "text.primary",
                  "&:hover": {
                    backgroundColor:
                      day && day !== currentDate.getDate()
                        ? "action.hover"
                        : undefined,
                  },
                }}
              >
                {day && (
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: day === currentDate.getDate() ? 600 : 400,
                    }}
                  >
                    {day}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>

          {/* Event indicators */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Happening now
            </Typography>
            {dayEvents.map((event) => (
              <Box key={event.id} sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {event.title}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Person sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary">
                    {event.attendee}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <AccessTime sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Circle sx={{ fontSize: 8, color: event.color }} />
                  <Typography variant="caption" color="text.secondary">
                    {event.description || "No description"}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      );
    };

    return (
      <Box
        sx={{
          display: "flex",
          height: "calc(100vh - 80px)",
          backgroundColor: "background.default",
        }}
      >
        {/* Time column */}
        <Box
          sx={{
            width: 80,
            backgroundColor: "background.paper",
            borderRight: 1,
            borderColor: "divider",
          }}
        >
          <Box sx={{ height: 60, borderBottom: 1, borderColor: "divider" }} />
          {timeSlots.map((slot) => (
            <Box
              key={slot.hour}
              sx={{
                height: 80,
                borderBottom: 1,
                borderColor: "divider",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                pt: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                  transform: "translateY(-50%)",
                }}
              >
                {slot.display}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Main content area */}
        <Box sx={{ flex: 1, position: "relative" }}>
          {/* Date header */}
          <Box
            sx={{
              height: 60,
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              px: 3,
              backgroundColor: "background.paper",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {formatDateFull(currentDate)}
            </Typography>
          </Box>

          {/* Time grid */}
          <Box
            sx={{
              position: "relative",
              height: `${timeSlots.length * 80}px`,
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
            onClick={(e) => onDateClick?.(workingDate, e)}
          >
            {timeSlots.map((slot, index) => (
              <Box
                key={slot.hour}
                sx={{
                  position: "absolute",
                  top: index * 80,
                  left: 0,
                  right: 0,
                  height: 80,
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              />
            ))}

            {/* Events */}
            {dayEvents.map((event) => {
              const { top, height } = getEventPosition(
                event.startTime,
                event.endTime
              );
              return (
                <Paper
                  key={event.id}
                  elevation={2}
                  sx={{
                    position: "absolute",
                    top: `${top}px`,
                    left: 16,
                    right: 16,
                    height: `${height}px`,
                    backgroundColor: event.color,
                    color: "white",
                    p: 1,
                    borderRadius: 1,
                    cursor: "pointer",
                    "&:hover": {
                      elevation: 4,
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      mb: 0.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {event.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      opacity: 0.9,
                      mb: 0.5,
                    }}
                  >
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </Typography>
                  {event.attendee && (
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Person sx={{ fontSize: 12 }} />
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        {event.attendee}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              );
            })}
          </Box>
        </Box>

        {/* Right sidebar - Mini calendar */}
        <Box
          sx={{
            backgroundColor: "background.paper",
            borderLeft: 1,
            borderColor: "divider",
          }}
        >
          {renderMiniCalendar()}
        </Box>
      </Box>
    );
  }
);

DayView.displayName = "DayView";

export default DayView;
