import { useCallback, useRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';

export interface CodeBlockProps extends HTMLAttributes<HTMLPreElement> {
  /**
   * The code. Copied verbatim from the rendered `<pre>` via `innerText`, so
   * whatever is here is what lands in the reader's clipboard — including
   * leading indentation, which is worth trimming at the call site.
   */
  children: ReactNode;
  /** Filename or caption shown in the header bar. */
  title?: string;
  /** Language tag shown on the right of the header bar. */
  language?: string;
  /** Hide the copy button (e.g. for output-only samples). */
  copyable?: boolean;
  /** Extra classes on the wrapper, not the `<pre>`. */
  className?: string;
}

/**
 * Fenced code block with a copy button and an optional filename bar.
 *
 * The copy ref sits on the `<pre>` rather than the outer wrapper so the
 * button's own label never ends up in the clipboard — an easy thing to get
 * wrong when the control is rendered inside the measured element.
 *
 * The button is always in the DOM (revealed on hover/focus via CSS) instead of
 * being conditionally rendered on hover: a mount-on-hover button cannot be
 * reached by keyboard at all.
 */
export function CodeBlock({
  children,
  title,
  language,
  copyable = true,
  className = '',
  ...rest
}: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const { copied, copy } = useCopyToClipboard();

  const onCopy = useCallback(() => {
    const text = preRef.current?.innerText ?? '';
    if (text) void copy(text);
  }, [copy]);

  return (
    <div className={`docs-codeblock ${className}`.trim()}>
      {(title || language) && (
        <div className="docs-codeblock-bar">
          {title && <span className="docs-codeblock-title">{title}</span>}
          {language && <span className="docs-codeblock-lang">{language}</span>}
        </div>
      )}

      <div className="docs-codeblock-body">
        {copyable && (
          <button
            type="button"
            onClick={onCopy}
            className="docs-codeblock-copy"
            data-copied={copied ? 'true' : undefined}
            aria-label={copied ? 'Copied' : 'Copy code'}
            title={copied ? 'Copied!' : 'Copy code'}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        )}
        <pre ref={preRef} {...rest}>
          {children}
        </pre>
      </div>
    </div>
  );
}

export default CodeBlock;
