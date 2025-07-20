import {
  useForm,
  UseFormProps,
  UseFormReturn,
  FieldPath,
} from "react-hook-form";
import { useCallback, useEffect, useMemo } from "react";
import type { EventFormData } from "../types/forms";
import { validateDateTimeLogic } from "../utils/dateTimeHelpers";
import moment, { Moment } from "moment-jalaali";

// Specific hook for Event forms
export function useEventForm(defaultValues?: Partial<EventFormData>) {
  const formConfig: UseFormProps<EventFormData> = {
    // Temporarily disable yup validation to resolve type conflicts
    // resolver: yupResolver(EventFormSchema),
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
      // Use the utility function for validation
      const validation = validateDateTimeLogic(
        startDate || moment(),
        endDate || moment(),
        startTime || moment("09:00", "HH:mm"),
        endTime || moment("10:00", "HH:mm"),
        isAllDay || false
      );

      return validation.errors;
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
        // For now, we'll just do basic validation
        // TODO: Implement proper field-specific validation logic
        if (
          field === "title" &&
          (!value || (typeof value === "string" && value.trim() === ""))
        ) {
          form.setError(field, {
            type: "validation",
            message: "عنوان الزامی است",
          });
          return false;
        }

        form.clearErrors(field);
        return true;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "خطا در اعتبارسنجی";
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
