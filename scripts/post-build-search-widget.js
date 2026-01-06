/**
 * POST-BUILD SEARCH WIDGET SCRIPT
 * 
 * This script runs after the search widget build to:
 * 1. Create v1 directory if it doesn't exist
 * 2. Copy search widget files to v1/ folder
 * 3. Copy search-widget-loader.js from public/ to v1/
 * 4. Remove duplicate files from root
 */

import { existsSync, mkdirSync, copyFileSync, readdirSync, unlinkSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = join(__dirname, '..');
const searchWidgetDir = join(repoRoot, 'dist', 'search-widget');
const v1Dir = join(searchWidgetDir, 'v1');
const publicDir = join(repoRoot, 'public');

console.log('📦 Post-build search widget script starting...');

// 1. Create v1 directory if it doesn't exist
if (!existsSync(v1Dir)) {
  mkdirSync(v1Dir, { recursive: true });
  console.log('✅ Created v1 directory');
}

// 2. Copy search widget files to v1/ folder
const widgetFiles = ['search-widget.css', 'search-widget.umd.js', 'search-widget.umd.js.map'];
widgetFiles.forEach(file => {
  const source = join(searchWidgetDir, file);
  const dest = join(v1Dir, file);
  
  if (existsSync(source)) {
    copyFileSync(source, dest);
    console.log(`✅ Copied ${file} to v1/`);
  } else {
    console.warn(`⚠️  ${file} not found in ${searchWidgetDir}`);
  }
});

// 3. Copy search-widget-loader.js from public/ to v1/ as loader.js
const loaderSource = join(publicDir, 'search-widget-loader.js');
const loaderDest = join(v1Dir, 'loader.js');

if (existsSync(loaderSource)) {
  copyFileSync(loaderSource, loaderDest);
  console.log('✅ Copied search-widget-loader.js to v1/loader.js');
} else {
  console.error(`❌ search-widget-loader.js not found in ${publicDir}`);
  process.exit(1);
}

// 4. Remove duplicate files from root
const filesToRemove = ['search-widget.css', 'search-widget.umd.js', 'search-widget.umd.js.map'];
filesToRemove.forEach(file => {
  const filePath = join(searchWidgetDir, file);
  if (existsSync(filePath)) {
    unlinkSync(filePath);
    console.log(`✅ Removed duplicate ${file} from root`);
  }
});

console.log('✅ Post-build search widget script completed!');
console.log(`📁 Search widget files are now in: ${v1Dir}`);

