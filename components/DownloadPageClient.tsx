"use client";

/**
 * DownloadPageClient Component
 *
 * Client component for the book download page.
 * Implements a 9-second countdown timer before enabling download.
 * After the timer expires, auto-triggers the download and reveals a comment form.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Download, ArrowLeft, CheckCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookCover from "@/components/BookCover";
import { createComment } from "@/lib/actions/comment";

const COUNTDOWN_SECONDS = 9;

interface DownloadPageClientProps {
  bookId: string;
  title: string;
  author: string;
  coverColor: string;
  coverUrl: string;
  pdfUrl: string;
  userId?: string;
}

const DownloadPageClient: React.FC<DownloadPageClientProps> = ({
  bookId,
  title,
  author,
  coverColor,
  coverUrl,
  pdfUrl,
  userId,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [downloadTriggered, setDownloadTriggered] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [commentStatus, setCommentStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [commentError, setCommentError] = useState("");
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);
  const commentSectionRef = useRef<HTMLDivElement>(null);

  const triggerDownload = useCallback(() => {
    if (!downloadTriggered) {
      setDownloadTriggered(true);
      setShowComment(true);
      // Programmatically click the hidden anchor to start the download
      if (downloadLinkRef.current) {
        downloadLinkRef.current.click();
      }
    }
  }, [downloadTriggered]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      triggerDownload();
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft, triggerDownload]);

  // Scroll comment section into view when it appears
  useEffect(() => {
    if (showComment && commentSectionRef.current) {
      setTimeout(() => {
        commentSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    }
  }, [showComment]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) return;

    setCommentStatus("submitting");
    setCommentError("");

    const result = await createComment({ bookId, content: comment });

    if (result.success) {
      setCommentStatus("success");
      setComment("");
    } else {
      setCommentStatus("error");
      setCommentError(result.error || "Failed to submit comment");
    }
  };

  // Circumference of the SVG circle for the countdown ring
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress =
    secondsLeft > 0
      ? ((COUNTDOWN_SECONDS - secondsLeft) / COUNTDOWN_SECONDS) * circumference
      : circumference;

  return (
    <div className="root-container">
      {/* Hidden download anchor – programmatically clicked when timer ends */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a
        ref={downloadLinkRef}
        href={pdfUrl}
        download={`${title}.pdf`}
        target="_blank"
        rel="noopener noreferrer"
        className="sr-only"
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-3xl py-8 sm:py-12">
        {/* Back button */}
        <Button
          asChild
          variant="ghost"
          className="mb-6 text-light-100 hover:bg-dark-300 hover:text-primary"
        >
          <Link href={`/books/${bookId}`}>
            <ArrowLeft className="mr-2 size-4" />
            Back to Book
          </Link>
        </Button>

        {/* Page header */}
        <h1 className="mb-8 font-bebas-neue text-3xl text-white sm:text-4xl">
          Download &amp; Read
        </h1>

        {/* Main card */}
        <div className="gradient-vertical rounded-2xl border border-dark-600 p-6 sm:p-10">
          {/* Book preview */}
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-10">
            <div className="shrink-0">
              <BookCover
                variant="medium"
                coverColor={coverColor}
                coverImage={coverUrl}
              />
            </div>

            <div className="flex flex-col gap-3 text-center sm:text-left">
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                {title}
              </h2>
              <p className="text-base text-light-100">
                By{" "}
                <span className="font-semibold text-light-200">{author}</span>
              </p>
              <p className="text-sm text-light-100/70">
                Your download will start automatically once the timer reaches
                zero.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="my-8 h-px bg-dark-600" />

          {/* Countdown + Download section */}
          <div className="flex flex-col items-center gap-6">
            {!downloadTriggered ? (
              <>
                <p className="text-center text-sm font-semibold uppercase tracking-widest text-light-100">
                  Download starts in
                </p>

                {/* Circular countdown */}
                <div className="relative flex items-center justify-center">
                  <svg
                    width="140"
                    height="140"
                    viewBox="0 0 140 140"
                    className="-rotate-90"
                    aria-hidden="true"
                  >
                    {/* Background ring */}
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke="#333C5C"
                      strokeWidth="8"
                    />
                    {/* Progress ring */}
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke="#e7c9a5"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference - progress}
                      style={{ transition: "stroke-dashoffset 0.95s linear" }}
                    />
                  </svg>
                  <span className="absolute text-4xl font-bold text-primary">
                    {secondsLeft}
                  </span>
                </div>

                <p className="text-xs text-light-100/50">
                  Please wait while we prepare your file…
                </p>
              </>
            ) : (
              <>
                {/* Download triggered state */}
                <div className="flex flex-col items-center gap-3">
                  <CheckCircle className="size-12 text-green-500" />
                  <p className="text-center text-base font-semibold text-white">
                    Your download has started!
                  </p>
                  <p className="text-center text-sm text-light-100/70">
                    If it didn&apos;t start automatically, click the button
                    below.
                  </p>
                </div>
              </>
            )}

            {/* Download button – disabled until countdown is done */}
            <Button
              asChild={downloadTriggered}
              disabled={!downloadTriggered}
              className={`min-h-12 w-full max-w-xs font-bebas-neue text-xl transition-all duration-300 sm:w-auto ${
                downloadTriggered
                  ? "bg-primary text-dark-100 hover:bg-primary/90"
                  : "cursor-not-allowed bg-dark-600 text-light-100/40"
              }`}
            >
              {downloadTriggered ? (
                <a
                  href={pdfUrl}
                  download={`${title}.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="mr-2 size-5" />
                  Download Now
                </a>
              ) : (
                <span>
                  <Download className="mr-2 inline-block size-5" />
                  Download Now
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Comment section – revealed after download */}
        {showComment && (
          <div
            ref={commentSectionRef}
            className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div className="gradient-vertical rounded-2xl border border-dark-600 p-6 sm:p-10">
              <div className="mb-5 flex items-center gap-3">
                <MessageSquare className="size-5 text-primary" />
                <h3 className="text-xl font-semibold text-white">
                  Leave a Comment
                </h3>
              </div>

              <p className="mb-6 text-sm text-light-100/70">
                Enjoyed the book? Share your thoughts with other readers.
              </p>

              {commentStatus === "success" ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-green-800/30 bg-green-900/20 py-8">
                  <CheckCircle className="size-10 text-green-500" />
                  <p className="text-base font-semibold text-white">
                    Thank you for your comment!
                  </p>
                  <p className="text-sm text-light-100/70">
                    Your feedback helps other readers discover great books.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={
                    userId ? handleCommentSubmit : (e) => e.preventDefault()
                  }
                  className="space-y-4"
                >
                  {!userId && (
                    <div className="rounded-lg border border-dark-600 bg-dark-300 p-4 text-center">
                      <p className="text-sm text-light-100">
                        Please{" "}
                        <Link
                          href="/sign-in"
                          className="font-semibold text-primary underline hover:text-primary/80"
                        >
                          sign in
                        </Link>{" "}
                        to leave a comment.
                      </p>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="comment"
                      className="mb-2 block text-sm font-medium text-light-200"
                    >
                      Your Comment
                    </label>
                    <textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts about this book…"
                      rows={4}
                      maxLength={1000}
                      disabled={!userId || commentStatus === "submitting"}
                      className="w-full rounded-lg border border-dark-600 bg-dark-300 px-4 py-3 text-sm text-light-100 placeholder:text-light-100/40 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <p className="mt-1 text-right text-xs text-light-100/40">
                      {comment.length}/1000
                    </p>
                  </div>

                  {commentError && (
                    <p className="text-sm text-red-400">{commentError}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={
                      !userId ||
                      !comment.trim() ||
                      commentStatus === "submitting"
                    }
                    className="min-h-11 w-full bg-primary font-bebas-neue text-lg text-dark-100 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
                  >
                    {commentStatus === "submitting"
                      ? "Submitting…"
                      : "Submit Comment"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadPageClient;
