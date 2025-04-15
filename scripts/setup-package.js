/**
 * Setup script for Angular 14 compatibility
 */
const fs = require('fs');
const path = require('path');

// Update the package.json
const distPath = path.join(__dirname, '../dist/ng-smooth-carousel');
const packageJsonPath = path.join(distPath, 'package.json');

// Check if the dist folder exists
if (!fs.existsSync(distPath)) {
  console.error('Dist folder does not exist. Run "ng build ng-smooth-carousel" first.');
  process.exit(1);
}

// Check if package.json exists
if (!fs.existsSync(packageJsonPath)) {
  console.error('Package.json not found. Make sure the build completed successfully.');
  process.exit(1);
}

console.log(`Updating ${packageJsonPath}...`);

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Specify the correct version
packageJson.version = '1.0.8-ng14';

// Add proper Angular 14 peer dependencies
packageJson.peerDependencies = {
  "@angular/common": "^14.0.0",
  "@angular/core": "^14.0.0",
  "@angular/forms": "^14.0.0"
};

// Remove properties causing npm publish issues
if (packageJson.es2015) delete packageJson.es2015;
if (packageJson.esm2015) delete packageJson.esm2015;

// Update exports
packageJson.exports = {
  "./package.json": {
    "default": "./package.json"
  },
  ".": {
    "types": "./index.d.ts",
    "default": "./fesm2015/ng-smooth-carousel.js"
  }
};

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
console.log('Package.json updated for Angular 14 compatibility.');

console.log('Setup completed! Ready to publish with: cd dist/ng-smooth-carousel && npm publish --tag ng14'); 