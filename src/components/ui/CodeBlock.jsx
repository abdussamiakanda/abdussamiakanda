import { useRef, useState } from 'react';
import { FiCheck, FiCopy } from 'react-icons/fi';

const LABELS = { python: 'Python', py: 'Python', bash: 'Bash', sh: 'Shell', js: 'JavaScript', javascript: 'JavaScript', json: 'JSON' };
const OUTPUT = new Set(['text', 'txt', 'output', 'plaintext']);

// Fenced code with a header bar: language label and a copy button.
// ```text blocks are treated as program output and styled quieter.
export default function CodeBlock(all) {
  const { node: _NODE, children, ...props } = all;
  const ref = useRef(null);
  const [copied, setCopied] = useState(false);

  const codeClass = children?.props?.className ?? '';
  const lang = codeClass.match(/language-(\S+)/)?.[1]?.toLowerCase() ?? '';
  const isOutput = OUTPUT.has(lang);
  const label = isOutput ? 'Output' : LABELS[lang] ?? (lang || 'Code');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ref.current?.innerText ?? '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <figure className={`code-block not-prose ${isOutput ? 'is-output' : ''}`}>
      <figcaption className="code-block__bar">
        <span className="code-block__lang">
          <span className="code-block__dot" />
          {label}
        </span>
        <button type="button" onClick={copy} className="code-block__copy" aria-label={copied ? 'Copied' : 'Copy code'}>
          {copied ? <FiCheck /> : <FiCopy />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </figcaption>
      <pre ref={ref} {...props}>
        {children}
      </pre>
    </figure>
  );
}
