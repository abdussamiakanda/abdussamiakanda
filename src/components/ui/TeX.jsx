import { useEffect, useState } from 'react';

/**
 * Renders a LaTeX expression with KaTeX. KaTeX is imported on demand so it
 * stays out of the main bundle; `fallback` shows until it has loaded.
 */
export default function TeX({ children, display = false, fallback = null, className = '' }) {
  const [html, setHtml] = useState(null);

  useEffect(() => {
    let alive = true;
    import('katex')
      .then(({ default: katex }) => {
        if (alive) setHtml(katex.renderToString(children, { displayMode: display, throwOnError: false }));
      })
      .catch(console.error);
    return () => {
      alive = false;
    };
  }, [children, display]);

  const Tag = display ? 'div' : 'span';
  if (!html) return <Tag className={className}>{fallback ?? children}</Tag>;
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
