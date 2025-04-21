#!/bin/bash

# Set package info
PACKAGE_NAME=$(node -p "require('./package.json').name")
DIST_DIR="dist/@ngfly/carousel"

# Copy README, CHANGELOG and LICENSE
echo "Copying README, CHANGELOG and LICENSE..."
npm run prepare:package

# Optimize ESM bundles with terser
echo "Optimizing ESM bundles with terser..."
npx terser --compress --mangle --ecma 2020 --module --comments false \
  -o "$DIST_DIR/esm2020/ngxfly-carousel.mjs" \
  "$DIST_DIR/esm2020/ngxfly-carousel.mjs"

npx terser --compress --mangle --ecma 2020 --module --comments false \
  -o "$DIST_DIR/fesm2020/ngxfly-carousel.mjs" \
  "$DIST_DIR/fesm2020/ngxfly-carousel.mjs"

npx terser --compress --mangle --ecma 2020 --module --comments false \
  -o "$DIST_DIR/fesm2015/ngxfly-carousel.mjs" \
  "$DIST_DIR/fesm2015/ngxfly-carousel.mjs"

# Component files which might be large
npx terser --compress --mangle --ecma 2020 --module --comments false \
  -o "$DIST_DIR/esm2020/lib/components/carousel/carousel.component.mjs" \
  "$DIST_DIR/esm2020/lib/components/carousel/carousel.component.mjs"

# Animation utils
npx terser --compress --mangle --ecma 2020 --module --comments false \
  -o "$DIST_DIR/esm2020/lib/utils/animation.mjs" \
  "$DIST_DIR/esm2020/lib/utils/animation.mjs"

# Remove source maps to reduce size
echo "Removing source maps..."
find "$DIST_DIR" -name "*.map" -type f -delete

# Remove test files
echo "Removing test files..."
find "$DIST_DIR" -name "*.spec.*" -type f -delete

# Clean package.json
echo "Cleaning package.json..."
npm run clean:package

# File sizes
echo "Final package size:"
du -sh "$DIST_DIR"

echo "Done! Package is optimized for production." 