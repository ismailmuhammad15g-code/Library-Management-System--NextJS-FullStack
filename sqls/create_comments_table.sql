-- Migration: Create comments table
-- Stores user comments left after downloading/reading a book.

CREATE TABLE IF NOT EXISTS "comments" (
    "id"         uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id"    uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "book_id"    uuid NOT NULL REFERENCES "books"("id") ON DELETE CASCADE,
    "content"    text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "comments_id_unique" UNIQUE("id")
);
