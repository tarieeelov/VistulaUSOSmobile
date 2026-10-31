import { Platform } from 'react-native';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GA_MEASUREMENT_ID = 'G-XPRY66PDBL';

/**
 * Sends a page_view event to Google Analytics 4 on web.
 */
export function trackPageView(pathname: string) {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
}

/**
 * Sends custom events to Google Analytics 4 on web.
 */
export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}
