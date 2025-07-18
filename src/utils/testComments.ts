// Test Comments Feature
// This file demonstrates the comments feature implementation

import { useCalendarStore } from "../stores/calendarStore";

// Example: How to add a comment to an event
export const addCommentToEvent = (
  eventId: string,
  authorId: string,
  authorName: string,
  content: string
) => {
  const { addComment } = useCalendarStore.getState();

  const newComment = {
    authorId,
    authorName,
    content,
    createdAt: new Date().toISOString(),
  };

  addComment(eventId, newComment);
};

// Example: How to update a comment
export const updateEventComment = (
  eventId: string,
  commentId: string,
  content: string
) => {
  const { updateComment } = useCalendarStore.getState();
  updateComment(eventId, commentId, content);
};

// Example: How to delete a comment
export const deleteEventComment = (eventId: string, commentId: string) => {
  const { deleteComment } = useCalendarStore.getState();
  deleteComment(eventId, commentId);
};

// Example: How to get all comments for an event
export const getEventComments = (eventId: string) => {
  const { events } = useCalendarStore.getState();
  const event = events.find((e) => e.id === eventId);
  return event?.comments || [];
};

// Test data verification
export const testCommentsFeature = () => {
  const { events } = useCalendarStore.getState();

  // Find events with comments
  const eventsWithComments = events.filter(
    (event) => event.comments.length > 0
  );

  console.log("Events with comments:", eventsWithComments.length);
  console.log(
    "Total comments:",
    events.reduce((total, event) => total + event.comments.length, 0)
  );

  // Test adding a comment
  if (events.length > 0) {
    addCommentToEvent(
      events[0].id,
      "test-user",
      "Test User",
      "This is a test comment"
    );
    console.log("Added test comment to first event");
  }

  return eventsWithComments;
};
