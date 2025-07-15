"use client";

import DayView from "@/components/DayView";
import WeekView from "@/components/WeekView";
import MonthView from "@/components/MonthView";
import AgendaView from "@/components/AgendaView";
import EventPopover from "@/components/EventPopover";
import Header from "@/components/Header";
import { useCalendarStore, Event } from "@/stores/calendarStore";
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

export default function CalendarApp() {
  const { currentView, addEvent, updateEvent, deleteEvent } =
    useCalendarStore();

  // Get events for initialization check
  const events = useCalendarStore((state) => state.events);

  // State for controlling hydration
  const [isHydrated, setIsHydrated] = useState(false);

  // Event popover state
  const [eventPopover, setEventPopover] = useState<{
    open: boolean;
    anchorEl: HTMLElement | null;
    event?: Event | null;
    mode: "create" | "edit";
    defaultDate?: Date;
    anchorPosition?: { top: number; left: number };
  }>({
    open: false,
    anchorEl: null,
    event: null,
    mode: "create",
  });

  // Handle hydration and initialization
  useEffect(() => {
    // Manually rehydrate the store since we're using skipHydration
    if (typeof window !== "undefined") {
      useCalendarStore.persist.rehydrate();
    }
    setIsHydrated(true);
  }, []);

  // Initialize sample data after hydration
  useEffect(() => {
    if (isHydrated && events.length === 0) {
      // Use the store's getState method to avoid dependency issues
      const store = useCalendarStore.getState();
      store.initializeSampleData();
    }
  }, [isHydrated, events.length]); // Remove initializeSampleData from deps to prevent infinite loop

  // Navigate to today after hydration (optional, only if needed)
  useEffect(() => {
    if (isHydrated) {
      // Only navigate to today if we want to override the persisted date
      // navigateToToday();
    }
  }, [isHydrated]);

  // Don't render calendar until hydrated to prevent mismatches
  if (!isHydrated) {
    return (
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
        <Typography variant="h6" color="text.secondary">
          Initializing Calendar...
        </Typography>
      </Box>
    );
  }

  // Event handlers
  const handleEventClick = (event: Event) => {
    setEventPopover({
      open: true,
      anchorEl: null,
      event,
      mode: "edit",
      defaultDate: new Date(event.startDate),
    });
  };

  const handleEventEdit = (event: Event) => {
    setEventPopover({
      open: true,
      anchorEl: null,
      event,
      mode: "edit",
      defaultDate: new Date(event.startDate),
    });
  };

  const handleDateClick = (date: Date, mouseEvent?: React.MouseEvent) => {
    const anchorPosition = mouseEvent
      ? {
          top: mouseEvent.clientY,
          left: mouseEvent.clientX,
        }
      : undefined;

    setEventPopover({
      open: true,
      anchorEl: null,
      event: null,
      mode: "create",
      defaultDate: date,
      anchorPosition,
    });
  };

  const handleAddEventClick = (anchorEl: HTMLElement) => {
    const { selectedDate } = useCalendarStore.getState();
    setEventPopover({
      open: true,
      anchorEl,
      event: null,
      mode: "create",
      defaultDate: selectedDate,
    });
  };

  const handlePopoverClose = () => {
    setEventPopover({
      open: false,
      anchorEl: null,
      event: null,
      mode: "create",
    });
  };

  const handleEventSave = (event: Event) => {
    console.log("handleEventSave called with:", event);
    console.log("Popover mode:", eventPopover.mode);

    if (eventPopover.mode === "create") {
      console.log("Adding new event");
      addEvent(event);
    } else if (eventPopover.mode === "edit") {
      console.log("Updating event");
      updateEvent(event.id, event);
    }
    setEventPopover({
      open: false,
      anchorEl: null,
      event: null,
      mode: "create",
    });
  };

  const handleEventDelete = (eventId: string) => {
    deleteEvent(eventId);
    setEventPopover({
      open: false,
      anchorEl: null,
      event: null,
      mode: "create",
    });
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "Day":
        return (
          <DayView
            onEventClick={handleEventClick}
            onEventEdit={handleEventEdit}
            onDateClick={handleDateClick}
          />
        );
      case "Week":
        return (
          <WeekView
            onEventClick={handleEventClick}
            onEventEdit={handleEventEdit}
            onDateClick={handleDateClick}
          />
        );
      case "Month":
        return (
          <MonthView
            onEventClick={handleEventClick}
            onEventEdit={handleEventEdit}
            onDateClick={handleDateClick}
          />
        );
      case "Agenda":
        return (
          <AgendaView
            onEventClick={handleEventClick}
            onEventEdit={handleEventEdit}
            onDateClick={handleDateClick}
          />
        );
      default:
        return (
          <MonthView
            onEventClick={handleEventClick}
            onEventEdit={handleEventEdit}
            onDateClick={handleDateClick}
          />
        );
    }
  };

  return (
    <>
      <Header onAddEvent={handleAddEventClick} />
      {renderCurrentView()}

      <EventPopover
        anchorEl={eventPopover.anchorEl}
        open={eventPopover.open}
        onClose={handlePopoverClose}
        event={eventPopover.event}
        onSave={handleEventSave}
        onDelete={handleEventDelete}
        mode={eventPopover.mode}
        defaultDate={eventPopover.defaultDate}
        anchorPosition={eventPopover.anchorPosition}
      />
    </>
  );
}
