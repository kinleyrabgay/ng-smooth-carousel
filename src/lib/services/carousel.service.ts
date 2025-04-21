import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NavButtonShape, IndicatorStyle } from '../interfaces/carousel-config.interface';

/**
 * Default carousel configuration values
 */
export const CAROUSEL_DEFAULTS = {
  NAVIGATION_SIZE: '32px',
  CONTENT_PADDING: '10px',
  ANIMATION_DURATION: '300ms',
  ANIMATION_TIMING: 'ease',
  EMPTY_STATE_HEIGHT: '200px',
  NAVIGATION_PREV_ICON: '❮',
  NAVIGATION_NEXT_ICON: '❯',
  INDICATOR_SIZE: '10px',
  INDICATOR_SPACING: '5px',
  INDICATOR_ACTIVE_COLOR: '#333',
  INDICATOR_INACTIVE_COLOR: '#ccc',
  INDICATOR_ACTIVE_OPACITY: '1',
  INDICATOR_INACTIVE_OPACITY: '0.5',
  INDICATOR_ANIMATION_DURATION: '250ms',
  INDICATOR_ANIMATION_TIMING: 'ease',
  INDICATOR_TRANSITION: 'all 0.3s ease-in-out'
};

/**
 * Service for carousel-related functionality and state management
 */
@Injectable({
  providedIn: 'root'
})
export class CarouselService {
  // Visibility state
  private isVisibleSubject = new BehaviorSubject<boolean>(true);
  isVisible$ = this.isVisibleSubject.asObservable();

  /**
   * Set carousel visibility
   * @param visible Whether carousel is visible
   */
  setVisibility(visible: boolean): void {
    this.isVisibleSubject.next(visible);
  }

  /**
   * Get button shape styles based on the configured shape
   * @param shape Button shape type
   * @returns Style object
   */
  getButtonShapeStyles(shape?: NavButtonShape): Record<string, string> {
    const styles: Record<string, string> = {};
    
    switch (shape) {
      case 'circle':
        styles['borderRadius'] = '50%';
        break;
      case 'rounded':
        styles['borderRadius'] = '8px';
        break;
      case 'square':
      default:
        styles['borderRadius'] = '0';
    }
    
    return styles;
  }

  /**
   * Get indicator styles
   * @param config Indicator style configuration
   * @param isActive Whether to get active or inactive styles
   * @returns Style object
   */
  getIndicatorStyles(config?: IndicatorStyle, isActive = false): Record<string, string> {
    // Base styles for both active and inactive
    const baseStyles: Record<string, string> = {
      width: CAROUSEL_DEFAULTS.INDICATOR_SIZE,
      height: CAROUSEL_DEFAULTS.INDICATOR_SIZE,
      display: 'inline-block',
      transition: config?.transition || (config?.animation?.timing 
        ? `all ${config.animation.duration || CAROUSEL_DEFAULTS.INDICATOR_ANIMATION_DURATION} ${config.animation.timing}`
        : CAROUSEL_DEFAULTS.INDICATOR_TRANSITION),
      cursor: 'pointer',
      margin: `0 ${config?.spacing || CAROUSEL_DEFAULTS.INDICATOR_SPACING}`,
      borderRadius: '50%' // Default circle shape
    };
    
    // Active/inactive specific styles
    if (isActive) {
      baseStyles['backgroundColor'] = CAROUSEL_DEFAULTS.INDICATOR_ACTIVE_COLOR;
      baseStyles['opacity'] = CAROUSEL_DEFAULTS.INDICATOR_ACTIVE_OPACITY;
      baseStyles['transform'] = 'scale(1.2)';
      
      // Add animation if enabled and not explicitly disabled
      const animEnabled = config?.animation?.enabled !== false;
      const animType = config?.animation?.type || 'pulse';
      
      if (animEnabled && animType !== 'none') {
        if (animType === 'custom' && config?.animation?.custom) {
          baseStyles['animation'] = config.animation.custom;
        } else if (animType === 'pulse') {
          baseStyles['animation'] = `indicator-pulse 1s infinite alternate`;
        }
      }
      
      // Apply custom active styles if provided (these override defaults)
      if (config?.active) {
        Object.assign(baseStyles, config.active);
      }
    } else {
      baseStyles['backgroundColor'] = CAROUSEL_DEFAULTS.INDICATOR_INACTIVE_COLOR;
      baseStyles['opacity'] = CAROUSEL_DEFAULTS.INDICATOR_INACTIVE_OPACITY;
      baseStyles['transform'] = 'scale(1)';
      
      // Apply custom inactive styles if provided (these override defaults)
      if (config?.inactive) {
        Object.assign(baseStyles, config.inactive);
      }
    }
    
    return baseStyles;
  }

  /**
   * Get indicator container styles based on configuration
   * @param config Indicator style configuration
   * @returns Style object for container
   */
  getIndicatorContainerStyles(config?: IndicatorStyle): Record<string, string> {
    const styles: Record<string, string> = {
      position: 'absolute',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '100',
      padding: '10px',
      pointerEvents: 'auto'
    };
    
    // Default position (bottom center)
    styles['bottom'] = config?.position?.bottom || '4px';
    styles['left'] = config?.position?.left || '50%';
    styles['transform'] = 'translateX(-50%)';
    
    // Override with custom positions if provided
    if (config?.position) {
      Object.keys(config.position).forEach(key => {
        const position = config.position as Record<string, string | undefined>;
        if (position[key]) {
          styles[key] = position[key] as string;
        }
      });
      
      // Handle transformations for centered positioning
      if (config.position.left === '50%' && !styles['transform']) {
        styles['transform'] = 'translateX(-50%)';
      } else if (config.position.top === '50%' && !styles['transform']) {
        styles['transform'] = 'translateY(-50%)';
      }
    }
    
    // Apply custom container styles if provided
    if (config?.container) {
      Object.assign(styles, config.container);
    }
    
    return styles;
  }

  /**
   * Get navigation icons based on orientation
   * @param isVertical Whether carousel is vertical
   * @param icons Custom icon configuration
   * @returns Previous and next icons
   */
  getNavigationIcons(isVertical: boolean, icons?: any): { prev: string; next: string } {
    const defaultIcons = {
      horizontal: {
        prev: CAROUSEL_DEFAULTS.NAVIGATION_PREV_ICON,
        next: CAROUSEL_DEFAULTS.NAVIGATION_NEXT_ICON
      },
      vertical: {
        prev: CAROUSEL_DEFAULTS.NAVIGATION_PREV_ICON, 
        next: CAROUSEL_DEFAULTS.NAVIGATION_NEXT_ICON
      }
    };

    const customIcons = icons || {};
    const verticalIcons = customIcons.vertical || {};

    return {
      prev: isVertical
        ? (verticalIcons.prev || defaultIcons.vertical.prev)
        : (customIcons.prev || defaultIcons.horizontal.prev),
      next: isVertical
        ? (verticalIcons.next || defaultIcons.vertical.next)
        : (customIcons.next || defaultIcons.horizontal.next)
    };
  }

  /**
   * Parse time string to milliseconds
   * @param time Time string (e.g., '300ms', '0.5s')
   * @returns Time in milliseconds
   */
  parseTimeToMs(time: string): number {
    if (!time) return 300; // Default 300ms
    
    if (time.endsWith('ms')) {
      return parseInt(time.slice(0, -2), 10);
    }
    
    if (time.endsWith('s')) {
      return parseFloat(time.slice(0, -1)) * 1000;
    }
    
    return parseInt(time, 10);
  }
} 