import moment, { Moment } from "moment-jalaali";

/**
 * Utility functions for handling date/time conversions and validations
 * Specifically designed for Persian calendar integration
 */

// Configure moment-jalaali
moment.loadPersian({
  usePersianDigits: true,
  dialect: "persian-modern",
});

export interface DateTimeFormats {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

/**
 * Convert moment objects or mixed values to standardized string formats
 * for storage and API communication
 */
export function convertToStorageFormat(
  data: Record<string, unknown>
): DateTimeFormats {
  const convertDate = (
    value: string | Moment | Date | undefined | null
  ): string => {
    if (!value) return moment().format("YYYY-MM-DD");

    if (moment.isMoment(value)) {
      return value.format("YYYY-MM-DD");
    }

    if (value instanceof Date) {
      return moment(value).format("YYYY-MM-DD");
    }

    if (typeof value === "string") {
      // Try to parse various date formats
      let parsedMoment;

      // Try Jalali format first (jYYYY/jMM/jDD)
      if (value.includes("/")) {
        parsedMoment = moment(value, "jYYYY/jMM/jDD");
      } else {
        // Try standard formats
        parsedMoment = moment(value);
      }

      if (parsedMoment.isValid()) {
        return parsedMoment.format("YYYY-MM-DD");
      }
    }

    // Fallback to current date
    return moment().format("YYYY-MM-DD");
  };

  const convertTime = (
    value: string | Moment | Date | undefined | null
  ): string => {
    if (!value) return "09:00";

    if (moment.isMoment(value)) {
      return value.format("HH:mm");
    }

    if (value instanceof Date) {
      return moment(value).format("HH:mm");
    }

    if (typeof value === "string") {
      // If already in HH:mm format, return as is
      if (/^\d{2}:\d{2}$/.test(value)) {
        return value;
      }

      // Try to parse time string
      const parsedMoment = moment(value, "HH:mm");
      if (parsedMoment.isValid()) {
        return parsedMoment.format("HH:mm");
      }
    }

    // Fallback to 09:00
    return "09:00";
  };

  return {
    startDate: convertDate(
      data.startDate as string | Moment | Date | undefined
    ),
    endDate: convertDate(data.endDate as string | Moment | Date | undefined),
    startTime: convertTime(
      data.startTime as string | Moment | Date | undefined
    ),
    endTime: convertTime(data.endTime as string | Moment | Date | undefined),
  };
}

/**
 * Convert string values to moment objects for form usage
 */
export function convertToFormFormat(data: Record<string, unknown>) {
  const convertDate = (value: string | undefined | null): Moment => {
    if (!value) return moment();

    // Try to parse as standard date
    const parsedMoment = moment(value);
    if (parsedMoment.isValid()) {
      return parsedMoment;
    }

    // Fallback to current date
    return moment();
  };

  const convertTime = (value: string | undefined | null): Moment => {
    if (!value) return moment("09:00", "HH:mm");

    // Parse time string
    const parsedMoment = moment(value, "HH:mm");
    if (parsedMoment.isValid()) {
      return parsedMoment;
    }

    // Fallback to 09:00
    return moment("09:00", "HH:mm");
  };

  return {
    ...data,
    startDate: convertDate(data.startDate as string | undefined),
    endDate: convertDate(data.endDate as string | undefined),
    startTime: convertTime(data.startTime as string | undefined),
    endTime: convertTime(data.endTime as string | undefined),
  };
}

/**
 * Validate that date/time values are in correct format and logical order
 */
export function validateDateTimeLogic(
  startDate: string | Moment,
  endDate: string | Moment,
  startTime: string | Moment,
  endTime: string | Moment,
  isAllDay: boolean = false
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  try {
    // Convert to moment objects for comparison
    const startMoment = moment.isMoment(startDate)
      ? startDate
      : moment(startDate);
    const endMoment = moment.isMoment(endDate) ? endDate : moment(endDate);

    if (!startMoment.isValid()) {
      errors.startDate = "تاریخ شروع معتبر نیست";
    }

    if (!endMoment.isValid()) {
      errors.endDate = "تاریخ پایان معتبر نیست";
    }

    // If dates are valid, check logical order
    if (startMoment.isValid() && endMoment.isValid()) {
      if (!isAllDay) {
        // For timed events, check both date and time
        const startTimeMoment = moment.isMoment(startTime)
          ? startTime
          : moment(startTime, "HH:mm");
        const endTimeMoment = moment.isMoment(endTime)
          ? endTime
          : moment(endTime, "HH:mm");

        if (!startTimeMoment.isValid()) {
          errors.startTime = "زمان شروع معتبر نیست";
        }

        if (!endTimeMoment.isValid()) {
          errors.endTime = "زمان پایان معتبر نیست";
        }

        // Create full datetime for comparison
        if (startTimeMoment.isValid() && endTimeMoment.isValid()) {
          const startDateTime = startMoment
            .clone()
            .hour(startTimeMoment.hour())
            .minute(startTimeMoment.minute());
          const endDateTime = endMoment
            .clone()
            .hour(endTimeMoment.hour())
            .minute(endTimeMoment.minute());

          if (startDateTime.isSameOrAfter(endDateTime)) {
            if (startMoment.isSame(endMoment, "day")) {
              errors.endTime = "زمان پایان باید بعد از زمان شروع باشد";
            } else {
              errors.endDate = "تاریخ و زمان پایان باید بعد از شروع باشد";
            }
          }
        }
      } else {
        // For all-day events, just check dates
        if (startMoment.isAfter(endMoment)) {
          errors.endDate = "تاریخ پایان باید بعد از تاریخ شروع باشد";
        }
      }
    }
  } catch (error) {
    console.error("Error validating date/time logic:", error);
    errors.general = "خطا در اعتبارسنجی تاریخ و زمان";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Format moment object for display in Persian
 */
export function formatPersianDate(date: Moment | string | Date): string {
  const momentObj = moment.isMoment(date) ? date : moment(date);
  if (!momentObj.isValid()) return "";

  return momentObj.format("jYYYY/jMM/jDD");
}

/**
 * Format time for display
 */
export function formatPersianTime(time: Moment | string): string {
  const momentObj = moment.isMoment(time) ? time : moment(time, "HH:mm");
  if (!momentObj.isValid()) return "";

  return momentObj.format("HH:mm");
}
