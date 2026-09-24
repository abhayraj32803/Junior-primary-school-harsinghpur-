import { useState, useEffect } from 'react';

export interface ScreenSizeInfo {
  width: number;
  height: number;
  isMobile: boolean;          // < 768px
  isSmallMobile: boolean;     // < 480px
  isMediumMobile: boolean;    // >= 480px and < 768px
  isTablet: boolean;          // >= 768px and < 1024px
  isDesktop: boolean;         // >= 1024px
  isLargeDesktop: boolean;    // >= 1280px
  orientation: 'portrait' | 'landscape';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  isTouch: boolean;
}

/**
 * Global dynamic hook to automatically detect device screen size,
 * update layout metrics, and trigger responsive re-renders when
 * window dimensions or orientation change.
 */
export function useScreenSize(): ScreenSizeInfo {
  const getScreenInfo = (): ScreenSizeInfo => {
    if (typeof window === 'undefined') {
      return {
        width: 1200,
        height: 800,
        isMobile: false,
        isSmallMobile: false,
        isMediumMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeDesktop: true,
        orientation: 'landscape',
        deviceType: 'desktop',
        isTouch: false
      };
    }

    const width = window.innerWidth || document.documentElement.clientWidth || 375;
    const height = window.innerHeight || document.documentElement.clientHeight || 667;
    const isSmallMobile = width < 480;
    const isMediumMobile = width >= 480 && width < 768;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;
    const isLargeDesktop = width >= 1280;
    const orientation = width > height ? 'landscape' : 'portrait';
    const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    return {
      width,
      height,
      isMobile,
      isSmallMobile,
      isMediumMobile,
      isTablet,
      isDesktop,
      isLargeDesktop,
      orientation,
      deviceType,
      isTouch
    };
  };

  const [screenInfo, setScreenInfo] = useState<ScreenSizeInfo>(getScreenInfo);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      // Immediate update for responsive layout accuracy
      const info = getScreenInfo();
      setScreenInfo(info);

      // Sync attributes to document root
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        root.setAttribute('data-device', info.deviceType);
        root.setAttribute('data-screen-width', String(info.width));
        root.setAttribute('data-orientation', info.orientation);
        root.style.setProperty('--vw', `${info.width * 0.01}px`);
        root.style.setProperty('--vh', `${info.height * 0.01}px`);
        root.style.setProperty('--screen-w', `${info.width}px`);
        root.style.setProperty('--screen-h', `${info.height}px`);
      }

      // Debounced follow-up for complex reflows
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setScreenInfo(getScreenInfo());
      }, 100);
    };

    handleResize();

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return screenInfo;
}

export default useScreenSize;
