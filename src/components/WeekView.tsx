"use client";

import React from "react";
import { Box, Typography, Paper, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useCalendarStore, Event } from "../stores/calendarStore";
import { useCalendarHelpers } from "../hooks/useCalendarHelpers";

interface WeekViewProps {
  onEventClick?: (event: Event) => void;
  onEventEdit?: (event: Event) => void;
  onDateClick?: (date: Date, mouseEvent?: React.MouseEvent) => void;
}

const WeekView: React.FC<WeekViewProps> = React.memo(
  ({ onEventClick, onEventEdit, onDateClick }) => {
    // Use Zustand store for calendar state
    const { currentDate, navigateDate } = useCalendarStore();

    // Use custom hook for calendar helpers
    const {
      timeSlots,
      getWeekDates,
      getEventPosition,
      getEventsForDate,
      formatTime,
      getDayName,
      isToday,
    } = useCalendarHelpers();

    // Use store date
    const workingDate = currentDate;
    const weekDates = getWeekDates(workingDate);

    const navigateWeek = (direction: "prev" | "next") => {
      navigateDate(direction);
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
            <IconButton size="small" onClick={() => navigateWeek("prev")}>
              <ChevronLeft />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </Typography>
            <IconButton size="small" onClick={() => navigateWeek("next")}>
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
              11 events
            </Typography>
            <Typography variant="caption" color="text.secondary">
              View all events for this week
            </Typography>
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
          {/* Week header */}
          <Box
            sx={{
              height: 60,
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              backgroundColor: "background.paper",
            }}
          >
            {weekDates.map((date, index) => (
              <Box
                key={index}
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRight: index < 6 ? 1 : 0,
                  borderColor: "divider",
                  py: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 500,
                    mb: 0.5,
                  }}
                >
                  {getDayName(date)}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: isToday(date) ? "primary.main" : "text.primary",
                  }}
                >
                  {date.getDate()}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Week grid */}
          <Box
            sx={{
              display: "flex",
              position: "relative",
              height: `${timeSlots.length * 80}px`,
            }}
          >
            {weekDates.map((date, dayIndex) => (
              <Box
                key={dayIndex}
                sx={{
                  flex: 1,
                  borderRight: dayIndex < 6 ? 1 : 0,
                  borderColor: "divider",
                  position: "relative",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
                onClick={(e) => onDateClick?.(date, e)}
              >
                {/* Time grid lines */}
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

                {/* Events for this day */}
                {getEventsForDate(date).map((event) => {
                  const { top, height } = getEventPosition(
                    event.startTime,
                    event.endTime
                  );
                  return (
                    <Paper
                      key={event.id}
                      elevation={1}
                      sx={{
                        position: "absolute",
                        top: `${top}px`,
                        left: 4,
                        right: 4,
                        height: `${height}px`,
                        backgroundColor: event.color,
                        color: "white",
                        p: 1,
                        borderRadius: 1,
                        cursor: "pointer",
                        zIndex: 1,
                        "&:hover": {
                          elevation: 3,
                        },
                      }}
                      onClick={() => onEventClick?.(event)}
                      onDoubleClick={() => onEventEdit?.(event)}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          mb: 0.5,
                        }}
                      >
                        {event.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          opacity: 0.9,
                          fontSize: "0.7rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatTime(event.startTime)} -{" "}
                        {formatTime(event.endTime)}
                      </Typography>
                    </Paper>
                  );
                })}
              </Box>
            ))}
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

WeekView.displayName = "WeekView";

export default WeekView;
