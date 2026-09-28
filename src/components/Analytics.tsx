import React, { useEffect, useState } from 'react';

// Privacy-focused analytics using Plausible
// This component doesn't render anything visible - it just loads the analytics script

interface AnalyticsProps {
  domain?: string;
}

export const Analytics: React.FC<AnalyticsProps> = ({ domain = 'kashcmdd-dev.github.io' }) => {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('analytics_consent');
    setHasConsent(consent === 'true');
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
        document.head.removeChild(script);
      };
    }
  }, [domain, hasConsent]);

  return null;
};
