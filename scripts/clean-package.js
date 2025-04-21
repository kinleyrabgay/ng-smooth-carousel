const fs = require('fs');
const path = require('path');

// Path to the package.json in the dist folder
const distPackageJsonPath = path.join(__dirname, '../dist/@ngfly/carousel/package.json');

// Read the package.json
const packageJson = JSON.parse(fs.readFileSync(distPackageJsonPath, 'utf-8'));

// Remove unnecessary fields
delete packageJson.files;
delete packageJson.scripts;
delete packageJson.devDependencies;

// Make sure the package has essential fields
packageJson.name = '@ngfly/carousel';
packageJson.version = packageJson.version || '0.0.1';
packageJson.description = 'A smooth, customizable carousel component for Angular 17+ applications';
packageJson.author = 'Kinley Rabgay';
packageJson.license = 'MIT';

// Add keywords if not present
if (!packageJson.keywords || !packageJson.keywords.length) {
  packageJson.keywords = [
    'angular',
    'carousel',
    'slider',
    'swiper',
    'ng-carousel',
    'angular-carousel',
    'responsive',
    'typescript'
  ];
}

// Write the cleaned package.json back to the dist folder
fs.writeFileSync(distPackageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Cleaned package.json in dist folder'); 