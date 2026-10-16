import React, { Fragment, type ReactNode } from "react";
export function inlineText(text: string): ReactNode {
  const tokens = text.split(
    /(\*\*[^*\n]+\*\*|_[^_\n]+_|\[[^\]\n]+\]\([^\s)]+\))/g,
  );
  return tokens.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("_") && part.endsWith("_"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link && /^(https:\/\/|mailto:|tel:|\/(?!\/))/.test(link[2]))
      return (
        <a
          key={i}
          href={link[2]}
          className="underline underline-offset-4"
          rel={link[2].startsWith("https:") ? "noopener noreferrer" : undefined}
        >
          {link[1]}
        </a>
      );
    return <Fragment key={i}>{part}</Fragment>;
  });
}
export function FormattedText({ text }: { text: string }) {
  return (
    <div className="space-y-5">
      {text.split(/\n\s*\n/).map((block, i) => {
        if (/^#{1,3}\s/.test(block))
          return (
            <h3 key={i} className="text-xl font-medium mt-8">
              {inlineText(block.replace(/^#{1,3}\s+/, ""))}
            </h3>
          );
        if (
          block
            .trim()
            .split("\n")
            .every((line) => /^\s*[-*]\s/.test(line))
        )
          return (
            <ul key={i} className="list-disc pl-6 space-y-2">
              {block
                .trim()
                .split("\n")
                .map((line, j) => (
                  <li key={j}>{inlineText(line.replace(/^\s*[-*]\s/, ""))}</li>
                ))}
            </ul>
          );
        return (
          <p key={i} className="ss-prose whitespace-pre-line">
            {inlineText(block)}
          </p>
        );
      })}
    </div>
  );
}
