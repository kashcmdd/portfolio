import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

type Highlighter = {
  highlightCode: (code: string, language: string) => string;
};

const THEME_ID = 'prism-token-theme';

const injectTheme = (css: string) => {
  if (document.getElementById(THEME_ID)) return;
  const style = document.createElement('style');
  style.id = THEME_ID;
  style.textContent = css;
  document.head.appendChild(style);
};

/**
 * One code block, with syntax highlighting and a copy button.
 *
 * The highlighter is imported dynamically rather than statically. Prism and its
 * grammars are larger than everything else on this page combined, and most
 * visitors open an article without ever scrolling to a code sample, so paying
 * for it in the initial bundle would be paying for it on every page load.
 *
 * Until the module resolves the block renders as plain, escaped text, which is
 * the same markup either way — so there is no layout shift when highlighting
 * arrives, only colour.
 */
export const JournalCodeBlock: React.FC<{
  code: string;
  language: string;
  caption?: string;
}> = ({ code, language, caption }) => {
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    import('../../scripts/lib/prism.mjs')
      .then((module) => {
        if (!active) return;
        // The same stylesheet the static article pages inline, so a post looks
        // identical in the app and on its shareable page.
        injectTheme(module.PRISM_TOKEN_CSS);
        setHighlighter(() => module as Highlighter);
      })
      .catch(() => {
        // Highlighting is a bonus; the block still has to be readable.
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => () => {
    if (resetRef.current) clearTimeout(resetRef.current);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (resetRef.current) clearTimeout(resetRef.current);
      resetRef.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      setFailed(true);
    }
  };

  const html = highlighter ? highlighter.highlightCode(code, language) : null;

  return (
    <figure className="my-5">
      <div className="rounded-2xl border border-white/10 bg-black/50 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/[0.02]">
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
            {language}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest text-neutral-500 transition-colors hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8C42] cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-[#9ece6a]" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : failed ? 'Copy failed' : 'Copy'}
          </button>
        </div>
        <pre className="p-4 overflow-x-auto">
          {html ? (
            <code
              className="prism-code font-mono text-xs sm:text-[13px] leading-relaxed text-neutral-200 whitespace-pre"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <code className="font-mono text-xs sm:text-[13px] leading-relaxed text-neutral-200 whitespace-pre">
              {code}
            </code>
          )}
        </pre>
      </div>
      {caption && (
        <figcaption className="mt-2 text-[11px] font-mono text-neutral-500">{caption}</figcaption>
      )}
    </figure>
  );
};
