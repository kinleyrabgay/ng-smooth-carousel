/**
 * Easing functions for animations
 */
export const easings = {
  linear: (t: number) => t,
  ease: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
};

/**
 * Converts a CSS timing function to its JavaScript equivalent
 * @param timingFunction CSS timing function string
 */
export function getCssTimingFunction(timingFunction: string): (t: number) => number {
  switch (timingFunction) {
    case 'linear': return easings.linear;
    case 'ease-in': return easings.easeInQuad;
    case 'ease-out': return easings.easeOutQuad;
    case 'ease-in-out': return easings.easeInOutQuad;
    case 'ease': return easings.ease;
    default:
      return easings.easeInOutQuad;
  }
}

/**
 * Creates a CSS transform string for translating elements
 * 
 * @param position - Translation position in pixels
 * @param isVertical - Whether to use vertical translation
 * @returns CSS transform string
 */
export function createTranslation(position: number, isVertical: boolean): string {
  return isVertical 
    ? `translateY(-${position}px)` 
    : `translateX(-${position}px)`;
}

/**
 * Parse time string to milliseconds
 * @param time Time string in the format: '300ms' or '0.3s'
 * @param defaultValue Default value in ms
 * @returns Time in milliseconds
 */
export function parseTimeToMs(time: string | undefined, defaultValue: number = 300): number {
  if (!time) return defaultValue;
  
  if (time.endsWith('ms')) {
    return parseInt(time, 10);
  } else if (time.endsWith('s')) {
    return parseFloat(time) * 1000;
  }
  
  return parseInt(time, 10) || defaultValue;
}

/**
 * Calculate scroll amount based on configuration
 * @param scrollSize Scroll size specification
 * @param containerSize Container width or height
 * @param scrollSizeMap Map of predefined scroll sizes
 * @param defaultPercentage Default percentage if no size specified
 * @returns Scroll amount in pixels
 */
export function calculateScrollAmount(
  scrollSize: string | undefined, 
  containerSize: number,
  scrollSizeMap: Record<string, number>,
  defaultPercentage: number = 0.8
): number {
  if (!scrollSize) return containerSize * defaultPercentage;
  
  // If size is a percentage
  if (scrollSize.endsWith('%')) {
    const percentage: number = parseFloat(scrollSize) / 100;
    return containerSize * percentage;
  }
  
  // If size is a predefined value
  if (scrollSizeMap[scrollSize]) {
    return scrollSizeMap[scrollSize];
  }
  
  // If size is a pixel value
  if (scrollSize.endsWith('px')) {
    return parseFloat(scrollSize);
  }
  
  return containerSize * defaultPercentage;
}

/**
 * Performs a smooth scroll animation
 * @param element Element to scroll
 * @param to Target scroll position
 * @param duration Duration in milliseconds
 * @param easing Easing function
 */
export function smoothScroll(
  element: HTMLElement,
  to: number,
  duration: number = 300,
  easing: (t: number) => number = easings.easeInOutQuad
): Promise<void> {
  return new Promise(resolve => {
    const start = element.scrollLeft;
    const change = to - start;
    const startTime = performance.now();
    
    function animateScroll(currentTime: number) {
      const elapsedTime = currentTime - startTime;
      if (elapsedTime >= duration) {
        element.scrollLeft = to;
        resolve();
        return;
      }
      
      const progress = elapsedTime / duration;
      const easedProgress = easing(progress);
      element.scrollLeft = start + change * easedProgress;
      
      requestAnimationFrame(animateScroll);
    }
    
    requestAnimationFrame(animateScroll);
  });
}

/**
 * Performs a smooth vertical scroll animation
 * @param element Element to scroll
 * @param to Target scroll position
 * @param duration Duration in milliseconds
 * @param easing Easing function
 */
export function smoothScrollVertical(
  element: HTMLElement,
  to: number,
  duration: number = 300,
  easing: (t: number) => number = easings.easeInOutQuad
): Promise<void> {
  return new Promise(resolve => {
    const start = element.scrollTop;
    const change = to - start;
    const startTime = performance.now();
    
    function animateScroll(currentTime: number) {
      const elapsedTime = currentTime - startTime;
      if (elapsedTime >= duration) {
        element.scrollTop = to;
        resolve();
        return;
      }
      
      const progress = elapsedTime / duration;
      const easedProgress = easing(progress);
      element.scrollTop = start + change * easedProgress;
      
      requestAnimationFrame(animateScroll);
    }
    
    requestAnimationFrame(animateScroll);
  });
} 