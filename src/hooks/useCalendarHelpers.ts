import { useMemo } from "react";
import { useCalendarStore } from "../stores/calendarStore";
import { useHydratedDate } from "./useHydratedDate";

export const useCalendarHelpers = () => {
  const {
    currentDate: rawCurrentDate,
    events,
    formatTime,
  } = useCalendarStore();

  const { isToday: hydratedIsToday } = useHydratedDate();

  // Ensure currentDate is always a Date object (safeguard against persistence issues)
  const currentDate = useMemo(() => {
    if (rawCurrentDate instanceof Date) {
      return rawCurrentDate;
    }
    // If it's a string (from localStorage), convert it to Date
    if (typeof rawCurrentDate === "string") {
      return new Date(rawCurrentDate);
    }
    // Fallback to current date
    return new Date();
  }, [rawCurrentDate]);

  // Memoized time slots generation
  const timeSlots = useMemo(() => {
    const slots: { hour: number; display: string; time24: string }[] = [];
    for (let hour = 6; hour <= 23; hour++) {
      const time24 = hour;
      const time12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = time12 === 0 ? 12 : time12;

      slots.push({
        hour: time24,
        display: `${displayHour.toString().padStart(2, "0")} ${period}`,
        time24: `${time24.toString().padStart(2, "0")}:00`,
      });
    }
    return slots;
  }, []);

  // Memoized week dates calculation
  const getWeekDates = useMemo(() => {
    return (date: Date) => {
      const week = [];
      const startOfWeek = new Date(date);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day;
      startOfWeek.setDate(diff);

      for (let i = 0; i < 7; i++) {
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + i);
        week.push(currentDay);
      }

      return week;
    };
  }, []);

  // Memoized current week dates
  const currentWeekDates = useMemo(() => {
    return getWeekDates(currentDate);
  }, [currentDate, getWeekDates]);

  // Memoized event position calculation
  const getEventPosition = useMemo(() => {
    return (startTime: string, endTime: string) => {
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;
      const durationMinutes = endTotalMinutes - startTotalMinutes;

      // Calculate position relative to the visible hours (6 AM = 360 minutes from midnight)
      const visibleStartMinutes = 6 * 60; // 6 AM
      const topPosition = ((startTotalMinutes - visibleStartMinutes) / 60) * 80; // 80px per hour
      const height = Math.max((durationMinutes / 60) * 80, 30); // 80px per hour, minimum 30px

      return { top: topPosition, height };
    };
  }, []);

  // Memoized events for specific date
  const getEventsForDate = useMemo(() => {
    return (date: Date) => {
      const dateStr = date.toISOString().split("T")[0];
      return events.filter((event) => {
        // Use startDate as the primary date field, fallback to legacy date field
        const eventDate = event.startDate || event.date;
        return eventDate === dateStr;
      });
    };
  }, [events]);

  // Memoized events for date range
  const getEventsForDateRange = useMemo(() => {
    return (startDate: Date, endDate: Date) => {
      const startStr = startDate.toISOString().split("T")[0];
      const endStr = endDate.toISOString().split("T")[0];
      return events.filter((event) => {
        // Use startDate as the primary date field, fallback to legacy date field
        const eventDate = event.startDate || event.date;
        return eventDate && eventDate >= startStr && eventDate <= endStr;
      });
    };
  }, [events]);

  // Utility functions
  const formatDate = useMemo(() => {
    return (date: Date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };
  }, []);

  const formatDateFull = useMemo(() => {
    return (date: Date) => {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };
  }, []);

  const getDayName = useMemo(() => {
    return (date: Date) => {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    };
  }, []);

  const formatWeekRange = useMemo(() => {
    return (weekDates: Date[]) => {
      const firstDay = weekDates[0];
      const lastDay = weekDates[6];

      if (firstDay.getMonth() === lastDay.getMonth()) {
        return `${firstDay.toLocaleDateString("en-US", {
          month: "long",
        })} ${firstDay.getDate()} - ${lastDay.getDate()}, ${firstDay.getFullYear()}`;
      } else {
        return `${firstDay.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })} - ${lastDay.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}, ${firstDay.getFullYear()}`;
      }
    };
  }, []);

  // Check if a date is today (hydration-safe)
  const isToday = hydratedIsToday;

  // Get events count for a specific date
  const getEventCountForDate = useMemo(() => {
    return (date: Date) => {
      return getEventsForDate(date).length;
    };
  }, [getEventsForDate]);

  // Get events count for current week
  const currentWeekEventsCount = useMemo(() => {
    const weekEvents = getEventsForDateRange(
      currentWeekDates[0],
      currentWeekDates[6]
    );
    return weekEvents.length;
  }, [currentWeekDates, getEventsForDateRange]);

  // Get events count for current month
  const currentMonthEventsCount = useMemo(() => {
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
    const monthEvents = getEventsForDateRange(firstDayOfMonth, lastDayOfMonth);
    return monthEvents.length;
  }, [currentDate, getEventsForDateRange]);

  return {
    // Time slots
    timeSlots,

    // Date calculations
    getWeekDates,
    currentWeekDates,

    // Event positioning
    getEventPosition,

    // Event filtering
    getEventsForDate,
    getEventsForDateRange,

    // Formatting
    formatDate,
    formatDateFull,
    formatTime,
    getDayName,
    formatWeekRange,

    // Utility
    isToday,
    getEventCountForDate,
    currentWeekEventsCount,
    currentMonthEventsCount,
  };
};
