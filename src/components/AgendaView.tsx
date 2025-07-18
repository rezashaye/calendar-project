"use client";

import React from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
} from "@mui/material";
import { EventNote, Schedule, Person } from "@mui/icons-material";
import {
  useCalendarStore,
  Event as CalendarEvent,
} from "../stores/calendarStore";
import { useCalendarHelpers } from "../hooks/useCalendarHelpers";
import { formatJalaliFullDate } from "../utils/jalaliHelper";

interface AgendaViewProps {
  onEventClick?: (event: CalendarEvent, mouseEvent?: React.MouseEvent) => void;
  onEventEdit?: (event: CalendarEvent, mouseEvent?: React.MouseEvent) => void;
  onDateClick?: (date: Date, mouseEvent?: React.MouseEvent) => void;
}

const AgendaView: React.FC<AgendaViewProps> = React.memo(
  ({ onEventClick, onEventEdit, onDateClick }) => {
    // Add console.log to avoid unused variable warning for now
    console.log("AgendaView handlers:", {
      onEventClick,
      onEventEdit,
      onDateClick,
    });

    // Use Zustand store for calendar state
    const { currentDate } = useCalendarStore();

    // Use custom hook for calendar helpers
    const { getEventsForDateRange, formatTime, isToday } = useCalendarHelpers();

    // Use prop date if provided, otherwise use store date
    const workingDate = currentDate;

    // Get upcoming events for the next 30 days
    const getUpcomingEvents = () => {
      const startDate = new Date(workingDate);
      const endDate = new Date(workingDate);
      endDate.setDate(endDate.getDate() + 30);

      const events = getEventsForDateRange(startDate, endDate);

      // Sort events by date and time
      return events.sort((a, b) => {
        const dateA = new Date(a.date + "T" + a.startTime);
        const dateB = new Date(b.date + "T" + b.startTime);
        return dateA.getTime() - dateB.getTime();
      });
    };

    const upcomingEvents = getUpcomingEvents();

    // Group events by date
    const groupEventsByDate = () => {
      const grouped: { [key: string]: CalendarEvent[] } = {};

      upcomingEvents.forEach((event) => {
        const date = event.date || event.startDate;
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(event);
      });

      return grouped;
    };

    const groupedEvents = groupEventsByDate();

    const getEventTypeColor = (color: string) => {
      switch (color) {
        case "#9c27b0":
          return "secondary";
        case "#2196f3":
          return "primary";
        case "#4caf50":
          return "success";
        case "#ff9800":
          return "warning";
        case "#f44336":
          return "error";
        default:
          return "default";
      }
    };

    const renderEventItem = (event: CalendarEvent) => {
      return (
        <ListItem
          key={event.id}
          sx={{
            py: 2,
            px: 3,
            borderLeft: 3,
            borderColor: event.color,
            mb: 1,
            backgroundColor: "background.paper",
            borderRadius: 1,
            boxShadow: 1,
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
          onClick={(e) => onEventClick?.(event, e)}
          onDoubleClick={() => onEventEdit?.(event)}
        >
          <ListItemText
            primary={
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600 }}
                  component="span"
                >
                  {event.title}
                </Typography>
                <Chip
                  label={getEventTypeColor(event.color)}
                  size="small"
                  variant="outlined"
                  sx={{ textTransform: "capitalize" }}
                />
              </Box>
            }
            secondary={
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Schedule sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    component="span"
                  >
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </Typography>
                </Box>

                {event.attendee && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Person sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      component="span"
                    >
                      {event.attendee}
                    </Typography>
                  </Box>
                )}

                {event.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    component="span"
                  >
                    {event.description}
                  </Typography>
                )}
              </Box>
            }
            primaryTypographyProps={{ component: "div" }}
            secondaryTypographyProps={{ component: "div" }}
          />

          <Avatar
            sx={{
              bgcolor: event.color,
              width: 40,
              height: 40,
              ml: 2,
            }}
          >
            <EventNote />
          </Avatar>
        </ListItem>
      );
    };

    const renderDateSection = (dateStr: string, events: CalendarEvent[]) => {
      const date = new Date(dateStr);
      const today = isToday(date);

      return (
        <Box key={dateStr} sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              mb: 2,
              color: today ? "primary.main" : "text.primary",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {formatJalaliFullDate(date)}
            {today && (
              <Chip
                label="امروز"
                size="small"
                color="primary"
                variant="filled"
              />
            )}
          </Typography>

          <List sx={{ p: 0 }}>
            {events.map((event) => renderEventItem(event))}
          </List>
        </Box>
      );
    };

    const renderMiniCalendar = () => {
      const upcomingCount = upcomingEvents.length;
      const todayEvents = upcomingEvents.filter((event) => {
        const eventDate = event.date || event.startDate;
        return isToday(new Date(eventDate));
      });

      return (
        <Box sx={{ width: 280, p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            نمای کلی برنامه
          </Typography>

          {/* Stats */}
          <Box sx={{ mb: 3 }}>
            <Paper sx={{ p: 2, mb: 2, backgroundColor: "primary.light" }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "primary.main" }}
              >
                {upcomingCount}
              </Typography>
              <Typography variant="body2" sx={{ color: "primary.dark" }}>
                رویدادهای پیش رو
              </Typography>
            </Paper>

            <Paper sx={{ p: 2, backgroundColor: "success.light" }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "success.main" }}
              >
                {todayEvents.length}
              </Typography>
              <Typography variant="body2" sx={{ color: "success.dark" }}>
                رویدادهای امروز
              </Typography>
            </Paper>
          </Box>

          {/* Today's Events */}
          {todayEvents.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                برنامه امروز
              </Typography>
              {todayEvents.map((event) => (
                <Box key={event.id} sx={{ mb: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                    {event.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          {/* Event Types */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              انواع رویداد
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {["جلسه", "شخصی", "کاری", "سلامتی", "سایر"].map((type) => (
                <Chip
                  key={type}
                  label={type}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "0.7rem" }}
                />
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
          {/* Header */}
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
            <EventNote sx={{ fontSize: 28, color: "primary.main", mr: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              نمای برنامه
            </Typography>
          </Box>

          {/* Events list */}
          <Box sx={{ p: 3, overflow: "auto", height: "calc(100vh - 140px)" }}>
            {Object.keys(groupedEvents).length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "50%",
                  textAlign: "center",
                }}
              >
                <EventNote
                  sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  رویداد پیش رو وجود ندارد
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  برنامه شما برای ۳۰ روز آینده خالی است.
                </Typography>
              </Box>
            ) : (
              Object.entries(groupedEvents).map(([date, events]) =>
                renderDateSection(date, events)
              )
            )}
          </Box>
        </Box>

        {/* Right sidebar */}
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

AgendaView.displayName = "AgendaView";

export default AgendaView;
