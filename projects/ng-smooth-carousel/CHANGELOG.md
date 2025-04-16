# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [14.0.3] - 2025-04-16

### Fixed
- Fixed issue with navigation buttons disappearing when switching tabs
- Improved memory management and cleanup to prevent memory leaks
- Added proper handling of carousel visibility in tabbed interfaces
- Fixed vertical orientation issues with one-item scrolling feature
- Fixed border radius display issues on carousel items
- Improved dimension calculations for carousel items

### Added
- Added IntersectionObserver to detect when carousel becomes visible
- Added ResizeObserver to detect size changes in carousel container
- Added better event cleanup in component destruction

## [14.0.0] - 2025-04-16

### Added
- Angular 14 compatibility & it's initial release

### Changed
- Optimized package size by removing test dependencies (Karma, Jasmine)
- Cleaned up project structure

## [1.0.3] - 2025-04-15
### Fixed
- Angular 14 compatibility issues
- Module import issues in feature modules
- Added proper peer dependencies for Angular 14-17 support
- Ensured all necessary exports in public API

## [1.0.2] - 2025-04-15
### Changed
- Default navigation icons changed to chevron arrows (❮❯)
- `showNavigation` now defaults to true and completely removes navigation buttons from DOM when false
- Navigation buttons now properly disable at the start/end of content
- Improved disabled button styling with not-allowed cursor
- Added smooth transitions for button states
- Fixed vertical mode navigation with proper icon rotation

### Fixed
- Navigation button states now correctly update when reaching content boundaries
- Search dropdown positioning in vertical mode
- Button hover effects in vertical orientation

### Added
- Autoplay functionality with configurable delay
- Search functionality with filtering
- Custom item templates
- Responsive design
- Loop functionality

## [1.0.0] - 2025-04-14

### Added
- New `itemsToShow` configuration option to control the number of visible items
- Improved navigation buttons with customizable styling
- Proper item sizing and gap handling
- Container padding and responsive layout
- TypeScript type definitions for better development experience
- Comprehensive documentation and examples

### Changed
- Enhanced carousel configuration interface with new options
- Improved item sizing calculation for better responsiveness
- Updated navigation button positioning and styling

### Fixed
- Item sizing and padding calculations
- Navigation button positioning
- Container layout and spacing issues
- TypeScript type definitions and interfaces

## [0.1.0] - 2025-04-15

### Added
- Initial release with basic carousel functionality
- Support for horizontal scrolling
- Basic navigation buttons
- Simple configuration options
- Angular 17+ compatibility 