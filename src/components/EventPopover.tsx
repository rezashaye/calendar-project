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
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  Event,
  Reminder,
  EventAttendee,
  Person,
} from "../stores/calendarStore";
import {
  generateEventId,
  generateReminderId,
  generateAttendeeId,
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
  { name: "Blue", value: "#2196f3" },
  { name: "Green", value: "#4caf50" },
  { name: "Red", value: "#f44336" },
  { name: "Purple", value: "#9c27b0" },
  { name: "Orange", value: "#ff9800" },
  { name: "Teal", value: "#009688" },
  { name: "Pink", value: "#e91e63" },
  { name: "Indigo", value: "#3f51b5" },
];

const reminderTimeOptions = [
  { value: 0, label: "At event time" },
  { value: 5, label: "5 minutes before" },
  { value: 10, label: "10 minutes before" },
  { value: 15, label: "15 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
  { value: 120, label: "2 hours before" },
  { value: 1440, label: "1 day before" },
  { value: 10080, label: "1 week before" },
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
      };
    }

    const date = defaultDate || new Date();
    const dateStr = date.toISOString().split("T")[0];

    return {
      id: generateEventId(),
      title: "",
      description: "",
      startDate: dateStr,
      endDate: dateStr,
      startTime: "09:00",
      endTime: "10:00",
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

  // Reset form when event changes
  useEffect(() => {
    if (event) {
      form.reset({
        ...event,
        isAllDay: event.isAllDay ?? false,
      });
    } else {
      const date = defaultDate || new Date();
      const dateStr = date.toISOString().split("T")[0];

      form.reset({
        id: generateEventId(),
        title: "",
        description: "",
        startDate: dateStr,
        endDate: dateStr,
        startTime: "09:00",
        endTime: "10:00",
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
            width: isMobile ? "90vw" : 400,
            maxWidth: 400,
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
                {mode === "create" ? "Create Event" : "Edit Event"}
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
                  label="Event Title"
                  autoFocus
                  required
                />

                {/* Description */}
                <ControlledTextField
                  control={control}
                  name="description"
                  label="Description"
                  multiline
                  rows={2}
                  placeholder="Add event description"
                />

                {/* Location */}
                <ControlledTextField
                  control={control}
                  name="location"
                  label="Location"
                  placeholder="Add event location"
                />

                {/* All Day Toggle */}
                <ControlledSwitch
                  control={control}
                  name="isAllDay"
                  label="All Day Event"
                />

                {/* Date Selection */}
                <Box sx={{ display: "flex", gap: 1 }}>
                  <ControlledDatePicker
                    control={control}
                    name="startDate"
                    label="Start Date"
                  />
                  <ControlledDatePicker
                    control={control}
                    name="endDate"
                    label="End Date"
                  />
                </Box>

                {/* Time Selection */}
                {!isAllDay && (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <ControlledTimePicker
                      control={control}
                      name="startTime"
                      label="Start Time"
                    />
                    <ControlledTimePicker
                      control={control}
                      name="endTime"
                      label="End Time"
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
                    Color
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
                    Reminders
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
                      <InputLabel>Time</InputLabel>
                      <Select
                        value={newReminder.timeBeforeEvent}
                        onChange={(e) =>
                          setNewReminder((prev) => ({
                            ...prev,
                            timeBeforeEvent: Number(e.target.value),
                          }))
                        }
                        label="Time"
                      >
                        {reminderTimeOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <InputLabel>Type</InputLabel>
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
                        label="Type"
                      >
                        <MenuItem value="notification">Notification</MenuItem>
                        <MenuItem value="email">Email</MenuItem>
                        <MenuItem value="sms">SMS</MenuItem>
                      </Select>
                    </FormControl>

                    <Button
                      variant="outlined"
                      size="small"
                      onClick={addReminder}
                      startIcon={<AddIcon />}
                    >
                      Add
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
                    Share with People
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
                        <InputLabel>Select Person</InputLabel>
                        <Select
                          value={selectedPerson?.id || ""}
                          onChange={(e) => {
                            const person = availablePeople.find(
                              (p) => p.id === e.target.value
                            );
                            setSelectedPerson(person || null);
                          }}
                          label="Select Person"
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
                        <InputLabel>Role</InputLabel>
                        <Select
                          value={attendeeRole}
                          onChange={(e) =>
                            setAttendeeRole(
                              e.target.value as EventAttendee["role"]
                            )
                          }
                          label="Role"
                        >
                          <MenuItem value="organizer">Organizer</MenuItem>
                          <MenuItem value="required">Required</MenuItem>
                          <MenuItem value="optional">Optional</MenuItem>
                          <MenuItem value="informational">Info</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl size="small" sx={{ minWidth: 60 }}>
                        <InputLabel>Access</InputLabel>
                        <Select
                          value={attendeePermissions}
                          onChange={(e) =>
                            setAttendeePermissions(
                              e.target.value as EventAttendee["permissions"]
                            )
                          }
                          label="Access"
                        >
                          <MenuItem value="view">View</MenuItem>
                          <MenuItem value="edit">Edit</MenuItem>
                          <MenuItem value="full">Full</MenuItem>
                        </Select>
                      </FormControl>

                      <Button
                        variant="outlined"
                        size="small"
                        onClick={addAttendee}
                        startIcon={<PersonAddIcon />}
                        disabled={!selectedPerson}
                      >
                        Add
                      </Button>
                    </Box>
                  )}
                </Box>

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
                      Delete
                    </Button>
                  )}
                  <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
                    <Button variant="outlined" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={isSubmitting}
                    >
                      {mode === "create" ? "Create" : "Save"}
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
