import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import CodeBlock from './CodeBlock';
import { prepareMarkdown } from '../../utils/markdown';

const KATEX_OPTIONS = {
  throwOnError: false,
  errorColor: '#cc0000',
  strict: false,
  trust: true,
};

// Only the grammars the writing actually uses, and no auto-detection, so
// ```text output blocks stay plain.
const HIGHLIGHT_OPTIONS = {
  languages: { python, bash, javascript, json },
  aliases: { python: ['py'], bash: ['sh', 'shell'], javascript: ['js'] },
  detect: false,
  plainText: ['text', 'txt', 'output', 'plaintext'],
};

const components = {
  a: (all) => {
    const { node: _NODE, href = '', children, ...props } = all;
    const external = /^https?:/.test(href);
    return (
      <a href={href} {...props} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {children}
      </a>
    );
  },
  img: (all) => {
    const { node: _NODE, alt = '', ...props } = all;
    return <img alt={alt} loading="lazy" {...props} />;
  },
  pre: CodeBlock,
  // A paragraph that is only an image becomes a <figure>; one that starts
  // with **Figure:** / **Fig. 2.** is styled as that figure's caption.
  p: (all) => {
    const { node, children, ...props } = all;
    const kids = (node?.children ?? []).filter((c) => !(c.type === 'text' && !c.value.trim()));
    if (kids.length === 1 && kids[0].tagName === 'img') return <figure className="md-figure">{children}</figure>;
    const first = kids[0];
    const label = first?.tagName === 'strong' ? first.children?.[0]?.value ?? '' : '';
    if (/^(figure|fig\.?)(\s*\d+)?\s*[:.]?$/i.test(label.trim())) {
      return (
        <p className="figure-caption" {...props}>
          {children}
        </p>
      );
    }
    return <p {...props}>{children}</p>;
  },
};

// Markdown with KaTeX and highlighted code. `raw` skips the legacy newline
// normalisation, which the case-study overviews never needed. KaTeX runs
// before highlighting so math nodes are rendered, not treated as code.
export default function Markdown({ children, className = 'reading', raw = false }) {
  if (!children) return null;
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[
          [rehypeKatex, KATEX_OPTIONS],
          [rehypeHighlight, HIGHLIGHT_OPTIONS],
        ]}
        components={components}
      >
        {raw ? children : prepareMarkdown(children)}
      </ReactMarkdown>
    </div>
  );
}
