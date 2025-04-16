export type ScrollSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl' | '10xl' | 'full';

export type NavButtonShape = 'circle' | 'square' | 'rounded';

export interface NavigationStyle {
  nextButton?: Record<string, string>;
  prevButton?: Record<string, string>;
  buttonShape?: NavButtonShape;
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

export interface SearchStyle {
  button?: Record<string, string>;
  modal?: Record<string, string>;
}

export interface CarouselConfig {
  containerWidth?: string;
  containerHeight?: string;
  itemWidth?: string;
  itemHeight?: string;
  itemGap?: string;
  orientation?: 'horizontal' | 'vertical';
  showNavigation?: boolean;
  navigationStyle?: NavigationStyle;
  navigationSize?: string;
  navigationPadding?: string;
  contentPadding?: string;
  animationDuration?: string;
  animationTiming?: string;
  autoplay?: boolean;
  autoplayDelay?: string;
  loop?: boolean;
  scrollSize?: string;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  searchModalTitle?: string;
  searchStyle?: SearchStyle;
  animate?: boolean;
  responsive?: boolean;
  enableOneItemScroll?: boolean;
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