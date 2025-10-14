import React from "react";

// Converts plain text containing URLs into React nodes with clickable links.
// Minimal, frontend-only approach: no server changes required.
export function linkifyTextToNodes(text: string): React.ReactNode[] {
  if (!text) return [];

  const urlRegex = /(https?:\/\/[^\s<>()]+|www\.[^\s<>()]+)/gi;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = urlRegex.exec(text)) !== null) {
    const raw = match[0];
    const start = match.index;

    // Push preceding text
    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }

    // Normalize href: add protocol if starts with www.
    const href = raw.startsWith("www.") ? `https://${raw}` : raw;

    parts.push(
      <a key={`link-${start}-${href}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-primary hover:text-primary/80 break-all" >
        {raw}
      </a>
    );

    lastIndex = start + raw.length;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
