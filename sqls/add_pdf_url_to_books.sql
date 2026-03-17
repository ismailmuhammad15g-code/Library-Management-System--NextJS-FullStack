-- Migration: Add pdf_url column to books table
-- This column stores the URL to the downloadable PDF version of the book.

ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "pdf_url" text;
