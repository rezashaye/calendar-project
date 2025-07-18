"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Stack,
  Chip,
  useTheme,
} from "@mui/material";
import {
  Send as SendIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Comment as CommentIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { Comment } from "../stores/calendarStore";
import { companyMembers } from "../mocks/companyMembers";
import moment from "moment-jalaali";

interface CommentsSectionProps {
  comments: Comment[];
  onAddComment: (comment: Omit<Comment, "id">) => void;
  onUpdateComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  currentUserId?: string;
  maxHeight?: number;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  currentUserId = "current-user",
  maxHeight = 200,
}) => {
  const theme = useTheme();
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  // Get current user info
  const currentUser = companyMembers.find(
    (member) => member.id === currentUserId
  ) || {
    id: currentUserId,
    name: "کاربر فعلی",
    email: "current@user.com",
    type: "member" as const,
    avatar: undefined,
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment({
        authorId: currentUserId,
        authorName: currentUser.name,
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
      });
      setNewComment("");
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const handleSaveEdit = () => {
    if (editingCommentId && editingContent.trim()) {
      onUpdateComment(editingCommentId, editingContent.trim());
      setEditingCommentId(null);
      setEditingContent("");
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  const handleDeleteComment = (commentId: string) => {
    onDeleteComment(commentId);
  };

  const formatDate = (dateString: string) => {
    const date = moment(dateString);
    const now = moment();
    const diffMinutes = now.diff(date, "minutes");

    if (diffMinutes < 1) {
      return "همین الان";
    } else if (diffMinutes < 60) {
      return `${diffMinutes} دقیقه قبل`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)} ساعت قبل`;
    } else if (diffMinutes < 10080) {
      return `${Math.floor(diffMinutes / 1440)} روز قبل`;
    } else {
      return date.format("jYYYY/jMM/jDD");
    }
  };

  // Sort comments by creation date (newest first)
  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{ mb: 2, display: "flex", alignItems: "center" }}
      >
        <CommentIcon sx={{ mr: 1, fontSize: 16 }} />
        نظرات ({comments.length})
      </Typography>

      {/* Add New Comment */}
      <Card
        variant="outlined"
        sx={{
          mb: 2,
          backgroundColor:
            theme.palette.mode === "light" ? "#f8f9fa" : "#2d3748",
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
            <Avatar
              src={currentUser.avatar}
              alt={currentUser.name}
              sx={{ width: 32, height: 32, fontSize: 14 }}
            >
              {currentUser.name.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <TextField
                multiline
                rows={2}
                fullWidth
                placeholder="نظر خود را بنویسید..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: theme.palette.background.paper,
                  },
                }}
              />
              <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  startIcon={<SendIcon />}
                >
                  ارسال
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Comments List */}
      <Box
        sx={{
          maxHeight: maxHeight,
          overflowY: "auto",
          "& .MuiCard-root:last-child": {
            mb: 0,
          },
        }}
      >
        {sortedComments.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 3,
              color: "text.secondary",
            }}
          >
            <CommentIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2">هنوز نظری ثبت نشده است</Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {sortedComments.map((comment) => (
              <Card key={comment.id} variant="outlined">
                <CardContent sx={{ p: 2 }}>
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                  >
                    <Avatar
                      src={
                        companyMembers.find((m) => m.id === comment.authorId)
                          ?.avatar
                      }
                      alt={comment.authorName}
                      sx={{ width: 32, height: 32, fontSize: 14 }}
                    >
                      {comment.authorName.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600 }}
                          >
                            {comment.authorName}
                          </Typography>
                          <Chip
                            label={formatDate(comment.createdAt)}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: 11, height: 20 }}
                          />
                          {comment.updatedAt && (
                            <Chip
                              label="ویرایش شده"
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ fontSize: 11, height: 20 }}
                            />
                          )}
                        </Box>

                        {/* Action buttons for comment author */}
                        {comment.authorId === currentUserId && (
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleEditComment(comment)}
                              sx={{ color: "primary.main" }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteComment(comment.id)}
                              sx={{ color: "error.main" }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>

                      {/* Comment Content */}
                      {editingCommentId === comment.id ? (
                        <Box>
                          <TextField
                            multiline
                            rows={2}
                            fullWidth
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            variant="outlined"
                            size="small"
                            sx={{ mb: 1 }}
                          />
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              justifyContent: "flex-end",
                            }}
                          >
                            <Button
                              size="small"
                              onClick={handleCancelEdit}
                              startIcon={<CancelIcon />}
                            >
                              انصراف
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={handleSaveEdit}
                              disabled={!editingContent.trim()}
                              startIcon={<SaveIcon />}
                            >
                              ذخیره
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                          {comment.content}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default CommentsSection;
