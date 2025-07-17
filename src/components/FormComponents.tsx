import React from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  FormHelperText,
  Box,
  Chip,
  IconButton,
} from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";
import { Delete as DeleteIcon } from "@mui/icons-material";
import type { EventFormData } from "../types/forms";
import type { Reminder, EventAttendee } from "../stores/calendarStore";
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

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  error?: boolean;
  helperText?: string;
}

// Controlled TextField component
export function ControlledTextField<T extends FieldValues>({
  control,
  name,
  label,
  error,
  helperText,
  ...props
}: FormFieldProps<T> & React.ComponentProps<typeof TextField>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          {...props}
          label={label}
          error={error || !!fieldState.error}
          helperText={helperText || fieldState.error?.message}
          fullWidth
          size="small"
        />
      )}
    />
  );
}

// Controlled Select component
export function ControlledSelect<T extends FieldValues>({
  control,
  name,
  label,
  error,
  helperText,
  children,
  ...props
}: FormFieldProps<T> & {
  children: React.ReactNode;
} & React.ComponentProps<typeof Select>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormControl fullWidth size="small" error={error || !!fieldState.error}>
          <InputLabel>{label}</InputLabel>
          <Select {...field} {...props} label={label}>
            {children}
          </Select>
          {(helperText || fieldState.error?.message) && (
            <FormHelperText>
              {helperText || fieldState.error?.message}
            </FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
}

// Controlled Switch component
export function ControlledSwitch<T extends FieldValues>({
  control,
  name,
  label,
  ...props
}: FormFieldProps<T> & React.ComponentProps<typeof Switch>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          control={<Switch {...field} checked={field.value} {...props} />}
          label={label}
        />
      )}
    />
  );
}

// Controlled DatePicker component
export function ControlledDatePicker<T extends FieldValues>({
  control,
  name,
  label,
  error,
  helperText,
  ...props
}: FormFieldProps<T> & React.ComponentProps<typeof DatePicker>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <DatePicker
          {...props}
          label={label}
          value={field.value ? field.value : null}
          onChange={(date) => field.onChange(date)}
          format="YYYY/MM/DD"
          views={["year", "month", "day"]}
          slotProps={{
            textField: {
              size: "small",
              fullWidth: true,
              error: error || !!fieldState.error,
              helperText: helperText || fieldState.error?.message,
              InputProps: {
                placeholder: "۱۴۰۴/۰۴/۲۶",
              },
            },
          }}
          // Force Persian calendar by setting the adapter locale
          localeText={{
            fieldDayPlaceholder: () => "روز",
            fieldMonthPlaceholder: () => "ماه",
            fieldYearPlaceholder: () => "سال",
          }}
        />
      )}
    />
  );
}

// Controlled TimePicker component
export function ControlledTimePicker<T extends FieldValues>({
  control,
  name,
  label,
  error,
  helperText,
  ...props
}: FormFieldProps<T> & React.ComponentProps<typeof TimePicker>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TimePicker
          {...props}
          label={label}
          value={field.value ? field.value : null}
          onChange={(time) => field.onChange(time)}
          slotProps={{
            textField: {
              size: "small",
              fullWidth: true,
              error: error || !!fieldState.error,
              helperText: helperText || fieldState.error?.message,
            },
          }}
        />
      )}
    />
  );
}

// Color Picker Component
interface ColorPickerProps {
  control: Control<EventFormData>;
  name: FieldPath<EventFormData>;
  colors: Array<{ name: string; value: string }>;
}

export function ControlledColorPicker({
  control,
  name,
  colors,
}: ColorPickerProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {colors.map((color) => (
            <Box
              key={color.value}
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: color.value,
                cursor: "pointer",
                border: field.value === color.value ? "3px solid" : "2px solid",
                borderColor:
                  field.value === color.value ? "primary.main" : "grey.300",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "scale(1.1)",
                },
              }}
              onClick={() => field.onChange(color.value)}
              title={color.name}
            />
          ))}
        </Box>
      )}
    />
  );
}

// Reminder List Component
interface ReminderListProps {
  reminders: Reminder[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function ReminderList({
  reminders,
  onToggle,
  onRemove,
}: ReminderListProps) {
  const formatReminderTime = (minutes: number) => {
    if (minutes === 0) return "هنگام شروع رویداد";
    if (minutes < 60) return `${minutes} دقیقه قبل`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} ساعت قبل`;
    return `${Math.floor(minutes / 1440)} روز قبل`;
  };

  if (reminders.length === 0) return null;

  return (
    <Box sx={{ mb: 2 }}>
      {reminders.map((reminder) => (
        <Chip
          key={reminder.id}
          label={`${formatReminderTime(reminder.timeBeforeEvent)} (${
            reminder.type
          })`}
          onDelete={() => onRemove(reminder.id)}
          color={reminder.isEnabled ? "primary" : "default"}
          sx={{ mr: 1, mb: 1 }}
          onClick={() => onToggle(reminder.id)}
        />
      ))}
    </Box>
  );
}

// Attendee List Component
interface AttendeeListProps {
  attendees: EventAttendee[];
  onUpdateRole: (id: string, role: EventAttendee["role"]) => void;
  onUpdatePermissions: (
    id: string,
    permissions: EventAttendee["permissions"]
  ) => void;
  onRemove: (id: string) => void;
}

export function AttendeeList({
  attendees,
  onUpdateRole,
  onUpdatePermissions,
  onRemove,
}: AttendeeListProps) {
  if (attendees.length === 0) return null;

  return (
    <Box sx={{ mb: 2 }}>
      {attendees.map((attendee) => (
        <Box
          key={attendee.id}
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 1,
            p: 1,
            border: "1px solid",
            borderColor: "grey.300",
            borderRadius: 1,
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
            {attendee.person.avatar && (
              <Box
                component="img"
                src={attendee.person.avatar}
                alt={attendee.person.name}
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  mr: 1,
                }}
              />
            )}
            <Box>
              <Box sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
                {attendee.person.name}
              </Box>
              <Box sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                {attendee.person.email}
              </Box>
            </Box>
          </Box>

          <FormControl size="small" sx={{ minWidth: 80 }}>
            <Select
              value={attendee.role}
              onChange={(e) =>
                onUpdateRole(
                  attendee.id,
                  e.target.value as EventAttendee["role"]
                )
              }
              variant="outlined"
            >
              <MenuItem value="organizer">برگزارکننده</MenuItem>
              <MenuItem value="required">اجباری</MenuItem>
              <MenuItem value="optional">اختیاری</MenuItem>
              <MenuItem value="informational">اطلاعی</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 60 }}>
            <Select
              value={attendee.permissions}
              onChange={(e) =>
                onUpdatePermissions(
                  attendee.id,
                  e.target.value as EventAttendee["permissions"]
                )
              }
              variant="outlined"
            >
              <MenuItem value="view">مشاهده</MenuItem>
              <MenuItem value="edit">ویرایش</MenuItem>
              <MenuItem value="full">کامل</MenuItem>
            </Select>
          </FormControl>

          <IconButton
            size="small"
            onClick={() => onRemove(attendee.id)}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
}
