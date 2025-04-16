#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Building ng-smooth-carousel library...${NC}"
npm run build:lib

if [ $? -ne 0 ]; then
  echo -e "${RED}Build failed!${NC}"
  exit 1
fi

echo -e "${YELLOW}Copying README, CHANGELOG and LICENSE to dist folder...${NC}"
npm run prepare:package

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to copy files!${NC}"
  exit 1
fi

echo -e "${YELLOW}Package ready for publishing. Proceeding to publish...${NC}"
echo -e "${YELLOW}Publishing to NPM...${NC}"
cd dist/ng-smooth-carousel

# Ask for confirmation before publishing
read -p "Do you want to publish ng-smooth-carousel v1.1.0 to npm? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  npm publish
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Successfully published!${NC}"
  else
    echo -e "${RED}Failed to publish!${NC}"
    exit 1
  fi
else
  echo -e "${YELLOW}Publishing canceled.${NC}"
fi

cd ../..
echo -e "${GREEN}Done!${NC}" 