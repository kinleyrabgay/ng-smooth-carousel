#!/bin/bash

# Set the npm registry URL
NPM_REGISTRY_URL="https://registry.npmjs.org/"

# Set the version
VERSION=$(node -p "require('./package.json').version")
PACKAGE_NAME=$(node -p "require('./package.json').name")
DIST_DIR="dist/@ngfly/carousel"

# Build the library for production
echo "Building library for production..."
npm run build:prod

# Copy README and LICENSE to dist folder
echo "Copying documents to dist folder..."
npm run prepare:package

# Navigate to dist folder to publish
echo "Publishing version $VERSION of $PACKAGE_NAME to npm..."
cd $DIST_DIR

# Make sure you're logged in to npm
echo "Make sure you're logged in to npm. If not, run 'npm login'"

# Publish to npm
npm publish --access public

echo "Published $PACKAGE_NAME@$VERSION successfully!"
cd ../..

echo "Done!" 