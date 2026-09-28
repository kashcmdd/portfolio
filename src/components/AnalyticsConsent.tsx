import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';

export const AnalyticsConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('analytics_consent') === null) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('analytics_consent', 'true');
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('analytics_consent', 'false');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="liquid-glass-strong rounded-2xl p-4 border border-white/20 text-white shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#89AACC]/20 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-[#89AACC]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-body text-white mb-2">
              Privacy notice: We use Plausible for privacy-focused analytics to understand how visitors use this site.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAccept}
                className="px-3 py-1.5 rounded-full accent-gradient text-black text-xs font-semibold font-body hover:opacity-90 transition-opacity cursor-pointer"
              >
                Accept
              </button>
              <button
                onClick={handleDecline}
                className="px-3 py-1.5 rounded-full liquid-glass text-white text-xs font-medium font-body hover:bg-white/20 transition-colors cursor-pointer"
              >
                Decline
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer text-white/60 hover:text-white shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
