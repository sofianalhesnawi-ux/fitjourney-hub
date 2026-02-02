import { useEffect, useState, useRef, RefObject } from 'react';

interface ParallaxOptions {
  speed?: number;
  direction?: 'up' | 'down';
  threshold?: number;
}

export function useParallax<T extends HTMLElement>(
  options: ParallaxOptions = {}
): { ref: RefObject<T>; offset: number; opacity: number } {
  const { speed = 0.3, direction = 'up', threshold = 0.1 } = options;
  const ref = useRef<T>(null);
  const [offset, setOffset] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far the element is from the center of the viewport
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      const distanceFromCenter = elementCenter - viewportCenter;
      
      // Apply parallax only when element is in view
      if (rect.bottom > 0 && rect.top < windowHeight) {
        const movement = distanceFromCenter * speed * (direction === 'up' ? 1 : -1);
        setOffset(movement);
        
        // Calculate opacity based on visibility
        const visibleRatio = Math.min(
          (windowHeight - rect.top) / windowHeight,
          (rect.bottom) / windowHeight,
          1
        );
        setOpacity(Math.max(0.3, Math.min(1, visibleRatio * 1.5)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, direction, threshold]);

  return { ref: ref as RefObject<T>, offset, opacity };
}

export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? scrollTop / docHeight : 0;
      setProgress(Math.min(1, Math.max(0, scrollProgress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return progress;
}

export function useInViewAnimation(threshold = 0.1): {
  ref: RefObject<HTMLDivElement>;
  isInView: boolean;
} {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}
