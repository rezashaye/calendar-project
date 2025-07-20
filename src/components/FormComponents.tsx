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
  IconButton,
  Typography,
} from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";
import { Delete as DeleteIcon } from "@mui/icons-material";
import type { EventFormData } from "../types/forms";
import type {
  Reminder,
  EventAttendee,
  Category,
} from "../stores/calendarStore";
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
          value={field.value ?? ""}
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
          <Select {...field} value={field.value ?? ""} {...props} label={label}>
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
          control={
            <Switch {...field} checked={field.value ?? false} {...props} />
          }
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
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {colors.map((color) => (
            <Box
              key={color.value}
              sx={{
                position: "relative",
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: color.value,
                cursor: "pointer",
                border: "3px solid transparent",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "scale(1.1)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                },
                ...(field.value === color.value && {
                  border: "3px solid #fff",
                  boxShadow: `0 0 0 2px ${color.value}, 0 4px 12px rgba(0,0,0,0.2)`,
                  transform: "scale(1.05)",
                }),
              }}
              onClick={() => field.onChange(color.value)}
              title={color.name}
            >
              {field.value === color.value && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 16,
                    height: 16,
                    backgroundColor: "rgba(255,255,255,0.9)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: "bold",
                    color: color.value,
                  }}
                >
                  ✓
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}
    />
  );
}

// Category Picker Component
interface CategoryPickerProps {
  control: Control<EventFormData>;
  name: FieldPath<EventFormData>;
  categories: Category[];
}

export function ControlledCategoryPicker({
  control,
  name,
  categories,
}: CategoryPickerProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Box>
          <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 500 }}>
            دسته‌بندی
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Box
              sx={{
                position: "relative",
                minWidth: 100,
                height: 50,
                borderRadius: 2,
                border: "2px dashed",
                borderColor: !field.value ? "primary.main" : "grey.300",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                backgroundColor: !field.value
                  ? "rgba(25, 118, 210, 0.05)"
                  : "transparent",
                "&:hover": {
                  borderColor: "primary.main",
                  backgroundColor: "rgba(25, 118, 210, 0.05)",
                },
              }}
              onClick={() => field.onChange(undefined)}
              title="بدون دسته‌بندی"
            >
              <Typography variant="caption" color="text.secondary">
                بدون دسته
              </Typography>
            </Box>
            {categories.map((category) => (
              <Box
                key={category.id}
                sx={{
                  position: "relative",
                  minWidth: 100,
                  height: 50,
                  borderRadius: 2,
                  cursor: "pointer",
                  border: "2px solid transparent",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.5,
                  backgroundColor: "background.paper",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    borderColor: category.color,
                  },
                  ...(field.value === category.id && {
                    borderColor: category.color,
                    backgroundColor: `${category.color}15`,
                    transform: "scale(1.02)",
                    boxShadow: `0 0 0 2px ${category.color}40, 0 4px 12px rgba(0,0,0,0.15)`,
                  }),
                }}
                onClick={() => field.onChange(category.id)}
                title={category.description}
              >
                <Box sx={{ fontSize: 18, color: category.color }}>
                  {category.icon}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    textAlign: "center",
                    fontWeight: field.value === category.id ? 600 : 400,
                    color:
                      field.value === category.id
                        ? category.color
                        : "text.secondary",
                  }}
                >
                  {category.name}
                </Typography>
                {field.value === category.id && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      width: 16,
                      height: 16,
                      backgroundColor: category.color,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: "bold",
                      color: "white",
                    }}
                  >
                    ✓
                  </Box>
                )}
              </Box>
            ))}
          </Box>
          {fieldState.error && (
            <Typography
              variant="caption"
              color="error"
              sx={{ mt: 0.5, display: "block" }}
            >
              {fieldState.error.message}
            </Typography>
          )}
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

  const getReminderTypeLabel = (type: string) => {
    switch (type) {
      case "notification":
        return "اعلان";
      case "email":
        return "ایمیل";
      case "sms":
        return "پیامک";
      default:
        return type;
    }
  };

  if (reminders.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 3,
          color: "text.secondary",
          fontStyle: "italic",
        }}
      >
        هیچ یادآوری‌ای تنظیم نشده است
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      {reminders.map((reminder) => (
        <Box
          key={reminder.id}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 1.5,
            mb: 1,
            borderRadius: 2,
            border: "1px solid",
            borderColor: reminder.isEnabled ? "primary.light" : "grey.300",
            backgroundColor: reminder.isEnabled
              ? "rgba(25, 118, 210, 0.05)"
              : "rgba(0, 0, 0, 0.02)",
            transition: "all 0.2s ease",
            cursor: "pointer",
            "&:hover": {
              backgroundColor: reminder.isEnabled
                ? "rgba(25, 118, 210, 0.1)"
                : "rgba(0, 0, 0, 0.04)",
            },
          }}
          onClick={() => onToggle(reminder.id)}
        >
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: reminder.isEnabled
                  ? "primary.main"
                  : "grey.400",
                mr: 1,
              }}
            />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {formatReminderTime(reminder.timeBeforeEvent)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {getReminderTypeLabel(reminder.type)}
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(reminder.id);
            }}
            sx={{
              color: "error.main",
              "&:hover": { backgroundColor: "error.lighter" },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
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
  if (attendees.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 3,
          color: "text.secondary",
          fontStyle: "italic",
        }}
      >
        هیچ شرکت‌کننده‌ای اضافه نشده است
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      {attendees.map((attendee) => (
        <Box
          key={attendee.id}
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 1,
            p: 2,
            border: "1px solid",
            borderColor: "grey.200",
            borderRadius: 2,
            gap: 1.5,
            backgroundColor: "background.paper",
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: "primary.light",
              backgroundColor: "rgba(25, 118, 210, 0.02)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
            {attendee.person.avatar ? (
              <Box
                component="img"
                src={attendee.person.avatar}
                alt={attendee.person.name}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  mr: 1.5,
                  border: "2px solid",
                  borderColor: "grey.200",
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  mr: 1.5,
                  backgroundColor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "0.875rem",
                }}
              >
                {attendee.person.name.charAt(0)}
              </Box>
            )}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {attendee.person.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {attendee.person.email}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <FormControl size="small" sx={{ minWidth: 90 }}>
              <Select
                value={attendee.role}
                onChange={(e) =>
                  onUpdateRole(
                    attendee.id,
                    e.target.value as EventAttendee["role"]
                  )
                }
                variant="outlined"
                displayEmpty
                sx={{
                  "& .MuiSelect-select": {
                    fontSize: "0.75rem",
                    py: 0.5,
                  },
                }}
              >
                <MenuItem value="organizer">برگزارکننده</MenuItem>
                <MenuItem value="required">اجباری</MenuItem>
                <MenuItem value="optional">اختیاری</MenuItem>
                <MenuItem value="informational">اطلاعی</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 70 }}>
              <Select
                value={attendee.permissions}
                onChange={(e) =>
                  onUpdatePermissions(
                    attendee.id,
                    e.target.value as EventAttendee["permissions"]
                  )
                }
                variant="outlined"
                displayEmpty
                sx={{
                  "& .MuiSelect-select": {
                    fontSize: "0.75rem",
                    py: 0.5,
                  },
                }}
              >
                <MenuItem value="view">مشاهده</MenuItem>
                <MenuItem value="edit">ویرایش</MenuItem>
                <MenuItem value="full">کامل</MenuItem>
              </Select>
            </FormControl>

            <IconButton
              size="small"
              onClick={() => onRemove(attendee.id)}
              sx={{
                color: "error.main",
                "&:hover": { backgroundColor: "error.lighter" },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
