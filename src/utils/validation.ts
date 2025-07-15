import { ValidationError, Schema } from "yup";
import {
  PersonSchema,
  AttendeeSchema,
  ReminderSchema,
  CommentSchema,
  EventSchema,
  Person,
  EventAttendee,
  Reminder,
  Comment,
  Event,
} from "../stores/calendarStore";

// Validation result type
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

// Generic validation function
async function validateSchema<T>(
  schema: Schema<T>,
  data: unknown
): Promise<ValidationResult<T>> {
  try {
    const validatedData = await schema.validate(data, { abortEarly: false });
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        success: false,
        errors: error.errors,
      };
    }
    return {
      success: false,
      errors: ["Unknown validation error"],
    };
  }
}

// Synchronous validation function
function validateSchemaSync<T>(
  schema: Schema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validatedData = schema.validateSync(data, { abortEarly: false });
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        success: false,
        errors: error.errors,
      };
    }
    return {
      success: false,
      errors: ["Unknown validation error"],
    };
  }
}

// Specific validation functions
export const validatePerson = async (
  data: unknown
): Promise<ValidationResult<Person>> => {
  return validateSchema<Person>(PersonSchema, data);
};

export const validatePersonSync = (data: unknown): ValidationResult<Person> => {
  return validateSchemaSync<Person>(PersonSchema, data);
};

export const validateAttendee = async (
  data: unknown
): Promise<ValidationResult<EventAttendee>> => {
  return validateSchema<EventAttendee>(AttendeeSchema, data);
};

export const validateAttendeeSync = (
  data: unknown
): ValidationResult<EventAttendee> => {
  return validateSchemaSync<EventAttendee>(AttendeeSchema, data);
};

export const validateReminder = async (
  data: unknown
): Promise<ValidationResult<Reminder>> => {
  return validateSchema<Reminder>(ReminderSchema, data);
};

export const validateReminderSync = (
  data: unknown
): ValidationResult<Reminder> => {
  return validateSchemaSync<Reminder>(ReminderSchema, data);
};

export const validateComment = async (
  data: unknown
): Promise<ValidationResult<Comment>> => {
  return validateSchema<Comment>(CommentSchema, data);
};

export const validateCommentSync = (
  data: unknown
): ValidationResult<Comment> => {
  return validateSchemaSync<Comment>(CommentSchema, data);
};

export const validateEvent = async (
  data: unknown
): Promise<ValidationResult<Event>> => {
  return validateSchema<Event>(EventSchema, data);
};

export const validateEventSync = (data: unknown): ValidationResult<Event> => {
  return validateSchemaSync<Event>(EventSchema, data);
};

// Helper functions for form validation
export const getFieldError = (
  errors: string[],
  field: string
): string | undefined => {
  return errors.find((error) =>
    error.toLowerCase().includes(field.toLowerCase())
  );
};

export const formatValidationErrors = (
  errors: string[]
): Record<string, string> => {
  const errorMap: Record<string, string> = {};

  errors.forEach((error) => {
    // Extract field name from error message
    const matches = error.match(/^(\w+)/);
    if (matches) {
      const field = matches[1];
      errorMap[field] = error;
    } else {
      errorMap.general = error;
    }
  });

  return errorMap;
};

// Validation middleware for forms
export const createFormValidator = <T>(schema: Schema<T>) => {
  return (data: unknown): ValidationResult<T> => {
    return validateSchemaSync<T>(schema, data);
  };
};

// Export schemas for external use
export {
  PersonSchema,
  AttendeeSchema,
  ReminderSchema,
  CommentSchema,
  EventSchema,
};
