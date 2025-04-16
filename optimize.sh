#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Building optimized library...${NC}"

# Clean previous builds
echo -e "${YELLOW}Cleaning dist folder...${NC}"
rm -rf dist

# Build with production settings
echo -e "${YELLOW}Building with production configuration...${NC}"
npm run build:lib

if [ $? -ne 0 ]; then
  echo -e "${RED}Build failed!${NC}"
  exit 1
fi

echo -e "${YELLOW}Copying README, CHANGELOG and LICENSE to dist folder...${NC}"
npm run prepare:package

# Further optimize with terser - more aggressive settings
echo -e "${YELLOW}Minifying JavaScript with terser...${NC}"
find dist/ng-smooth-carousel/fesm2020 -name "*.js" -o -name "*.mjs" -exec npx terser {} -o {} -c passes=3,pure_getters=true,unsafe=true -m --ecma 2020 --comments false \;
find dist/ng-smooth-carousel/fesm2015 -name "*.js" -o -name "*.mjs" -exec npx terser {} -o {} -c passes=3,pure_getters=true,unsafe=true -m --ecma 2015 --comments false \;
find dist/ng-smooth-carousel/esm2020 -name "*.js" -o -name "*.mjs" -exec npx terser {} -o {} -c passes=3,pure_getters=true,unsafe=true -m --ecma 2020 --comments false \;

# Optionally remove source maps to further reduce size
echo -e "${YELLOW}Removing source maps to reduce size...${NC}"
find dist/ng-smooth-carousel -name "*.map" -delete

echo -e "${GREEN}Library optimized successfully!${NC}"

# Show directory sizes
echo -e "${YELLOW}Package size:${NC}"
du -sh dist/ng-smooth-carousel
echo -e "${YELLOW}File sizes:${NC}"
du -h dist/ng-smooth-carousel/* | sort -h

echo -e "${GREEN}Package is ready in dist/ng-smooth-carousel${NC}" 