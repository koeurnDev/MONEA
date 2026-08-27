import { useState, useEffect } from 'react';

export interface MobileDetectionResult {
  isMobile: boolean;
  isTablet: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

export function useMobileDetection(): MobileDetectionResult {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent;
      
      // Mobile detection
      const mobileCheck = width <= 768 || /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      
      // Tablet detection
      const tabletCheck = (width > 768 && width <= 1024) || /iPad|Android(?=.*Mobile)/i.test(userAgent);
      
      setIsMobile(mobileCheck);
      setIsTablet(tabletCheck);
      
      if (mobileCheck) {
        setDeviceType('mobile');
      } else if (tabletCheck) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    // Check on mount
    checkDevice();

    // Check on resize (debounced)
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkDevice, 250);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return { isMobile, isTablet, deviceType };
}