"use client";

import React, { useState, useEffect } from "react";
import {
  Popover,
  Card,
  CardContent,
  Button,
  Typography,
  Box,
  IconButton,
  Stack,
  useTheme,
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  ColorLens as ColorLensIcon,
  NotificationsActive as NotificationsIcon,
  Add as AddIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment-jalaali";

// Configure moment-jalaali for Persian calendar
moment.loadPersian({
  usePersianDigits: true,
  dialect: "persian-modern",
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
import {
  Event,
  Reminder,
  EventAttendee,
  Person,
  Comment,
} from "../stores/calendarStore";
import {
  generateEventId,
  generateReminderId,
  generateAttendeeId,
  generateCommentId,
} from "../utils/idGenerator";
import { companyMembers } from "../mocks/companyMembers";
import { useEventForm, useEventFieldArray } from "../hooks/useFormValidation";
import {
  ControlledTextField,
  ControlledSwitch,
  ControlledDatePicker,
  ControlledTimePicker,
  ControlledColorPicker,
  ReminderList,
  AttendeeList,
} from "./FormComponents";
import CommentsSection from "./CommentsSection";
import type { EventFormData } from "../types/forms";

interface EventPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  event?: Event | null;
  onSave: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  mode: "create" | "edit";
  defaultDate?: Date;
  anchorPosition?: { top: number; left: number };
}

const eventColors = [
  { name: "آبی", value: "#2196f3" },
  { name: "سبز", value: "#4caf50" },
  { name: "قرمز", value: "#f44336" },
  { name: "بنفش", value: "#9c27b0" },
  { name: "نارنجی", value: "#ff9800" },
  { name: "سبز دریایی", value: "#009688" },
  { name: "صورتی", value: "#e91e63" },
  { name: "نیلی", value: "#3f51b5" },
];

const reminderTimeOptions = [
  { value: 0, label: "هنگام شروع رویداد" },
  { value: 5, label: "۵ دقیقه قبل" },
  { value: 10, label: "۱۰ دقیقه قبل" },
  { value: 15, label: "۱۵ دقیقه قبل" },
  { value: 30, label: "۳۰ دقیقه قبل" },
  { value: 60, label: "۱ ساعت قبل" },
  { value: 120, label: "۲ ساعت قبل" },
  { value: 1440, label: "۱ روز قبل" },
  { value: 10080, label: "۱ هفته قبل" },
];

const EventPopover: React.FC<EventPopoverProps> = ({
  anchorEl,
  open,
  onClose,
  event,
  onSave,
  onDelete,
  mode,
  defaultDate,
  anchorPosition,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Form state for managing new reminders and attendees
  const [newReminder, setNewReminder] = useState<Omit<Reminder, "id">>({
    type: "notification",
    timeBeforeEvent: 15,
    isEnabled: true,
  });

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [attendeeRole, setAttendeeRole] =
    useState<EventAttendee["role"]>("required");
  const [attendeePermissions, setAttendeePermissions] =
    useState<EventAttendee["permissions"]>("view");

  // Prepare default values for the form
  const getDefaultValues = (): Partial<EventFormData> => {
    if (event) {
      return {
        ...event,
        // Ensure isAllDay is always a boolean
        isAllDay: event.isAllDay ?? false,
        // Convert dates to moment objects
        startDate: event.startDate ? moment(event.startDate) : moment(),
        endDate: event.endDate ? moment(event.endDate) : moment(),
        startTime: event.startTime
          ? moment(event.startTime, "HH:mm")
          : moment("09:00", "HH:mm"),
        endTime: event.endTime
          ? moment(event.endTime, "HH:mm")
          : moment("10:00", "HH:mm"),
      };
    }

    const date = defaultDate ? moment(defaultDate) : moment();

    return {
      id: generateEventId(),
      title: "",
      description: "",
      startDate: date,
      endDate: date,
      startTime: moment("09:00", "HH:mm"),
      endTime: moment("10:00", "HH:mm"),
      color: "#2196f3",
      isAllDay: false,
      location: "",
      reminders: [],
      attendees: [],
      comments: [],
      createdAt: new Date().toISOString(),
      createdBy: "current-user",
    };
  };

  // Initialize React Hook Form
  const form = useEventForm(getDefaultValues());
  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = form;

  // Watch current form values for dynamic behavior
  const watchedValues = watch();
  const isAllDay = watch("isAllDay");

  // Field arrays for dynamic content
  const reminders = useEventFieldArray(form, "reminders", () => ({
    id: generateReminderId(),
    type: "notification" as "email" | "notification" | "sms",
    timeBeforeEvent: 15,
    isEnabled: true,
  }));

  const attendees = useEventFieldArray(form, "attendees", () => ({
    id: generateAttendeeId(),
    personId: "",
    person: {} as Person,
    role: "required" as "organizer" | "required" | "optional" | "informational",
    status: "pending" as "pending" | "accepted" | "declined" | "tentative",
    permissions: "view" as "view" | "edit" | "full",
    invitedAt: new Date().toISOString(),
  }));

  const comments = useEventFieldArray(form, "comments", () => ({
    id: generateCommentId(),
    authorId: "current-user",
    authorName: "کاربر فعلی",
    content: "",
    createdAt: new Date().toISOString(),
  }));

  // Reset form when event changes
  useEffect(() => {
    if (event) {
      form.reset({
        ...event,
        isAllDay: event.isAllDay ?? false,
        startDate: event.startDate ? moment(event.startDate) : moment(),
        endDate: event.endDate ? moment(event.endDate) : moment(),
        startTime: event.startTime
          ? moment(event.startTime, "HH:mm")
          : moment("09:00", "HH:mm"),
        endTime: event.endTime
          ? moment(event.endTime, "HH:mm")
          : moment("10:00", "HH:mm"),
      });
    } else {
      const date = defaultDate ? moment(defaultDate) : moment();

      form.reset({
        id: generateEventId(),
        title: "",
        description: "",
        startDate: date,
        endDate: date,
        startTime: moment("09:00", "HH:mm"),
        endTime: moment("10:00", "HH:mm"),
        color: "#2196f3",
        isAllDay: false,
        location: "",
        reminders: [],
        attendees: [],
        comments: [],
        createdAt: new Date().toISOString(),
        createdBy: "current-user",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, defaultDate, mode]); // Remove form from deps to prevent infinite loop

  // Helper functions
  const addReminder = () => {
    reminders.append({
      ...newReminder,
      id: generateReminderId(),
    });
    setNewReminder({
      type: "notification",
      timeBeforeEvent: 15,
      isEnabled: true,
    });
  };

  const toggleReminder = (reminderId: string) => {
    const reminderIndex = reminders.items.findIndex((r) => r.id === reminderId);
    if (reminderIndex !== -1) {
      const reminder = reminders.items[reminderIndex];
      reminders.update(reminderIndex, { isEnabled: !reminder.isEnabled });
    }
  };

  const addAttendee = () => {
    if (!selectedPerson) return;

    // Check if person is already an attendee
    const isAlreadyAttendee = attendees.items.some(
      (attendee) => attendee.personId === selectedPerson.id
    );

    if (isAlreadyAttendee) return;

    attendees.append({
      id: generateAttendeeId(),
      personId: selectedPerson.id,
      person: selectedPerson,
      role: attendeeRole,
      status: "pending",
      permissions: attendeePermissions,
      invitedAt: new Date().toISOString(),
    });

    // Reset form
    setSelectedPerson(null);
    setAttendeeRole("required");
    setAttendeePermissions("view");
  };

  const updateAttendeeRole = (
    attendeeId: string,
    role: EventAttendee["role"]
  ) => {
    const attendeeIndex = attendees.items.findIndex((a) => a.id === attendeeId);
    if (attendeeIndex !== -1) {
      attendees.update(attendeeIndex, { role });
    }
  };

  const updateAttendeePermissions = (
    attendeeId: string,
    permissions: EventAttendee["permissions"]
  ) => {
    const attendeeIndex = attendees.items.findIndex((a) => a.id === attendeeId);
    if (attendeeIndex !== -1) {
      attendees.update(attendeeIndex, { permissions });
    }
  };

  // Comment management functions
  const addComment = (commentData: Omit<Comment, "id">) => {
    comments.append({
      ...commentData,
      id: generateCommentId(),
    });
  };

  const updateComment = (commentId: string, content: string) => {
    const commentIndex = comments.items.findIndex((c) => c.id === commentId);
    if (commentIndex !== -1) {
      const updatedComment = {
        ...comments.items[commentIndex],
        content,
        updatedAt: new Date().toISOString(),
      };
      comments.update(commentIndex, updatedComment);
    }
  };

  const deleteComment = (commentId: string) => {
    const commentIndex = comments.items.findIndex((c) => c.id === commentId);
    if (commentIndex !== -1) {
      comments.remove(commentIndex);
    }
  };

  // Get available people (not already attendees)
  const availablePeople = companyMembers.filter(
    (member) =>
      !attendees.items.some((attendee) => attendee.personId === member.id)
  );

  // Form submission handler
  const onSubmit = (data: EventFormData) => {
    const eventToSave: Event = {
      ...data,
      id: data.id || generateEventId(),
      // Convert moment objects back to strings
      startDate: data.startDate
        ? moment(data.startDate).format("YYYY-MM-DD")
        : "",
      endDate: data.endDate ? moment(data.endDate).format("YYYY-MM-DD") : "",
      startTime: data.startTime ? moment(data.startTime).format("HH:mm") : "",
      endTime: data.endTime ? moment(data.endTime).format("HH:mm") : "",
      updatedAt: new Date().toISOString(),
      createdAt: data.createdAt || new Date().toISOString(),
      createdBy: data.createdBy || "current-user",
    };

    onSave(eventToSave);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && watchedValues.id) {
      onDelete(watchedValues.id);
      onClose();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="fa">
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        anchorPosition={anchorPosition}
        PaperProps={{
          sx: {
            width: isMobile ? "90vw" : 500,
            maxWidth: 500,
            maxHeight: isMobile ? "90vh" : 600,
            overflowY: "auto",
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            mt: 1,
          },
        }}
      >
        <Card elevation={0}>
          <CardContent sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <EventIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
                {mode === "create" ? "ایجاد رویداد" : "ویرایش رویداد"}
              </Typography>
              <IconButton
                onClick={onClose}
                size="small"
                sx={{ color: "text.secondary" }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                {/* Title */}
                <ControlledTextField
                  control={control}
                  name="title"
                  label="عنوان رویداد"
                  autoFocus
                  required
                />

                {/* Description */}
                <ControlledTextField
                  control={control}
                  name="description"
                  label="توضیحات"
                  multiline
                  rows={2}
                  placeholder="توضیحات رویداد را اضافه کنید"
                />

                {/* Location */}
                <ControlledTextField
                  control={control}
                  name="location"
                  label="محل برگزاری"
                  placeholder="محل برگزاری رویداد را اضافه کنید"
                />

                {/* All Day Toggle */}
                <ControlledSwitch
                  control={control}
                  name="isAllDay"
                  label="تمام روز"
                />

                {/* Date Selection */}
                <Box sx={{ display: "flex", gap: 1 }}>
                  <ControlledDatePicker
                    control={control}
                    name="startDate"
                    label="تاریخ شروع"
                  />
                  <ControlledDatePicker
                    control={control}
                    name="endDate"
                    label="تاریخ پایان"
                  />
                </Box>

                {/* Time Selection */}
                {!isAllDay && (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <ControlledTimePicker
                      control={control}
                      name="startTime"
                      label="زمان شروع"
                    />
                    <ControlledTimePicker
                      control={control}
                      name="endTime"
                      label="زمان پایان"
                    />
                  </Box>
                )}

                {/* Color Selection */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, display: "flex", alignItems: "center" }}
                  >
                    <ColorLensIcon sx={{ mr: 1, fontSize: 16 }} />
                    رنگ
                  </Typography>
                  <ControlledColorPicker
                    control={control}
                    name="color"
                    colors={eventColors}
                  />
                </Box>

                {/* Reminders Section */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, display: "flex", alignItems: "center" }}
                  >
                    <NotificationsIcon sx={{ mr: 1, fontSize: 16 }} />
                    یادآوری‌ها
                  </Typography>

                  <ReminderList
                    reminders={reminders.items}
                    onToggle={toggleReminder}
                    onRemove={(id) => {
                      const index = reminders.items.findIndex(
                        (r) => r.id === id
                      );
                      if (index !== -1) reminders.remove(index);
                    }}
                  />

                  {/* Add New Reminder */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>زمان</InputLabel>
                      <Select
                        value={newReminder.timeBeforeEvent}
                        onChange={(e) =>
                          setNewReminder((prev) => ({
                            ...prev,
                            timeBeforeEvent: Number(e.target.value),
                          }))
                        }
                        label="زمان"
                      >
                        {reminderTimeOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <InputLabel>نوع</InputLabel>
                      <Select
                        value={newReminder.type}
                        onChange={(e) =>
                          setNewReminder((prev) => ({
                            ...prev,
                            type: e.target.value as
                              | "email"
                              | "notification"
                              | "sms",
                          }))
                        }
                        label="نوع"
                      >
                        <MenuItem value="notification">اعلان</MenuItem>
                        <MenuItem value="email">ایمیل</MenuItem>
                        <MenuItem value="sms">پیامک</MenuItem>
                      </Select>
                    </FormControl>

                    <Button
                      variant="outlined"
                      size="small"
                      onClick={addReminder}
                      startIcon={<AddIcon />}
                    >
                      افزودن
                    </Button>
                  </Box>
                </Box>

                {/* Attendees Section */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, display: "flex", alignItems: "center" }}
                  >
                    <PeopleIcon sx={{ mr: 1, fontSize: 16 }} />
                    اشتراک‌گذاری با افراد
                  </Typography>

                  <AttendeeList
                    attendees={attendees.items}
                    onUpdateRole={updateAttendeeRole}
                    onUpdatePermissions={updateAttendeePermissions}
                    onRemove={(id) => {
                      const index = attendees.items.findIndex(
                        (a) => a.id === id
                      );
                      if (index !== -1) attendees.remove(index);
                    }}
                  />

                  {/* Add New Attendee */}
                  {availablePeople.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel>انتخاب شخص</InputLabel>
                        <Select
                          value={selectedPerson?.id || ""}
                          onChange={(e) => {
                            const person = availablePeople.find(
                              (p) => p.id === e.target.value
                            );
                            setSelectedPerson(person || null);
                          }}
                          label="انتخاب شخص"
                        >
                          {availablePeople.map((person) => (
                            <MenuItem key={person.id} value={person.id}>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                {person.avatar && (
                                  <Box
                                    component="img"
                                    src={person.avatar}
                                    alt={person.name}
                                    sx={{
                                      width: 20,
                                      height: 20,
                                      borderRadius: "50%",
                                      mr: 1,
                                    }}
                                  />
                                )}
                                {person.name}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl size="small" sx={{ minWidth: 80 }}>
                        <InputLabel>نقش</InputLabel>
                        <Select
                          value={attendeeRole}
                          onChange={(e) =>
                            setAttendeeRole(
                              e.target.value as EventAttendee["role"]
                            )
                          }
                          label="نقش"
                        >
                          <MenuItem value="organizer">برگزارکننده</MenuItem>
                          <MenuItem value="required">اجباری</MenuItem>
                          <MenuItem value="optional">اختیاری</MenuItem>
                          <MenuItem value="informational">اطلاعی</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl size="small" sx={{ minWidth: 60 }}>
                        <InputLabel>دسترسی</InputLabel>
                        <Select
                          value={attendeePermissions}
                          onChange={(e) =>
                            setAttendeePermissions(
                              e.target.value as EventAttendee["permissions"]
                            )
                          }
                          label="دسترسی"
                        >
                          <MenuItem value="view">مشاهده</MenuItem>
                          <MenuItem value="edit">ویرایش</MenuItem>
                          <MenuItem value="full">کامل</MenuItem>
                        </Select>
                      </FormControl>

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={addAttendee}
                        startIcon={<PersonAddIcon />}
                        disabled={!selectedPerson}
                      >
                        افزودن
                      </Button>
                    </Box>
                  )}
                </Box>

                {/* Comments Section */}
                <CommentsSection
                  comments={comments.items}
                  onAddComment={addComment}
                  onUpdateComment={updateComment}
                  onDeleteComment={deleteComment}
                  currentUserId="current-user"
                  maxHeight={150}
                />

                {/* Action Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 3,
                  }}
                >
                  {mode === "edit" && onDelete && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleDelete}
                    >
                      حذف
                    </Button>
                  )}
                  <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
                    <Button variant="outlined" onClick={onClose}>
                      انصراف
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={isSubmitting}
                    >
                      {mode === "create" ? "ایجاد" : "ذخیره"}
                    </Button>
                  </Box>
                </Box>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Popover>
    </LocalizationProvider>
  );
};

export default EventPopover;
