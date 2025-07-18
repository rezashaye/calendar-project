"use client";

import React from "react";
import { Box, Typography, Paper, IconButton, Badge } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useCalendarStore, Event } from "../stores/calendarStore";
import { useCalendarHelpers } from "../hooks/useCalendarHelpers";
import {
  jalaliWeekdaysShort,
  formatJalaliMonthYear,
  getJalaliMonthData,
  getJalaliDate,
} from "../utils/jalaliHelper";

interface MonthViewProps {
  onEventClick?: (event: Event, mouseEvent?: React.MouseEvent) => void;
  onEventEdit?: (event: Event, mouseEvent?: React.MouseEvent) => void;
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
      return getJalaliMonthData(date);
    };

    const { days } = getMonthData(workingDate);
    const weekdays = jalaliWeekdaysShort;

    const navigateMonth = (direction: "prev" | "next") => {
      navigateDate(direction);
    };

    const formatMonthYear = (date: Date) => {
      return formatJalaliMonthYear(date);
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
                cursor: "pointer",
                "&:hover": {
                  opacity: 0.8,
                },
              }}
              onClick={(e) => onEventClick?.(event, e)}
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
              +{dayEvents.length - maxVisible} بیشتر
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
            <IconButton size="small" onClick={() => navigateMonth("next")}>
              <ChevronRight />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {formatMonthYear(workingDate)}
            </Typography>
            <IconButton size="small" onClick={() => navigateMonth("prev")}>
              <ChevronLeft />
            </IconButton>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              این ماه
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              {formatMonthYear(workingDate)}
            </Typography>

            {/* Recent events */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                رویدادهای پیش رو
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
                          {getJalaliDate(day)}
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
