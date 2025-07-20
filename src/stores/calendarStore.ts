import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import * as yup from "yup";
import { InferType } from "yup";
import { sampleEvents } from "../mocks/sampleEvents";
import {
  generateReminderId,
  generateCommentId,
  generateAttendeeId,
} from "../utils/idGenerator";

// تنظیم پیام‌های خطای فارسی برای Yup
yup.setLocale({
  mixed: {
    required: "این فیلد الزامی است",
    notType: "نوع داده نامعتبر است",
    oneOf: "مقدار وارد شده معتبر نیست",
  },
  string: {
    min: "حداقل ${min} کاراکتر وارد کنید",
    max: "حداکثر ${max} کاراکتر مجاز است",
    email: "آدرس ایمیل نامعتبر است",
    matches: "فرمت وارد شده صحیح نیست",
  },
  number: {
    min: "حداقل مقدار ${min} است",
    max: "حداکثر مقدار ${max} است",
  },
  array: {
    min: "حداقل ${min} آیتم وارد کنید",
    max: "حداکثر ${max} آیتم مجاز است",
  },
});

// Yup Schemas for validation
export const PersonSchema = yup.object({
  id: yup.string().required("شناسه الزامی است"),
  name: yup.string().min(1, "نام الزامی است").required("نام الزامی است"),
  email: yup
    .string()
    .email("آدرس ایمیل نامعتبر است")
    .required("ایمیل الزامی است"),
  type: yup
    .string()
    .oneOf(["member", "guest"], "نوع کاربر نامعتبر است")
    .required("نوع کاربر الزامی است"),
  avatar: yup.string().optional(),
  department: yup.string().optional(),
});

export const AttendeeSchema = yup.object({
  id: yup.string().required("شناسه الزامی است"),
  personId: yup.string().required("شناسه شخص الزامی است"),
  person: PersonSchema.required("اطلاعات شخص الزامی است"),
  role: yup
    .string()
    .oneOf(
      ["organizer", "required", "optional", "informational"],
      "نقش نامعتبر است"
    )
    .required("نقش الزامی است"),
  status: yup
    .string()
    .oneOf(
      ["pending", "accepted", "declined", "tentative"],
      "وضعیت نامعتبر است"
    )
    .required("وضعیت الزامی است"),
  permissions: yup
    .string()
    .oneOf(["view", "edit", "full"], "سطح دسترسی نامعتبر است")
    .required("سطح دسترسی الزامی است"),
  invitedAt: yup.string().required("تاریخ دعوت الزامی است"),
  respondedAt: yup.string().optional(),
});

export const ReminderSchema = yup.object({
  id: yup.string().required("شناسه الزامی است"),
  type: yup
    .string()
    .oneOf(["email", "notification", "sms"], "نوع یادآوری نامعتبر است")
    .required("نوع یادآوری الزامی است"),
  timeBeforeEvent: yup
    .number()
    .min(0, "زمان یادآوری نمی‌تواند منفی باشد")
    .required("زمان یادآوری الزامی است"),
  isEnabled: yup.boolean().required("وضعیت فعالسازی الزامی است"),
});

export const CommentSchema = yup.object({
  id: yup.string().required("شناسه الزامی است"),
  authorId: yup.string().required("شناسه نویسنده الزامی است"),
  authorName: yup.string().required("نام نویسنده الزامی است"),
  content: yup
    .string()
    .min(1, "نظر نمی‌تواند خالی باشد")
    .required("محتوای نظر الزامی است"),
  createdAt: yup.string().required("تاریخ ایجاد الزامی است"),
  updatedAt: yup.string().optional(),
});

export const EventSchema = yup.object({
  id: yup.string().required("شناسه الزامی است"),
  title: yup
    .string()
    .min(1, "عنوان رویداد الزامی است")
    .required("عنوان رویداد الزامی است"),
  description: yup.string().optional(),
  startDate: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "فرمت تاریخ شروع صحیح نیست")
    .required("تاریخ شروع الزامی است"),
  endDate: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "فرمت تاریخ پایان صحیح نیست")
    .required("تاریخ پایان الزامی است"),
  startTime: yup
    .string()
    .matches(/^\d{2}:\d{2}$/, "فرمت زمان شروع صحیح نیست")
    .required("زمان شروع الزامی است"),
  endTime: yup
    .string()
    .matches(/^\d{2}:\d{2}$/, "فرمت زمان پایان صحیح نیست")
    .required("زمان پایان الزامی است"),
  color: yup.string().required("رنگ الزامی است"),
  categoryId: yup.string().optional(),
  isAllDay: yup.boolean().optional(),
  location: yup.string().optional(),
  reminders: yup.array(ReminderSchema).default([]),
  attendees: yup.array(AttendeeSchema).default([]),
  comments: yup.array(CommentSchema).default([]),
  createdAt: yup.string().required("تاریخ ایجاد الزامی است"),
  updatedAt: yup.string().optional(),
  createdBy: yup.string().required("ایجادکننده الزامی است"),
  isRecurring: yup.boolean().optional(),
  recurrencePattern: yup.string().optional(),
  // Legacy support
  date: yup.string().optional(),
  attendee: yup.string().optional(),
});

// Event schema for forms (id and timestamps are optional)
export const EventFormSchema = yup.object({
  id: yup.string().optional(),
  title: yup
    .string()
    .min(1, "عنوان رویداد الزامی است")
    .required("عنوان رویداد الزامی است"),
  description: yup.string().optional(),
  startDate: yup.mixed().required("تاریخ شروع الزامی است"),
  endDate: yup.mixed().required("تاریخ پایان الزامی است"),
  startTime: yup.mixed().required("زمان شروع الزامی است"),
  endTime: yup.mixed().required("زمان پایان الزامی است"),
  color: yup.string().required("رنگ الزامی است"),
  categoryId: yup.string().optional(),
  isAllDay: yup.boolean().optional(),
  location: yup.string().optional(),
  reminders: yup.array(ReminderSchema).default([]),
  attendees: yup.array(AttendeeSchema).default([]),
  comments: yup.array(CommentSchema).default([]),
  createdAt: yup.string().optional(),
  updatedAt: yup.string().optional(),
  createdBy: yup.string().optional(),
  isRecurring: yup.boolean().optional(),
  recurrencePattern: yup.string().optional(),
});

// Category schema and type
export const CategorySchema = yup.object({
  id: yup.string().required("شناسه الزامی است"),
  name: yup
    .string()
    .min(1, "نام دسته‌بندی الزامی است")
    .required("نام دسته‌بندی الزامی است"),
  icon: yup.string().required("آیکون الزامی است"),
  color: yup.string().required("رنگ الزامی است"),
  description: yup.string().optional(),
});

// TypeScript types from Yup schemas
export type Category = InferType<typeof CategorySchema>;
export type Person = InferType<typeof PersonSchema>;
export type EventAttendee = InferType<typeof AttendeeSchema>;
export type Reminder = InferType<typeof ReminderSchema>;
export type Comment = InferType<typeof CommentSchema>;
export type Event = InferType<typeof EventSchema>;

// Legacy interface for backward compatibility - but we'll phase this out
export interface LegacyAttendee {
  id: string;
  name: string;
  email: string;
  status: "pending" | "accepted" | "declined";
  isOrganizer?: boolean;
}

export type CalendarView = "ماهانه" | "هفتگی" | "روزانه" | "برنامه";

interface CalendarState {
  // View state
  currentView: CalendarView;
  currentDate: Date;
  selectedDate: Date;

  // Events state
  events: Event[];

  // Categories state
  categories: Category[];

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentView: (view: CalendarView) => void;
  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date) => void;

  // Date navigation
  navigateToToday: () => void;
  navigateDate: (direction: "prev" | "next") => void;

  // Event management
  addEvent: (event: Event) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  getEventsForDate: (date: Date) => Event[];
  getEventsForDateRange: (startDate: Date, endDate: Date) => Event[];

  // Comment management
  addComment: (eventId: string, comment: Omit<Comment, "id">) => void;
  updateComment: (eventId: string, commentId: string, content: string) => void;
  deleteComment: (eventId: string, commentId: string) => void;

  // Reminder management
  addReminder: (eventId: string, reminder: Omit<Reminder, "id">) => void;
  updateReminder: (
    eventId: string,
    reminderId: string,
    reminder: Partial<Reminder>
  ) => void;
  deleteReminder: (eventId: string, reminderId: string) => void;

  // Attendee management
  addAttendee: (eventId: string, attendee: Omit<EventAttendee, "id">) => void;
  updateAttendeeStatus: (
    eventId: string,
    attendeeId: string,
    status: EventAttendee["status"]
  ) => void;
  removeAttendee: (eventId: string, attendeeId: string) => void;

  // Category management
  addCategory: (category: Category) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;

  // Utility functions
  formatDate: (date: Date) => string;
  formatTime: (time: string) => string;

  // Initialize with sample data
  initializeSampleData: () => void;
}

// Default categories with Persian names and icons
const defaultCategories: Category[] = [
  {
    id: "financial",
    name: "مالی",
    icon: "💰",
    color: "#4CAF50",
    description: "موضوعات مالی و بودجه",
  },
  {
    id: "development",
    name: "برنامه‌نویسی",
    icon: "💻",
    color: "#2196F3",
    description: "پروژه‌های توسعه نرم‌افزار",
  },
  {
    id: "hr",
    name: "منابع انسانی",
    icon: "👥",
    color: "#F44336",
    description: "امور منابع انسانی و کارکنان",
  },
  {
    id: "marketing",
    name: "بازاریابی",
    icon: "📈",
    color: "#FF9800",
    description: "فعالیت‌های بازاریابی و تبلیغات",
  },
  {
    id: "meeting",
    name: "جلسات",
    icon: "🤝",
    color: "#9C27B0",
    description: "جلسات کاری و ملاقات‌ها",
  },
  {
    id: "project",
    name: "پروژه",
    icon: "📋",
    color: "#607D8B",
    description: "مدیریت پروژه‌ها",
  },
  {
    id: "training",
    name: "آموزش",
    icon: "🎓",
    color: "#795548",
    description: "دوره‌ها و کارگاه‌های آموزشی",
  },
  {
    id: "event",
    name: "رویداد",
    icon: "🎉",
    color: "#E91E63",
    description: "رویدادها و مراسمات",
  },
];

export const useCalendarStore = create<CalendarState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state - Use fixed date to prevent hydration mismatch
        currentView: "هفتگی",
        currentDate: new Date("2025-07-13"), // Fixed date for SSR consistency
        selectedDate: new Date("2025-07-13"), // Fixed date for SSR consistency
        events: [],
        categories: defaultCategories,
        isLoading: false,
        error: null,

        // View actions
        setCurrentView: (view) => set({ currentView: view }),
        setCurrentDate: (date) => set({ currentDate: date }),
        setSelectedDate: (date) => set({ selectedDate: date }),

        // Date navigation
        navigateToToday: () => {
          const today = new Date();
          set({ currentDate: today, selectedDate: today });
        },

        navigateDate: (direction) => {
          const { currentDate, currentView } = get();
          const newDate = new Date(currentDate);

          switch (currentView) {
            case "ماهانه":
              if (direction === "prev") {
                newDate.setMonth(newDate.getMonth() - 1);
              } else {
                newDate.setMonth(newDate.getMonth() + 1);
              }
              break;
            case "هفتگی":
              if (direction === "prev") {
                newDate.setDate(newDate.getDate() - 7);
              } else {
                newDate.setDate(newDate.getDate() + 7);
              }
              break;
            case "روزانه":
              if (direction === "prev") {
                newDate.setDate(newDate.getDate() - 1);
              } else {
                newDate.setDate(newDate.getDate() + 1);
              }
              break;
            default:
              break;
          }

          set({ currentDate: newDate });
        },

        // Event management
        addEvent: (event) => {
          // Validate event data using Yup before adding
          try {
            const validatedEvent = EventSchema.validateSync(event);
            const { events } = get();
            set({ events: [...events, validatedEvent] });
          } catch (error) {
            console.error("Event validation failed:", error);
            // In a real app, you might want to set an error state or throw
            set({ error: "Failed to add event: Invalid event data" });
            // Re-throw the error so it bubbles up to the form
            throw error;
          }
        },

        updateEvent: (id, updatedEvent) => {
          try {
            // For partial updates, we validate the complete updated object
            const { events } = get();
            const existingEvent = events.find((event) => event.id === id);
            if (!existingEvent) {
              set({ error: "Event not found" });
              return;
            }

            const completeUpdatedEvent = { ...existingEvent, ...updatedEvent };
            const validatedEvent =
              EventSchema.validateSync(completeUpdatedEvent);

            set({
              events: events.map((event) =>
                event.id === id ? validatedEvent : event
              ),
            });
          } catch (error) {
            console.error("Event update validation failed:", error);
            set({ error: "Failed to update event: Invalid event data" });
          }
        },

        deleteEvent: (id) => {
          const { events } = get();
          set({ events: events.filter((event) => event.id !== id) });
        },

        getEventsForDate: (date) => {
          const { events } = get();
          const dateStr = date.toISOString().split("T")[0];
          return events.filter((event) => {
            // Use startDate as the primary date field, fallback to legacy date field
            const eventDate = event.startDate || event.date;
            return eventDate === dateStr;
          });
        },

        getEventsForDateRange: (startDate, endDate) => {
          const { events } = get();
          const startStr = startDate.toISOString().split("T")[0];
          const endStr = endDate.toISOString().split("T")[0];
          return events.filter((event) => {
            // Use startDate as the primary date field, fallback to legacy date field
            const eventDate = event.startDate || event.date;
            return eventDate && eventDate >= startStr && eventDate <= endStr;
          });
        },

        // Comment management
        addComment: (eventId, comment) => {
          const { events } = get();
          const event = events.find((event) => event.id === eventId);
          if (event) {
            const newComment = {
              ...comment,
              id: generateCommentId(),
              createdAt: new Date().toISOString(),
            };
            set({
              events: events.map((event) =>
                event.id === eventId
                  ? { ...event, comments: [...event.comments, newComment] }
                  : event
              ),
            });
          }
        },

        updateComment: (eventId, commentId, content) => {
          const { events } = get();
          set({
            events: events.map((event) => {
              if (event.id === eventId) {
                return {
                  ...event,
                  comments: event.comments.map((comment) =>
                    comment.id === commentId
                      ? {
                          ...comment,
                          content,
                          updatedAt: new Date().toISOString(),
                        }
                      : comment
                  ),
                };
              }
              return event;
            }),
          });
        },

        deleteComment: (eventId, commentId) => {
          const { events } = get();
          set({
            events: events.map((event) =>
              event.id === eventId
                ? {
                    ...event,
                    comments: event.comments.filter(
                      (comment) => comment.id !== commentId
                    ),
                  }
                : event
            ),
          });
        },

        // Reminder management
        addReminder: (eventId, reminder) => {
          const { events } = get();
          const event = events.find((event) => event.id === eventId);
          if (event) {
            const newReminder = {
              ...reminder,
              id: generateReminderId(),
            };
            set({
              events: events.map((event) =>
                event.id === eventId
                  ? { ...event, reminders: [...event.reminders, newReminder] }
                  : event
              ),
            });
          }
        },

        updateReminder: (eventId, reminderId, reminder) => {
          const { events } = get();
          set({
            events: events.map((event) => {
              if (event.id === eventId) {
                return {
                  ...event,
                  reminders: event.reminders.map((r) =>
                    r.id === reminderId ? { ...r, ...reminder } : r
                  ),
                };
              }
              return event;
            }),
          });
        },

        deleteReminder: (eventId, reminderId) => {
          const { events } = get();
          set({
            events: events.map((event) =>
              event.id === eventId
                ? {
                    ...event,
                    reminders: event.reminders.filter(
                      (r) => r.id !== reminderId
                    ),
                  }
                : event
            ),
          });
        },

        // Attendee management
        addAttendee: (eventId, attendee) => {
          const { events } = get();
          const event = events.find((event) => event.id === eventId);
          if (event) {
            const newAttendee: EventAttendee = {
              ...attendee,
              id: generateAttendeeId(),
            };
            set({
              events: events.map((event) =>
                event.id === eventId
                  ? { ...event, attendees: [...event.attendees, newAttendee] }
                  : event
              ),
            });
          }
        },

        updateAttendeeStatus: (eventId, attendeeId, status) => {
          const { events } = get();
          set({
            events: events.map((event) => {
              if (event.id === eventId) {
                return {
                  ...event,
                  attendees: event.attendees.map((attendee) =>
                    attendee.id === attendeeId
                      ? { ...attendee, status }
                      : attendee
                  ),
                };
              }
              return event;
            }),
          });
        },

        removeAttendee: (eventId, attendeeId) => {
          const { events } = get();
          set({
            events: events.map((event) =>
              event.id === eventId
                ? {
                    ...event,
                    attendees: event.attendees.filter(
                      (attendee) => attendee.id !== attendeeId
                    ),
                  }
                : event
            ),
          });
        },

        // Utility functions
        // Category management
        addCategory: (category) => {
          try {
            const validatedCategory = CategorySchema.validateSync(category);
            set((state) => ({
              categories: [...state.categories, validatedCategory],
            }));
          } catch (error) {
            console.error("Error adding category:", error);
            set({ error: "خطا در افزودن دسته‌بندی" });
          }
        },

        updateCategory: (id, categoryUpdates) => {
          try {
            set((state) => ({
              categories: state.categories.map((cat) => {
                if (cat.id === id) {
                  const updatedCategory = { ...cat, ...categoryUpdates };
                  return CategorySchema.validateSync(updatedCategory);
                }
                return cat;
              }),
            }));
          } catch (error) {
            console.error("Error updating category:", error);
            set({ error: "خطا در بروزرسانی دسته‌بندی" });
          }
        },

        deleteCategory: (id) => {
          set((state) => ({
            categories: state.categories.filter((cat) => cat.id !== id),
            // Also remove category from events
            events: state.events.map((event) => ({
              ...event,
              categoryId:
                event.categoryId === id ? undefined : event.categoryId,
            })),
          }));
        },

        getCategoryById: (id) => {
          const state = get();
          return state.categories.find((cat) => cat.id === id);
        },

        formatDate: (date) => {
          return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        },

        formatTime: (time) => {
          const [hours, minutes] = time.split(":");
          const hour = parseInt(hours);
          const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
          const period = hour >= 12 ? "PM" : "AM";
          return `${displayHour}:${minutes} ${period}`;
        },

        // Initialize with sample data
        initializeSampleData: () => {
          set({ events: sampleEvents });
        },
      }),
      {
        name: "calendar-store",
        partialize: (state) => ({
          currentView: state.currentView,
          currentDate: state.currentDate,
          selectedDate: state.selectedDate,
          events: state.events,
          categories: state.categories,
        }),
        skipHydration: true, // Prevent hydration mismatches
        storage: {
          getItem: (name) => {
            // Safe storage access for SSR
            if (typeof window === "undefined") {
              return null;
            }
            const item = localStorage.getItem(name);
            if (!item) return null;

            try {
              const parsed = JSON.parse(item);
              // Convert date strings back to Date objects
              if (parsed.state) {
                if (parsed.state.currentDate) {
                  parsed.state.currentDate = new Date(parsed.state.currentDate);
                }
                if (parsed.state.selectedDate) {
                  parsed.state.selectedDate = new Date(
                    parsed.state.selectedDate
                  );
                }
              }
              return parsed;
            } catch (error) {
              console.error("Error parsing stored calendar data:", error);
              return null;
            }
          },
          setItem: (name, value) => {
            // Safe storage access for SSR
            if (typeof window === "undefined") {
              return;
            }
            try {
              localStorage.setItem(name, JSON.stringify(value));
            } catch (error) {
              console.error("Error storing calendar data:", error);
            }
          },
          removeItem: (name) => {
            // Safe storage access for SSR
            if (typeof window === "undefined") {
              return;
            }
            localStorage.removeItem(name);
          },
        },
      }
    ),
    {
      name: "calendar-store",
    }
  )
);
