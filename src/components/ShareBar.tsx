import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Linkedin, Share2 } from 'lucide-react';
import { shareTargets } from '../utils/share';

interface ShareBarProps {
  url: string;
  title: string;
  className?: string;
}

// A shared link is only useful if the URL is the canonical one, so this always
// links out to the generated static page rather than to the SPA hash route.
export const ShareBar: React.FC<ShareBarProps> = ({ url, title, className = '' }) => {
  const [copied, setCopied] = useState(false);
  // The "Copied" label resets on a timer; clearing it on unmount stops a state
  // update on a dialog that has already closed.
  const resetTimer = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    },
    []
  );
  const targets = shareTargets(url, title);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard access is refused in some contexts (insecure origin, older
      // permission model). A textarea + execCommand still works, and if that
      // fails too there is nothing sensible left to do but not claim success.
      const field = document.createElement('textarea');
      field.value = url;
      field.setAttribute('readonly', '');
      field.style.position = 'absolute';
      field.style.left = '-9999px';
      document.body.appendChild(field);
      field.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(field);
      if (!ok) return;
    }
    setCopied(true);
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  const buttonClass =
    'inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#150f22] px-3.5 py-2 text-xs font-body text-neutral-300 transition-colors hover:bg-[#211832] hover:border-white/20 hover:text-white cursor-pointer';

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-[11px] font-body uppercase tracking-widest text-neutral-500 mr-1">
        <Share2 className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" aria-hidden="true" />
        Share
      </span>

      <a
        href={targets.x}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
      >
        <span aria-hidden="true">X</span>
        <span className="sr-only">Share {title} on X</span>
      </a>

      <a
        href={targets.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
      >
        <Linkedin className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="sr-only">Share {title} on LinkedIn</span>
      </a>

      <button type="button" onClick={copyLink} className={buttonClass}>
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
        ) : (
          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
        )}
        <span>{copied ? 'Copied' : 'Copy link'}</span>
        <span className="sr-only"> for {title}</span>
      </button>

      {/* The copy button's only feedback is visual, so announce it too. */}
      <span aria-live="polite" className="sr-only">
        {copied ? 'Link copied to clipboard' : ''}
      </span>
    </div>
  );
};

export default ShareBar;
