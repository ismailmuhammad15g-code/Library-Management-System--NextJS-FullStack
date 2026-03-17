"use server";

import { db } from "@/database/drizzle";
import { comments } from "@/database/schema";
import { auth } from "@/auth";

export interface CreateCommentParams {
  bookId: string;
  content: string;
}

export interface CreateCommentResponse {
  success: boolean;
  data?: {
    id: string;
    userId: string;
    bookId: string;
    content: string;
    createdAt: Date | null;
  };
  error?: string;
}

/**
 * Creates a comment for a book after a user downloads/reads it.
 * Requires the user to be authenticated.
 */
export const createComment = async (
  params: CreateCommentParams
): Promise<CreateCommentResponse> => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in to leave a comment",
      };
    }

    const { bookId, content } = params;

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return { success: false, error: "Comment cannot be empty" };
    }

    if (trimmedContent.length > 1000) {
      return {
        success: false,
        error: "Comment must be 1000 characters or fewer",
      };
    }

    const [comment] = await db
      .insert(comments)
      .values({
        userId: session.user.id,
        bookId,
        content: trimmedContent,
      })
      .returning();

    return { success: true, data: comment };
  } catch (error) {
    console.error("Error creating comment:", error);
    return { success: false, error: "Failed to save your comment" };
  }
};
