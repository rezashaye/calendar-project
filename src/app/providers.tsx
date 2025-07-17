"use client";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { ThemeProvider } from "../context/ThemeContext";
import { ColorThemeProvider } from "../context/ColorThemeContext";
import { useHydrationSafeHTML } from "../hooks/useHydrationSafeHTML";
import { useEffect, useState } from "react";
import moment from "moment-jalaali";

// Configure moment-jalaali for Persian calendar
moment.loadPersian({
  dialect: "persian-modern",
  usePersianDigits: true,
});

// Set the locale to Persian with complete configuration
moment.locale("fa", {
  jMonths: [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ],
  jMonthsShort: [
    "فرو",
    "ارد",
    "خرد",
    "تیر",
    "مرد",
    "شهر",
    "مهر",
    "آبا",
    "آذر",
    "دی",
    "بهم",
    "اسف",
  ],
  weekdays: [
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنج‌شنبه",
    "جمعه",
    "شنبه",
  ],
  weekdaysShort: ["یک", "دو", "سه", "چهار", "پنج", "جمعه", "شنبه"],
  weekdaysMin: ["ی", "د", "س", "چ", "پ", "ج", "ش"],
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  // Handle dynamic HTML attributes that might cause hydration issues
  useHydrationSafeHTML();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state during hydration to prevent mismatch
  if (!isClient) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="fa">
      <ColorThemeProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </ColorThemeProvider>
    </LocalizationProvider>
  );
}
