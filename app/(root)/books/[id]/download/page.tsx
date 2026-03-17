import React from "react";
import { redirect } from "next/navigation";
import { db } from "@/database/drizzle";
import { books } from "@/database/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import DownloadPageClient from "@/components/DownloadPageClient";

const DownloadPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const session = await auth();

  // Fetch book details
  const [book] = await db
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      coverColor: books.coverColor,
      coverUrl: books.coverUrl,
      pdfUrl: books.pdfUrl,
      isActive: books.isActive,
    })
    .from(books)
    .where(eq(books.id, id))
    .limit(1);

  if (!book) redirect("/404");

  // If the book has no PDF URL, redirect back to the book detail page
  if (!book.pdfUrl) redirect(`/books/${id}`);

  return (
    <DownloadPageClient
      bookId={book.id}
      title={book.title}
      author={book.author}
      coverColor={book.coverColor}
      coverUrl={book.coverUrl}
      pdfUrl={book.pdfUrl}
      userId={session?.user?.id}
    />
  );
};

export default DownloadPage;
