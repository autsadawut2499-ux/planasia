"use client";

import { richTextToSafeHtml } from "@/lib/content/rich-text";

interface RichTextProps {
  html: string;
  className?: string;
}

/**
 * Renders sanitized rich HTML from CMS / listing descriptions.
 * Also accepts legacy plain text (auto-converted).
 */
export function RichText({ html, className = "" }: RichTextProps) {
  const safe = richTextToSafeHtml(html);
  if (!safe) return null;

  return (
    <div
      className={`rich-text ${className}`}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
