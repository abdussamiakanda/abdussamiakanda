// Spans left untouched: fenced code, inline code, then display math before
// inline math so a `$$...$$` block is never split by the inline rule. Code
// comes first so a `$` inside code is not mistaken for math.
const PROTECTED_SPAN = /```[\s\S]*?```|`[^`\n]+`|\$\$[\s\S]*?\$\$|\$[^$\n]+?\$/g;

/**
 * Normalises stored content for <ReactMarkdown>.
 *
 * Entries written through the old editor stored newlines as the two literal
 * characters `\` and `n`, so those have to be unescaped here. Applying that
 * unescape to the whole string also rewrites LaTeX commands that begin with
 * `\n` — `\nabla`, `\neq`, `\nu`, `\not` — which corrupts the equation and,
 * for display math, breaks the `$$` pairing so the rest of the block leaks out
 * as raw text. Every transform therefore runs only outside math spans, and
 * outside code, where added hard-break spaces would end up in the code itself.
 */
export function prepareMarkdown(content) {
  if (!content) return '';

  const normalise = (text) =>
    text
      // Escaped double newline -> paragraph break.
      .replace(/\\n\\n/g, '\n\n')
      // Remaining escaped newline -> markdown hard break.
      .replace(/\\n/g, '  \n')
      // A real single newline is a hard break too (double newlines are left
      // alone so paragraphs survive).
      .replace(/([^\n])\n([^\n])/g, '$1  \n$2');

  let out = '';
  let last = 0;
  for (const match of content.matchAll(PROTECTED_SPAN)) {
    out += normalise(content.slice(last, match.index)) + match[0];
    last = match.index + match[0].length;
  }
  return out + normalise(content.slice(last));
}

export default prepareMarkdown;
