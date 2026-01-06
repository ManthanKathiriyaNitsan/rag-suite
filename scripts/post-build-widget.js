/**
 * POST-BUILD WIDGET SCRIPT
 * 
 * This script runs after the widget build to:
 * 1. Create v1 directory if it doesn't exist
 * 2. Copy widget files to v1/ folder
 * 3. Copy widget-loader.js from public/ to v1/
 * 4. Remove duplicate files from root (optional)
 */

import { existsSync, mkdirSync, copyFileSync, readdirSync, unlinkSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = join(__dirname, '..');
const widgetDir = join(repoRoot, 'dist', 'widget');
const v1Dir = join(widgetDir, 'v1');
const publicDir = join(repoRoot, 'public');

console.log('📦 Post-build widget script starting...');

// 1. Create v1 directory if it doesn't exist
if (!existsSync(v1Dir)) {
  mkdirSync(v1Dir, { recursive: true });
  console.log('✅ Created v1 directory');
}

// 2. Copy widget files to v1/ folder
const widgetFiles = ['widget.css', 'widget.umd.js', 'widget.umd.js.map'];
widgetFiles.forEach(file => {
  const source = join(widgetDir, file);
  const dest = join(v1Dir, file);
  
  if (existsSync(source)) {
    copyFileSync(source, dest);
    console.log(`✅ Copied ${file} to v1/`);
  } else {
    console.warn(`⚠️  ${file} not found in ${widgetDir}`);
  }
});

// 3. Copy widget-loader.js from public/ to v1/ as loader.js (for backward compatibility)
const loaderSource = join(publicDir, 'widget-loader.js');
const loaderDest = join(v1Dir, 'loader.js'); // Copy as loader.js to match script tag requests

if (existsSync(loaderSource)) {
  copyFileSync(loaderSource, loaderDest);
  console.log('✅ Copied widget-loader.js to v1/loader.js');
} else {
  console.error(`❌ widget-loader.js not found in ${publicDir}`);
  process.exit(1);
}

// 4. Remove duplicate files from root (keep only widget-loader.js for backward compatibility)
const filesToRemove = ['widget.css', 'widget.umd.js', 'widget.umd.js.map'];
filesToRemove.forEach(file => {
  const filePath = join(widgetDir, file);
  if (existsSync(filePath)) {
    unlinkSync(filePath);
    console.log(`✅ Removed duplicate ${file} from root`);
  }
});

console.log('✅ Post-build widget script completed!');
console.log(`📁 Widget files are now in: ${v1Dir}`);

