import {
  useForm,
  UseFormProps,
  UseFormReturn,
  FieldPath,
  Resolver,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useEffect, useMemo } from "react";
import type { EventFormData } from "../types/forms";
import { EventFormSchema } from "../stores/calendarStore";
import moment, { Moment } from "moment-jalaali";

// Specific hook for Event forms
export function useEventForm(defaultValues?: Partial<EventFormData>) {
  const formConfig: UseFormProps<EventFormData> = {
    resolver: yupResolver(EventFormSchema) as Resolver<EventFormData>,
    defaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldFocusError: true,
  };

  const form = useForm<EventFormData>(formConfig);

  // Custom validation for event-specific logic
  const validateEventTimes = useCallback(
    (
      startDate?: string | Moment,
      endDate?: string | Moment,
      startTime?: string | Moment,
      endTime?: string | Moment,
      isAllDay?: boolean
    ) => {
      const errors: Record<string, string> = {};

      // Helper function to parse date/time values
      const parseDateTime = (
        dateValue: string | Moment | undefined,
        timeValue: string | Moment | undefined
      ) => {
        if (!dateValue) return null;

        let dateMoment: Moment;

        // If it's already a moment object, use it directly
        if (moment.isMoment(dateValue)) {
          dateMoment = dateValue.clone();
        } else {
          // If it's a string, try to parse it as Jalali date
          if (typeof dateValue === "string") {
            // Try parsing as Jalali format first
            if (dateValue.includes("/")) {
              dateMoment = moment(dateValue, "jYYYY/jMM/jDD");
            } else {
              dateMoment = moment(dateValue);
            }
          } else {
            // Handle other types as fallback
            dateMoment = moment(dateValue);
          }
        }

        // Add time if provided
        if (timeValue) {
          if (moment.isMoment(timeValue)) {
            dateMoment.hour(timeValue.hour());
            dateMoment.minute(timeValue.minute());
            dateMoment.second(0);
          } else if (typeof timeValue === "string") {
            const timeParts = timeValue.split(":");
            if (timeParts.length >= 2) {
              dateMoment.hour(parseInt(timeParts[0]));
              dateMoment.minute(parseInt(timeParts[1]));
              dateMoment.second(0);
            }
          }
        }

        return dateMoment;
      };

      // Parse start and end date/time
      const startDateTime = parseDateTime(
        startDate,
        isAllDay ? undefined : startTime
      );
      const endDateTime = parseDateTime(
        endDate,
        isAllDay ? undefined : endTime
      );

      // Validate date range
      if (startDateTime && endDateTime) {
        // For same date, check time logic first (only if not all day)
        if (!isAllDay && startDateTime.isSame(endDateTime, "day")) {
          if (startDateTime.isSameOrAfter(endDateTime)) {
            errors.endTime = "زمان پایان باید بعد از زمان شروع باشد";
          }
        } else if (!isAllDay || !startDateTime.isSame(endDateTime, "day")) {
          // For different dates, or non-all-day events, check date order
          if (startDateTime.isAfter(endDateTime)) {
            errors.endDate = "تاریخ پایان باید بعد از تاریخ شروع باشد";
          }
        }
      }

      return errors;
    },
    []
  );

  // Watch for changes to validate time logic
  const watchedValues = form.watch([
    "startDate",
    "endDate",
    "startTime",
    "endTime",
    "isAllDay",
  ]);
  const [startDate, endDate, startTime, endTime, isAllDay] = watchedValues;

  // Instead of useEffect with form dependencies, use React Hook Form's built-in validation
  // This approach prevents infinite loops by not depending on form object references
  useEffect(() => {
    // Only validate if we have actual values to validate
    if (!startDate || !endDate || !startTime || !endTime) return;

    const timeErrors = validateEventTimes(
      startDate,
      endDate,
      startTime,
      endTime,
      isAllDay
    );

    // Use setTimeout to avoid infinite loops during render cycles
    const validationTimeout = setTimeout(() => {
      // Clear previous time-related errors
      form.clearErrors(["endTime", "endDate"]);

      // Set new errors if any
      Object.entries(timeErrors).forEach(([field, message]) => {
        form.setError(field as FieldPath<EventFormData>, {
          type: "custom",
          message,
        });
      });
    }, 0);

    return () => clearTimeout(validationTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, startTime, endTime, isAllDay]); // form and validateEventTimes excluded to prevent infinite loops

  // Validate a specific field
  const validateField = useCallback(
    async (
      field: FieldPath<EventFormData>,
      value: unknown
    ): Promise<boolean> => {
      try {
        await EventFormSchema.validateAt(field, { [field]: value });
        form.clearErrors(field);
        return true;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Validation error";
        form.setError(field, {
          type: "validation",
          message: errorMessage,
        });
        return false;
      }
    },
    [form]
  );

  // Clear field error helper
  const clearFieldError = useCallback(
    (field: FieldPath<EventFormData>) => {
      form.clearErrors(field);
    },
    [form]
  );

  // Set field error helper
  const setFieldError = useCallback(
    (field: FieldPath<EventFormData>, error: string) => {
      form.setError(field, {
        type: "manual",
        message: error,
      });
    },
    [form]
  );

  return {
    ...form,
    validateEventTimes,
    validateField,
    clearFieldError,
    setFieldError,
  };
}

// Hook for managing dynamic arrays (reminders, attendees)
export function useEventFieldArray<T>(
  form: UseFormReturn<EventFormData>,
  name: FieldPath<EventFormData>,
  defaultItem: () => T
) {
  const watchedItems = form.watch(name);
  const items = useMemo(
    () => (Array.isArray(watchedItems) ? watchedItems : []),
    [watchedItems]
  );

  const append = useCallback(
    (item?: Partial<T>) => {
      const newItem = item ? { ...defaultItem(), ...item } : defaultItem();
      form.setValue(name, [
        ...items,
        newItem,
      ] as unknown as EventFormData[keyof EventFormData]);
    },
    [form, name, items, defaultItem]
  );

  const remove = useCallback(
    (index: number) => {
      const newItems = items.filter((_, i: number) => i !== index);
      form.setValue(
        name,
        newItems as unknown as EventFormData[keyof EventFormData]
      );
    },
    [form, name, items]
  );

  const update = useCallback(
    (index: number, updatedItem: Partial<T>) => {
      const newItems = items.map((item, i: number) =>
        i === index ? { ...item, ...updatedItem } : item
      );
      form.setValue(
        name,
        newItems as unknown as EventFormData[keyof EventFormData]
      );
    },
    [form, name, items]
  );

  const clear = useCallback(() => {
    form.setValue(name, [] as unknown as EventFormData[keyof EventFormData]);
  }, [form, name]);

  return {
    items: items as T[],
    append,
    remove,
    update,
    clear,
  };
}
