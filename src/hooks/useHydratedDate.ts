import { useState, useEffect } from "react";

// Hook to safely handle Date operations that should only run on client-side
export const useHydratedDate = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    setIsHydrated(true);
    setCurrentDate(new Date());
  }, []);

  // Safe isToday function that only works after hydration
  const isToday = (date: Date): boolean => {
    if (!isHydrated || !currentDate) {
      return false; // During SSR, no date is "today"
    }
    return date.toDateString() === currentDate.toDateString();
  };

  // Safe getCurrentDate function
  const getCurrentDate = (): Date => {
    return currentDate || new Date();
  };

  // Safe date formatting function
  const formatSafeDate = (date: Date, formatter: (date: Date) => string) => {
    if (!isHydrated) {
      return "";
    }
    return formatter(date);
  };

  // Get a safe date for SSR consistency
  const getSafeDate = () => {
    if (!isHydrated) {
      // Return a fixed date for SSR to prevent hydration mismatches
      return new Date("2024-01-01T00:00:00.000Z");
    }
    return new Date();
  };

  return {
    isHydrated,
    isToday,
    getCurrentDate,
    formatSafeDate,
    getSafeDate,
  };
};
