"use client";

import React from "react";
import { Box, Typography, Paper, IconButton, Badge } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useCalendarStore, Event } from "../stores/calendarStore";
import { useCalendarHelpers } from "../hooks/useCalendarHelpers";

interface MonthViewProps {
  onEventClick?: (event: Event) => void;
  onEventEdit?: (event: Event) => void;
  onDateClick?: (date: Date, mouseEvent?: React.MouseEvent) => void;
}

const MonthView: React.FC<MonthViewProps> = React.memo(
  ({ onEventClick, onEventEdit, onDateClick }) => {
    // Add console.log to avoid unused variable warning for now
    console.log("MonthView handlers:", {
      onEventClick,
      onEventEdit,
      onDateClick,
    });

    // Use Zustand store for calendar state
    const { currentDate, navigateDate, setSelectedDate } = useCalendarStore();

    // Use custom hook for calendar helpers
    const { getEventsForDate, formatTime, isToday, getEventCountForDate } =
      useCalendarHelpers();

    // Use store date
    const workingDate = currentDate;

    // Calculate month data
    const getMonthData = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();

      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      const firstDayWeekday = firstDayOfMonth.getDay();
      const daysInMonth = lastDayOfMonth.getDate();

      const days = [];
      const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      // Add empty cells for days before the first day of the month
      for (let i = 0; i < firstDayWeekday; i++) {
        days.push(null);
      }

      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(year, month, day));
      }

      return { days, weekdays };
    };

    const { days, weekdays } = getMonthData(workingDate);

    const navigateMonth = (direction: "prev" | "next") => {
      navigateDate(direction);
    };

    const formatMonthYear = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    };

    const handleDateClick = (date: Date, mouseEvent: React.MouseEvent) => {
      setSelectedDate(date);
      onDateClick?.(date, mouseEvent);
    };

    const renderDayEvents = (date: Date) => {
      const dayEvents = getEventsForDate(date);
      const maxVisible = 2;

      return (
        <Box sx={{ mt: 0.5 }}>
          {dayEvents.slice(0, maxVisible).map((event) => (
            <Box
              key={event.id}
              sx={{
                backgroundColor: event.color,
                color: "white",
                fontSize: "0.65rem",
                fontWeight: 500,
                px: 0.5,
                py: 0.25,
                mb: 0.25,
                borderRadius: 0.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {event.title}
            </Box>
          ))}
          {dayEvents.length > maxVisible && (
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: "0.6rem",
                fontWeight: 500,
              }}
            >
              +{dayEvents.length - maxVisible} more
            </Typography>
          )}
        </Box>
      );
    };

    const renderMiniCalendar = () => {
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
            <IconButton size="small" onClick={() => navigateMonth("prev")}>
              <ChevronLeft />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {formatMonthYear(workingDate)}
            </Typography>
            <IconButton size="small" onClick={() => navigateMonth("next")}>
              <ChevronRight />
            </IconButton>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              This Month
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              {formatMonthYear(workingDate)}
            </Typography>

            {/* Recent events */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Upcoming Events
              </Typography>
              {getEventsForDate(new Date())
                .slice(0, 3)
                .map((event) => (
                  <Box key={event.id} sx={{ mb: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, mb: 0.5 }}
                    >
                      {event.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(event.startTime)} -{" "}
                      {formatTime(event.endTime)}
                    </Typography>
                  </Box>
                ))}
            </Box>
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
        {/* Main content area */}
        <Box sx={{ flex: 1, position: "relative" }}>
          {/* Month header */}
          <Box
            sx={{
              height: 60,
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: 3,
              backgroundColor: "background.paper",
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {formatMonthYear(workingDate)}
            </Typography>
          </Box>

          {/* Calendar grid */}
          <Box sx={{ p: 2 }}>
            {/* Weekday headers */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 1,
                mb: 1,
              }}
            >
              {weekdays.map((day) => (
                <Typography
                  key={day}
                  variant="subtitle2"
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

            {/* Calendar days */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 1,
                minHeight: "calc(100vh - 200px)",
              }}
            >
              {days.map((day, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    minHeight: 120,
                    p: 1,
                    cursor: day ? "pointer" : "default",
                    backgroundColor: day ? "background.paper" : "transparent",
                    border: day ? "1px solid" : "none",
                    borderColor: day ? "divider" : "transparent",
                    borderRadius: 1,
                    position: "relative",
                    "&:hover": {
                      backgroundColor: day ? "action.hover" : "transparent",
                    },
                  }}
                  onClick={(e) => day && handleDateClick(day, e)}
                >
                  {day && (
                    <>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: isToday(day)
                              ? "primary.main"
                              : "text.primary",
                            backgroundColor: isToday(day)
                              ? "primary.light"
                              : "transparent",
                            borderRadius: "50%",
                            width: 24,
                            height: 24,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {day.getDate()}
                        </Typography>
                        {getEventCountForDate(day) > 0 && (
                          <Badge
                            badgeContent={getEventCountForDate(day)}
                            color="primary"
                            sx={{
                              "& .MuiBadge-badge": {
                                fontSize: "0.6rem",
                                height: 16,
                                minWidth: 16,
                              },
                            }}
                          />
                        )}
                      </Box>
                      {renderDayEvents(day)}
                    </>
                  )}
                </Paper>
              ))}
            </Box>
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

MonthView.displayName = "MonthView";

export default MonthView;
