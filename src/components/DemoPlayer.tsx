import React, { useState, useRef, useEffect } from 'react';
import { X, Maximize2, Minimize2, ExternalLink } from 'lucide-react';

interface DemoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  demoUrl?: string;
  codePenId?: string;
  codeSandboxId?: string;
  description?: string;
}

export const DemoPlayer: React.FC<DemoPlayerProps> = ({
  isOpen,
  onClose,
  title,
  demoUrl,
  codePenId,
  codeSandboxId,
  description,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getEmbedUrl = () => {
    if (codePenId) {
      return `https://codepen.io/embed/${codePenId}?default-tab=result&theme=dark`;
    }
    if (codeSandboxId) {
      return `https://codesandbox.io/embed/${codeSandboxId}?view=preview&theme=dark`;
    }
    return demoUrl;
  };

  const getExternalUrl = () => {
    if (codePenId) {
      return `https://codepen.io/${codePenId}`;
    }
    if (codeSandboxId) {
      return `https://codesandbox.io/s/${codeSandboxId}`;
    }
    return demoUrl;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div
        className={`liquid-glass-strong w-full max-w-6xl flex flex-col overflow-hidden rounded-3xl border border-white/20 text-white shadow-2xl transition-all duration-300 ${
          isFullscreen ? 'h-[95vh]' : 'h-[80vh]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full accent-gradient flex items-center justify-center">
              <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5,3 19,12 5,21 5,3"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-display italic font-semibold">{title}</h3>
              {description && (
                <p className="text-xs text-neutral-400 font-body">{description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={getExternalUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full liquid-glass hover:bg-white/20 transition-colors cursor-pointer text-white/80 hover:text-white"
              aria-label="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-full liquid-glass hover:bg-white/20 transition-colors cursor-pointer text-white/80 hover:text-white"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full liquid-glass hover:bg-white/20 transition-colors cursor-pointer text-white/80 hover:text-white"
              aria-label="Close demo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Demo Content */}
        <div className="flex-1 bg-[#0a0a0a] relative overflow-hidden">
          {getEmbedUrl() ? (
            <iframe
              ref={iframeRef}
              src={getEmbedUrl()}
              title={`${title} Demo`}
              className="w-full h-full border-0"
              allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; xr-spatial-tracking"
              sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full liquid-glass flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#89AACC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <h4 className="text-lg font-body font-semibold text-white mb-2">
                  Demo Coming Soon
                </h4>
                <p className="text-sm text-neutral-400 font-body max-w-md mx-auto">
                  An interactive demo for this project is currently being developed. 
                  Check back soon or explore the live project link.
                </p>
                {getExternalUrl() && (
                  <a
                    href={getExternalUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full accent-gradient text-black font-semibold text-sm font-body hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <span>View Live Project</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 shrink-0">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-body">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Interactive Demo Mode</span>
            </div>
            <div className="flex items-center gap-4">
              {codePenId && <span>Powered by CodePen</span>}
              {codeSandboxId && <span>Powered by CodeSandbox</span>}
              {demoUrl && <span>Custom Demo</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
