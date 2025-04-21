/**
 * ScrollSize type definition for carousel scrolling
 */
export type ScrollSize =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | '7xl'
  | '8xl'
  | '9xl'
  | '10xl';

/**
 * Navigation button shape types
 */
export type NavButtonShape = 'circle' | 'square' | 'rounded';

/**
 * Navigation button position types
 */
export type NavButtonPosition = 'inside' | 'outside' | 'overlap';

/**
 * Navigation controls position types
 */
export type NavControlsPosition = 'left' | 'right' | 'center' | 'split';

/**
 * Navigation style configuration
 */
export interface NavigationStyle {
  nextButton?: Record<string, string> | ButtonStyle;
  prevButton?: Record<string, string> | ButtonStyle;
  buttonShape?: NavButtonShape;
  buttonPosition?: NavButtonPosition;
  controlsPosition?: NavControlsPosition;
  icons?: {
    next?: string;
    prev?: string;
    search?: string;
    vertical?: {
      next?: string;
      prev?: string;
    };
  };
}

/**
 * Indicator style configuration
 */
export interface IndicatorStyle {
  active?: Record<string, string>;
  inactive?: Record<string, string>;
  container?: Record<string, string>;
  spacing?: string;
  transition?: string;
  position?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  animation?: {
    enabled?: boolean;
    duration?: string;
    timing?: string;
    type?: 'pulse' | 'none' | 'custom';
    custom?: string;
  };
}

/**
 * Search styling configuration
 */
export interface SearchStyle {
  button?: Record<string, string>;
  modal?: Record<string, string>;
}

/**
 * Empty state configuration
 */
export interface EmptyStateConfig {
  icon?: string;
  text?: string;
  hideIcon?: boolean;
  containerHeight?: string;
  backgroundColor?: string;
  textColor?: string;
}

/**
 * Main carousel configuration interface
 */
export interface CarouselConfig {
  // Container configuration
  containerWidth?: string;
  containerHeight?: string;
  containerClass?: string;
  containerStyle?: Record<string, string>;

  // Item configuration
  itemWidth?: string;
  itemHeight?: string;
  itemGap?: string;
  itemClass?: string;
  itemStyle?: Record<string, string>;

  // General configuration
  orientation?: 'horizontal' | 'vertical';
  showNavigation?: boolean;
  navigationStyle?: NavigationStyle;
  navigationSize?: string;
  navigationPadding?: string;
  contentPadding?: string;

  // Animation configuration
  animationDuration?: string;
  animationTiming?: string;
  animate?: boolean;

  // Indicator configuration
  showIndicators?: boolean;
  indicatorStyle?: IndicatorStyle;

  // Behavior configuration
  autoplay?: boolean;
  autoplayDelay?: string;
  loop?: boolean;
  scrollSize?: string | ScrollSize;
  responsive?: boolean;
  singleItemMode?: boolean;

  // Empty state configuration
  emptyState?: EmptyStateConfig;

  // Search configuration (future feature)
  enableSearch?: boolean;
  searchPlaceholder?: string;
  searchModalTitle?: string;
  searchStyle?: SearchStyle;
}

/**
 * Button style interface for navigation buttons
 */
export interface ButtonStyle {
  backgroundColor?: string;
  color?: string;
  borderRadius?: string;
  padding?: string;
  fontSize?: string;
  border?: string;
  boxShadow?: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  zIndex?: string;
  transform?: string;
  position?: string;
  hoverColor?: string;
  hoverBackgroundColor?: string;
  activeColor?: string;
  activeBackgroundColor?: string;
}
