import React from "react";

/**
 * A highly robust, lightweight Markdown-to-React parser 
 * fully compatible with React 19. Supports:
 * - Bold (**text**)
 * - Headers (##, ###, #)
 * - Lists (* or - or 1.)
 * - Line breaks
 * - Quote blocks (>)
 * - Divider lines (---)
 */
export function renderMarkdown(markdownText: string): React.ReactNode {
  if (!markdownText) return null;

  const lines = markdownText.split("\n");
  let inList = false;
  let listItems: React.ReactNode[] = [];
  const renderedElements: React.ReactNode[] = [];

  const parseInlineStyles = (text: string): React.ReactNode[] => {
    // Process markdown bold (**text**)
    const parts = text.split(/(\*\*.*?\*\*)/);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="font-bold text-red-500 font-display">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();

    // Horizontal Rule
    if (trimmed === "---") {
      if (inList) {
        renderedElements.push(
          <ul key={`list-${lineIndex}`} className="list-disc pl-6 space-y-1 my-3 text-gray-300">
            {listItems}
          </ul>
        );
        inList = false;
        listItems = [];
      }
      renderedElements.push(<hr key={lineIndex} className="my-6 border-gray-800" />);
      return;
    }

    // Headers
    if (trimmed.startsWith("# ")) {
      if (inList) {
        renderedElements.push(
          <ul key={`list-${lineIndex}`} className="list-disc pl-6 space-y-1 my-3 text-gray-300">
            {listItems}
          </ul>
        );
        inList = false;
        listItems = [];
      }
      renderedElements.push(
        <h1 key={lineIndex} className="text-3xl font-extrabold font-display text-white mt-8 mb-4 border-b border-gray-900 pb-2">
          {parseInlineStyles(trimmed.slice(2))}
        </h1>
      );
      return;
    }

    if (trimmed.startsWith("## ")) {
      if (inList) {
        renderedElements.push(
          <ul key={`list-${lineIndex}`} className="list-disc pl-6 space-y-1 my-3 text-gray-300">
            {listItems}
          </ul>
        );
        inList = false;
        listItems = [];
      }
      renderedElements.push(
        <h2 key={lineIndex} className="text-xl font-bold font-display text-white mt-6 mb-3 border-l-4 border-red-600 pl-3">
          {parseInlineStyles(trimmed.slice(3))}
        </h2>
      );
      return;
    }

    if (trimmed.startsWith("### ")) {
      if (inList) {
        renderedElements.push(
          <ul key={`list-${lineIndex}`} className="list-disc pl-6 space-y-1 my-3 text-gray-300">
            {listItems}
          </ul>
        );
        inList = false;
        listItems = [];
      }
      renderedElements.push(
        <h3 key={lineIndex} className="text-lg font-semibold font-display text-red-400 mt-4 mb-2">
          {parseInlineStyles(trimmed.slice(4))}
        </h3>
      );
      return;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      if (inList) {
        renderedElements.push(
          <ul key={`list-${lineIndex}`} className="list-disc pl-6 space-y-1 my-3 text-gray-300">
            {listItems}
          </ul>
        );
        inList = false;
        listItems = [];
      }
      renderedElements.push(
        <blockquote key={lineIndex} className="border-l-4 border-gray-700 bg-gray-950/40 p-3 italic text-gray-400 my-4 rounded-r">
          {parseInlineStyles(trimmed.slice(2))}
        </blockquote>
      );
      return;
    }

    // Unordered List Items
    const listMatch = trimmed.match(/^[-*+]\s+(.*)/);
    if (listMatch) {
      inList = true;
      listItems.push(
        <li key={`li-${lineIndex}`} className="leading-relaxed">
          {parseInlineStyles(listMatch[1])}
        </li>
      );
      return;
    }

    // Ordered List Items
    const orderedListMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (orderedListMatch) {
      inList = true;
      listItems.push(
        <li key={`li-${lineIndex}`} className="list-decimal ml-2 leading-relaxed">
          {parseInlineStyles(orderedListMatch[2])}
        </li>
      );
      return;
    }

    // Empty lines
    if (trimmed === "") {
      if (inList) {
        renderedElements.push(
          <ul key={`list-${lineIndex}`} className="list-disc pl-6 space-y-1 my-3 text-gray-300">
            {listItems}
          </ul>
        );
        inList = false;
        listItems = [];
      }
      return;
    }

    // Normal paragraph
    if (inList) {
      // If we are currently compiling a list, but this line is not a list item, break list
      renderedElements.push(
        <ul key={`list-${lineIndex}`} className="list-disc pl-6 space-y-1 my-3 text-gray-300">
          {listItems}
        </ul>
      );
      inList = false;
      listItems = [];
    }

    renderedElements.push(
      <p key={lineIndex} className="text-gray-300 leading-relaxed text-sm mb-3">
        {parseInlineStyles(trimmed)}
      </p>
    );
  });

  // Render any remaining list items
  if (inList && listItems.length > 0) {
    renderedElements.push(
      <ul key="list-final" className="list-disc pl-6 space-y-1 my-3 text-gray-300">
        {listItems}
      </ul>
    );
  }

  return <div className="space-y-1">{renderedElements}</div>;
}
