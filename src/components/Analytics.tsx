import React, { useEffect, useState } from 'react';
import { readAnalyticsConsent, onAnalyticsConsentChange } from '../utils/analyticsConsent';

// Privacy-focused analytics using Plausible
// This component doesn't render anything visible - it just loads the analytics script

interface AnalyticsProps {
  domain?: string;
}

export const Analytics: React.FC<AnalyticsProps> = ({ domain = 'kashcmdd.github.io' }) => {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    setHasConsent(readAnalyticsConsent() === true);
    // Reading consent once was the bug this replaces: a visitor who accepted
    // from the banner had to reload before anything was tracked. The banner
    // is a separate component, so the decision arrives as an event.
    return onAnalyticsConsentChange(setHasConsent);
  }, []);

  useEffect(() => {
    // Only load analytics in production with user consent
    if (import.meta.env.PROD && hasConsent) {
      const script = document.createElement('script');
      script.src = 'https://plausible.io/js/script.js';
      script.setAttribute('data-domain', domain);
      script.setAttribute('defer', '');
      script.async = true;
      
      document.head.appendChild(script);

      return () => {
        // Also covers a consent reversal: dropping hasConsent runs this and
        // takes the script back out of the document.
        document.head.removeChild(script);
      };
    }
  }, [domain, hasConsent]);

  return null;
};
