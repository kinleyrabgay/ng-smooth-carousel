/**
 * Available scroll sizes for the carousel navigation
 */
export type ScrollSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl' | '10xl';

/**
 * Available border radius styles for navigation buttons
 */
export type NavButtonShape = 'circle' | 'square' | 'rounded';

/**
 * Style configuration for navigation buttons
 */
export interface NavigationStyle {
  /** Custom styles for the next button */
  nextButton?: { [key: string]: string };
  /** Custom styles for the previous button */
  prevButton?: { [key: string]: string };
  /** Shape of the navigation buttons */
  buttonShape?: NavButtonShape;
}

/**
 * Style configuration for search functionality
 */
export interface SearchStyle {
  /** Custom styles for the search button */
  button?: { [key: string]: string };
  /** Custom styles for the search modal */
  modal?: { [key: string]: string };
}

/**
 * Configuration interface for the carousel component
 */
export interface CarouselConfig {
  /** Width of the carousel container */
  containerWidth?: string;
  /** Height of the carousel container */
  containerHeight?: string;
  /** Width of individual items */
  itemWidth?: string;
  /** Height of individual items */
  itemHeight?: string;
  /** Gap between items */
  itemGap?: string;
  /** Orientation of the carousel ('horizontal' | 'vertical') */
  orientation?: 'horizontal' | 'vertical';
  /** Whether to show navigation buttons */
  showNavigation?: boolean;
  /** Custom styles for navigation buttons */
  navigationStyle?: {
    buttonShape?: 'circle' | 'square' | 'rounded';
    nextButton?: Record<string, string>;
    prevButton?: Record<string, string>;
    icons?: {
      next?: string;
      prev?: string;
      search?: string;
      vertical?: {
        next?: string;
        prev?: string;
      };
    };
  };
  /** Size of the navigation areas */
  navigationSize?: string;
  /** Padding for navigation areas */
  navigationPadding?: string;
  /** Padding for content area */
  contentPadding?: string;
  /** Animation duration for transitions */
  animationDuration?: string;
  /** Animation timing function */
  animationTiming?: string;
  /** Enable autoplay */
  autoplay?: boolean;
  /** Delay between autoplay slides */
  autoplayDelay?: string;
  /** Enable infinite loop */
  loop?: boolean;
  /** Amount to scroll per click */
  scrollSize?: string;
  /** Enable search functionality */
  enableSearch?: boolean;
  /** Placeholder text for search input */
  searchPlaceholder?: string;
  /** Title for search modal */
  searchModalTitle?: string;
  /** Custom styles for search elements */
  searchStyle?: {
    button?: Record<string, string>;
    modal?: Record<string, string>;
  };
  /** Enable animation */
  animate?: boolean;
  /** Enable responsive behavior */
  responsive?: boolean;
}

export interface ButtonStyle {
  backgroundColor?: string;
  color?: string;
  borderRadius?: string;
  padding?: string;
  fontSize?: string;
  border?: string;
  boxShadow?: string;
} 