/**
 * Rich-text helpers — TipTap stores HTML; legacy CMS may still be plain text.
 */

import DOMPurify from "isomorphic-dompurify";

const HTML_TAG_RE = /<\/?[a-z][\s\S]*>/i;

export function looksLikeHtml(value: string): boolean {
  return HTML_TAG_RE.test(value.trim());
}

/** Escape plain text and wrap blank-line paragraphs as <p> / short lines as <h2>. */
export function plainTextToHtml(plain: string): string {
  const parts = plain
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0) return "<p></p>";

  return parts
    .map((text) => {
      const isHeading =
        text.length < 80 &&
        !text.includes(". ") &&
        !text.endsWith(".") &&
        !text.endsWith("。") &&
        text.split("\n").length === 1;
      const escaped = escapeHtml(text).replace(/\n/g, "<br>");
      return isHeading ? `<h2>${escaped}</h2>` : `<p>${escaped}</p>`;
    })
    .join("");
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Normalize editor input: plain → HTML, already HTML → sanitize. */
export function toEditorHtml(value: string): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "";
  if (looksLikeHtml(trimmed)) return sanitizeRichHtml(trimmed);
  return plainTextToHtml(trimmed);
}

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
];

const ALLOWED_ATTR = ["href", "target", "rel", "class"];

export function sanitizeRichHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}

/** Public render helper: HTML if present, otherwise convert legacy plain text. */
export function richTextToSafeHtml(value: string): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "";
  if (looksLikeHtml(trimmed)) return sanitizeRichHtml(trimmed);
  return sanitizeRichHtml(plainTextToHtml(trimmed));
}
