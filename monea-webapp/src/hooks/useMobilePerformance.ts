import { useEffect } from 'react';
import { useMobileDetection } from './useMobileDetection';

/**
 * Mobile Performance Optimization Hook
 * Automatically applies mobile-specific optimizations
 */
export function useMobilePerformance() {
  const { isMobile, deviceType } = useMobileDetection();

  useEffect(() => {
    if (!isMobile) return;

    // Disable heavy animations on mobile
    const disableAnimations = () => {
      const style = document.createElement('style');
      style.id = 'mobile-performance-override';
      style.textContent = `
        @media (max-width: 768px) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          
          /* Keep only essential transitions */
          .mobile-safe-transition {
            transition-duration: 0.2s !important;
          }
        }
      `;
      
      // Remove existing override if any
      const existing = document.getElementById('mobile-performance-override');
      if (existing) {
        existing.remove();
      }
      
      document.head.appendChild(style);
    };

    // Optimize scroll performance
    const optimizeScrolling = () => {
      const scrollableElements = document.querySelectorAll('[style*="overflow"]');
      scrollableElements.forEach((el) => {
        const element = el as HTMLElement;
        if (element.style) {
          // @ts-ignore - webkitOverflowScrolling is a valid iOS property
          element.style.webkitOverflowScrolling = 'touch';
        }
      });
    };

    // Reduce image quality on slow connections
    const optimizeImages = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        const effectiveType = connection?.effectiveType;
        
        // If slow connection (2g, slow-2g), reduce image quality
        if (effectiveType === '2g' || effectiveType === 'slow-2g') {
          document.documentElement.classList.add('slow-connection');
        }
      }
    };

    // Remove heavy features on low-end devices
    const detectLowEndDevice = () => {
      const memory = (performance as any).memory;
      const hardwareConcurrency = navigator.hardwareConcurrency || 4;
      
      // Low-end device detection
      const isLowEnd = 
        hardwareConcurrency <= 2 || 
        (memory && memory.jsHeapSizeLimit < 1000000000); // < 1GB
      
      if (isLowEnd) {
        document.documentElement.classList.add('low-end-device');
        console.log('Low-end device detected - applying optimizations');
      }
    };

    // Apply optimizations
    disableAnimations();
    optimizeScrolling();
    optimizeImages();
    detectLowEndDevice();

    // Monitor scroll events
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      document.body.classList.add('is-scrolling');
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isMobile, deviceType]);

  return { isMobile, deviceType };
}
