const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '../dist');
const nextAppDir = path.resolve(__dirname, '../.next/server/app');
const nextStaticDir = path.resolve(__dirname, '../.next/static');
const publicDir = path.resolve(__dirname, '../public');
const assetsDir = path.resolve(__dirname, '../src/assets');

console.log('[export-dist] Populating dist/ directory with Next.js build artifacts...');

// Ensure dist directory exists and is clean
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// 1. Copy public assets (robots.txt, sitemap.xml, etc.)
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, distDir, { recursive: true });
}

// 2. Copy static chunks (_next/static)
const distNextStatic = path.join(distDir, '_next', 'static');
if (fs.existsSync(nextStaticDir)) {
  fs.mkdirSync(path.join(distDir, '_next'), { recursive: true });
  fs.cpSync(nextStaticDir, distNextStatic, { recursive: true });
}

// 3. Copy image assets
const distAssets = path.join(distDir, 'src', 'assets');
const distRootAssets = path.join(distDir, 'assets');
if (fs.existsSync(assetsDir)) {
  fs.mkdirSync(distAssets, { recursive: true });
  fs.cpSync(assetsDir, distAssets, { recursive: true });
  fs.mkdirSync(distRootAssets, { recursive: true });
  fs.cpSync(assetsDir, distRootAssets, { recursive: true });
}

// 4. Copy pre-rendered HTML pages from .next/server/app
if (fs.existsSync(nextAppDir)) {
  const files = fs.readdirSync(nextAppDir);
  for (const file of files) {
    if (file.endsWith('.html')) {
      const srcFile = path.join(nextAppDir, file);
      const destFile = path.join(distDir, file);
      fs.copyFileSync(srcFile, destFile);
    }
  }

  // Also recursively handle subdirectories with page.html or index.html
  function copySubdirHtml(subpath) {
    const fullPath = path.join(nextAppDir, subpath);
    if (!fs.existsSync(fullPath)) return;
    const items = fs.readdirSync(fullPath, { withFileTypes: true });
    for (const item of items) {
      if (item.isDirectory() && !item.name.startsWith('_') && !item.name.endsWith('.segments')) {
        const itemSubpath = path.join(subpath, item.name);
        copySubdirHtml(itemSubpath);
      } else if (item.isFile() && item.name.endsWith('.html')) {
        const destSubdir = path.join(distDir, subpath);
        fs.mkdirSync(destSubdir, { recursive: true });
        fs.copyFileSync(path.join(fullPath, item.name), path.join(destSubdir, item.name));
      }
    }
  }
  copySubdirHtml('');
}

// 5. Ensure index.html exists at dist root
const rootIndexHtml = path.join(distDir, 'index.html');
if (!fs.existsSync(rootIndexHtml)) {
  const serverIndex = path.join(nextAppDir, 'index.html');
  if (fs.existsSync(serverIndex)) {
    fs.copyFileSync(serverIndex, rootIndexHtml);
  }
}

const fileCount = fs.readdirSync(distDir).length;
console.log(`[export-dist] Successfully populated dist/ with ${fileCount} root items from Next.js.`);
