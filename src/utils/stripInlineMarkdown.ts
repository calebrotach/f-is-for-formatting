/**
 * Strips inline markdown formatting (**bold**, __bold__, *italic*) from text
 * so it displays as plain text without literal asterisks.
 */
export function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')   // **bold**
    .replace(/__(.+?)__/g, '$1')       // __bold__
    .replace(/\*(.+?)\*/g, '$1')       // *italic* (but not **)
    .replace(/_(.+?)_/g, '$1')         // _italic_
}
