/**
 * Markdown & Text formatting utilities
 */

/**
 * Automatically capitalizes the first letter of sentences:
 * - Start of documents and new lines/paragraphs (with markdown list/heading/quote prefixes)
 * - After sentence-ending punctuation (. ! ?) followed by whitespace
 * - Preserves code blocks (```...```) and inline code (`...`) completely intact
 * - Avoids capitalizing abbreviations like e.g., i.e., etc., vs., Dr., Mr.
 */
export function autoCapitalizeSentences(text: string): string {
  if (!text) return text;

  // Split by code blocks (```...```) to protect code fences
  const codeBlockRegex = /(```[\s\S]*?```)/g;
  const parts = text.split(codeBlockRegex);

  return parts
    .map((part, index) => {
      // Odd indices are inside ``` code blocks ```
      if (index % 2 === 1) {
        return part;
      }

      // Protect inline code blocks (`...`)
      const inlineCodeRegex = /(`[^`\n]+`)/g;
      const inlineParts = part.split(inlineCodeRegex);

      return inlineParts
        .map((subPart, subIndex) => {
          // Odd indices are inside inline `code`
          if (subIndex % 2 === 1) {
            return subPart;
          }

          // 1. Capitalize start of lines / paragraphs with optional markdown prefix
          // Matches:
          // - direct line start: "hello world" -> "Hello world"
          // - headings: "# heading" -> "# Heading"
          // - blockquotes: "> quote" -> "> Quote"
          // - lists: "- item", "* item", "+ item" -> "- Item"
          // - numbered lists: "1. item" -> "1. Item"
          // - task lists: "- [ ] task" -> "- [ ] Task"
          let res = subPart.replace(
            /(^|\n)(\s*(?:>+\s*|[-*+]\s+(?:\[[ xX]\]\s+)?|\d+\.\s+|#{1,6}\s+)?)([a-z])/g,
            (_, lineBreak, prefix, char) => `${lineBreak}${prefix}${char.toUpperCase()}`
          );

          // 2. Capitalize after sentence-ending punctuation (. ! ?) followed by whitespace
          // Preserves common abbreviations like e.g., i.e., etc., vs., dr., mr., mrs.
          res = res.replace(
            /(?<!\b(?:e\.g|i\.e|etc|vs|dr|mr|mrs|ms|prof|inc|ltd|est|fig))\b([.!?]["'”’)]?\s+)([a-z])/gi,
            (_, punctAndSpace, char) => `${punctAndSpace}${char.toUpperCase()}`
          );

          return res;
        })
        .join('');
    })
    .join('');
}
