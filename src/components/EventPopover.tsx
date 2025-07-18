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
  Tabs,
  Tab,
  Divider,
  Chip,
  alpha,
  Collapse,
  Fade,
  Slide,
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
  Settings as SettingsIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`event-tabpanel-${index}`}
      aria-labelledby={`event-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
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

  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState({
    advanced: false,
    reminders: false,
    attendees: false,
    comments: false,
  });

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

  // Reset states when popover opens/closes
  useEffect(() => {
    if (open) {
      setTabValue(0);
      setExpandedSections({
        advanced: false,
        reminders: false,
        attendees: false,
        comments: false,
      });
    }
  }, [open]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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
        anchorReference={anchorPosition ? "anchorPosition" : "anchorEl"}
        PaperProps={{
          sx: {
            width: isMobile ? "90vw" : 480,
            maxWidth: 480,
            maxHeight: isMobile ? "90vh" : 700,
            overflowY: "auto",
            borderRadius: 3,
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
            mt: 1,
            background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
          },
        }}
        TransitionComponent={Fade}
      >
        <Card elevation={0} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 0 }}>
            {/* Modern Header */}
            <Box
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                p: 3,
                borderRadius: "12px 12px 0 0",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "100px",
                  height: "100px",
                  background: alpha("#ffffff", 0.1),
                  borderRadius: "50%",
                  transform: "translate(30px, -30px)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    background: alpha("#ffffff", 0.2),
                    mr: 2,
                  }}
                >
                  <EventIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    flexGrow: 1,
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    letterSpacing: "0.5px",
                  }}
                >
                  {mode === "create" ? "ایجاد رویداد جدید" : "ویرایش رویداد"}
                </Typography>
                <IconButton
                  onClick={onClose}
                  size="small"
                  sx={{
                    color: "white",
                    background: alpha("#ffffff", 0.1),
                    "&:hover": { background: alpha("#ffffff", 0.2) },
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                  fontSize: "0.875rem",
                  letterSpacing: "0.3px",
                }}
              >
                {mode === "create"
                  ? "جزئیات رویداد خود را وارد کنید"
                  : "اطلاعات رویداد را تغییر دهید"}
              </Typography>
            </Box>

            {/* Content Container */}
            <Box sx={{ p: 3 }}>
              {/* Tab Navigation */}
              <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs
                  value={tabValue}
                  onChange={(_, newValue) => setTabValue(newValue)}
                  variant="fullWidth"
                  sx={{
                    minHeight: 40,
                    "& .MuiTab-root": {
                      minHeight: 40,
                      textTransform: "none",
                      fontWeight: 500,
                      fontSize: "0.875rem",
                    },
                  }}
                >
                  <Tab
                    icon={<ScheduleIcon sx={{ fontSize: 18 }} />}
                    label="اطلاعات اصلی"
                    iconPosition="start"
                  />
                  <Tab
                    icon={<SettingsIcon sx={{ fontSize: 18 }} />}
                    label="تنظیمات"
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <TabPanel value={tabValue} index={0}>
                  <Stack spacing={2.5}>
                    {/* Essential Information */}
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          mb: 2,
                          color: "text.primary",
                          fontSize: "1rem",
                        }}
                      >
                        اطلاعات اصلی
                      </Typography>

                      <Stack spacing={2}>
                        <ControlledTextField
                          control={control}
                          name="title"
                          label="عنوان رویداد"
                          autoFocus
                          required
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              fontSize: "1rem",
                            },
                          }}
                        />

                        <ControlledTextField
                          control={control}
                          name="description"
                          label="توضیحات"
                          multiline
                          rows={2}
                          placeholder="توضیحات اختیاری برای رویداد"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                        />

                        <ControlledTextField
                          control={control}
                          name="location"
                          label="محل برگزاری"
                          placeholder="آدرس یا محل برگزاری"
                          InputProps={{
                            startAdornment: (
                              <LocationIcon
                                sx={{ color: "text.secondary", mr: 1 }}
                              />
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Stack>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    {/* Date & Time */}
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          mb: 2,
                          color: "text.primary",
                          fontSize: "1rem",
                        }}
                      >
                        زمان‌بندی
                      </Typography>

                      <Stack spacing={2}>
                        <ControlledSwitch
                          control={control}
                          name="isAllDay"
                          label="تمام روز"
                        />

                        <Box sx={{ display: "flex", gap: 1.5 }}>
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

                        {!isAllDay && (
                          <Slide
                            direction="up"
                            in={!isAllDay}
                            mountOnEnter
                            unmountOnExit
                          >
                            <Box sx={{ display: "flex", gap: 1.5 }}>
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
                          </Slide>
                        )}
                      </Stack>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    {/* Color Selection */}
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          mb: 2,
                          color: "text.primary",
                          fontSize: "1rem",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <ColorLensIcon sx={{ mr: 1, fontSize: 18 }} />
                        رنگ رویداد
                      </Typography>
                      <ControlledColorPicker
                        control={control}
                        name="color"
                        colors={eventColors}
                      />
                    </Box>
                  </Stack>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Stack spacing={3}>
                    {/* Reminders */}
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 2,
                          cursor: "pointer",
                        }}
                        onClick={() => toggleSection("reminders")}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            color: "text.primary",
                            fontSize: "1rem",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <NotificationsIcon sx={{ mr: 1, fontSize: 18 }} />
                          یادآوری‌ها
                          <Chip
                            label={reminders.items.length}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                        {expandedSections.reminders ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </Box>

                      <Collapse in={expandedSections.reminders}>
                        <Stack spacing={2}>
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

                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              background: alpha(
                                theme.palette.primary.main,
                                0.05
                              ),
                              border: `1px solid ${alpha(
                                theme.palette.primary.main,
                                0.1
                              )}`,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ mb: 1.5, fontWeight: 600 }}
                            >
                              افزودن یادآوری جدید
                            </Typography>
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
                                    <MenuItem
                                      key={option.value}
                                      value={option.value}
                                    >
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
                                  <MenuItem value="notification">
                                    اعلان
                                  </MenuItem>
                                  <MenuItem value="email">ایمیل</MenuItem>
                                  <MenuItem value="sms">پیامک</MenuItem>
                                </Select>
                              </FormControl>

                              <Button
                                variant="contained"
                                size="small"
                                onClick={addReminder}
                                startIcon={<AddIcon />}
                                sx={{
                                  borderRadius: 2,
                                  textTransform: "none",
                                  fontWeight: 500,
                                }}
                              >
                                افزودن
                              </Button>
                            </Box>
                          </Box>
                        </Stack>
                      </Collapse>
                    </Box>

                    <Divider />

                    {/* Attendees */}
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 2,
                          cursor: "pointer",
                        }}
                        onClick={() => toggleSection("attendees")}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            color: "text.primary",
                            fontSize: "1rem",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <PeopleIcon sx={{ mr: 1, fontSize: 18 }} />
                          شرکت‌کنندگان
                          <Chip
                            label={attendees.items.length}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                        {expandedSections.attendees ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </Box>

                      <Collapse in={expandedSections.attendees}>
                        <Stack spacing={2}>
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

                          {availablePeople.length > 0 && (
                            <Box
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                background: alpha(
                                  theme.palette.secondary.main,
                                  0.05
                                ),
                                border: `1px solid ${alpha(
                                  theme.palette.secondary.main,
                                  0.1
                                )}`,
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{ mb: 1.5, fontWeight: 600 }}
                              >
                                افزودن شرکت‌کننده
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  alignItems: "center",
                                  flexWrap: "wrap",
                                }}
                              >
                                <FormControl
                                  size="small"
                                  sx={{ minWidth: 160 }}
                                >
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
                                      <MenuItem
                                        key={person.id}
                                        value={person.id}
                                      >
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                          }}
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
                                    <MenuItem value="organizer">
                                      برگزارکننده
                                    </MenuItem>
                                    <MenuItem value="required">اجباری</MenuItem>
                                    <MenuItem value="optional">
                                      اختیاری
                                    </MenuItem>
                                    <MenuItem value="informational">
                                      اطلاعی
                                    </MenuItem>
                                  </Select>
                                </FormControl>

                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={addAttendee}
                                  startIcon={<PersonAddIcon />}
                                  disabled={!selectedPerson}
                                  sx={{
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 500,
                                  }}
                                >
                                  افزودن
                                </Button>
                              </Box>
                            </Box>
                          )}
                        </Stack>
                      </Collapse>
                    </Box>

                    <Divider />

                    {/* Comments */}
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 2,
                          cursor: "pointer",
                        }}
                        onClick={() => toggleSection("comments")}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            color: "text.primary",
                            fontSize: "1rem",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          نظرات
                          <Chip
                            label={comments.items.length}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                        {expandedSections.comments ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </Box>

                      <Collapse in={expandedSections.comments}>
                        <CommentsSection
                          comments={comments.items}
                          onAddComment={addComment}
                          onUpdateComment={updateComment}
                          onDeleteComment={deleteComment}
                          currentUserId="current-user"
                          maxHeight={200}
                        />
                      </Collapse>
                    </Box>
                  </Stack>
                </TabPanel>

                {/* Action Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 4,
                    pt: 3,
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {mode === "edit" && onDelete && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleDelete}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 500,
                      }}
                    >
                      حذف
                    </Button>
                  )}
                  <Box sx={{ display: "flex", gap: 1.5, ml: "auto" }}>
                    <Button
                      variant="outlined"
                      onClick={onClose}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 500,
                        minWidth: 80,
                      }}
                    >
                      انصراف
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={isSubmitting}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        minWidth: 100,
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #5a67d8 0%, #6c5ce7 100%)",
                        },
                      }}
                    >
                      {mode === "create" ? "ایجاد رویداد" : "ذخیره تغییرات"}
                    </Button>
                  </Box>
                </Box>
              </form>
            </Box>
          </CardContent>
        </Card>
      </Popover>
    </LocalizationProvider>
  );
};

export default EventPopover;
