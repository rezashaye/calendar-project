import type { Reminder, EventAttendee, Person } from "../stores/calendarStore";
import type { Moment } from "moment";

// Form data types that match our Yup schemas exactly
export interface EventFormData {
  id?: string;
  title: string;
  description?: string;
  startDate: string | Moment;
  endDate: string | Moment;
  startTime: string | Moment;
  endTime: string | Moment;
  color: string;
  categoryId?: string;
  isAllDay?: boolean;
  location?: string;
  reminders: Reminder[];
  attendees: EventAttendee[];
  comments: Array<{
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  // Legacy support
  date?: string;
  attendee?: string;
}

export interface ReminderFormData extends Omit<Reminder, "id"> {
  id?: string;
}

export interface AttendeeFormData {
  personId: string;
  role: EventAttendee["role"];
  permissions: EventAttendee["permissions"];
}

export interface PersonFormData extends Omit<Person, "id"> {
  id?: string;
}

// Form field error types
export interface FieldError {
  type: string;
  message: string;
}

// Form validation modes
export type ValidationMode =
  | "onSubmit"
  | "onBlur"
  | "onChange"
  | "onTouched"
  | "all";

// Form configuration options
export interface FormConfig {
  mode?: ValidationMode;
  reValidateMode?: ValidationMode;
  shouldFocusError?: boolean;
  delayError?: number;
}

// Common form state interface
export interface FormState<T> {
  data: T;
  errors: Record<string, FieldError>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  touchedFields: Record<string, boolean>;
}

// Form action types
export type FormAction<T> =
  | { type: "SET_DATA"; payload: Partial<T> }
  | { type: "SET_FIELD"; payload: { field: keyof T; value: unknown } }
  | { type: "SET_ERROR"; payload: { field: string; error: FieldError } }
  | { type: "CLEAR_ERROR"; payload: { field: string } }
  | { type: "SET_ERRORS"; payload: Record<string, FieldError> }
  | { type: "CLEAR_ERRORS" }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "SET_TOUCHED"; payload: { field: string; touched: boolean } }
  | { type: "RESET_FORM"; payload?: Partial<T> };
