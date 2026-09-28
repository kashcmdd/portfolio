import { useEffect, useState } from 'react';

// Privacy-focused analytics using Plausible
// This component doesn't render anything visible - it just loads the analytics script

interface AnalyticsProps {
  domain?: string;
}

export const Analytics: React.FC<AnalyticsProps> = ({ domain = 'kashcmdd.github.io' }) => {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('analytics_consent');
    setHasConsent(consent === 'true');
  }, []);

  useEffect(() => {
    // Only load analytics in production with user consent
    if (import.meta.env.PROD && hasConsent) {
      const script = document.createElement('script');
      script.src = `https://plausible.io/js/script.js`;
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

// Helper functions for tracking events
export const trackEvent = (eventName: string, props?: Record<string, string | number>) => {
  const consent = localStorage.getItem('analytics_consent');
  if (import.meta.env.PROD && consent === 'true' && (window as any).plausible) {
    (window as any).plausible(eventName, { props });
  }
};

export const trackPageView = (path?: string) => {
  const consent = localStorage.getItem('analytics_consent');
  if (import.meta.env.PROD && consent === 'true' && (window as any).plausible) {
    (window as any).plausible('pageview', { props: { url: path || window.location.pathname } });
  }
};

export const trackOutboundLink = (url: string) => {
  const consent = localStorage.getItem('analytics_consent');
  if (import.meta.env.PROD && consent === 'true' && (window as any).plausible) {
    (window as any).plausible('Outbound Link: Click', { props: { url } });
  }
};

export const trackFileDownload = (filename: string) => {
  const consent = localStorage.getItem('analytics_consent');
  if (import.meta.env.PROD && consent === 'true' && (window as any).plausible) {
    (window as any).plausible('File Download', { props: { filename } });
  }
};
