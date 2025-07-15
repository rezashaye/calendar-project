// Utility functions for generating unique IDs safely for SSR
export const generateId = (prefix = "id"): string => {
  if (
    typeof window !== "undefined" &&
    typeof crypto !== "undefined" &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }
  // Fallback for SSR or environments without crypto.randomUUID
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateEventId = (): string => generateId("event");
export const generateReminderId = (): string => generateId("reminder");
export const generateCommentId = (): string => generateId("comment");
export const generateAttendeeId = (): string => generateId("attendee");
