#!/usr/bin/env node

/**
 * Generate brand assets for ROZE Mobiles & Computers
 * - Favicons (16, 32, 48px)
 * - Apple touch icon (180x180)
 * - PWA icons (192, 512px)
 * - OG image (1200x630)
 * - Logo copies at native resolution and on teal background
 * - favicon.ico
 * - site.webmanifest
 * - Placeholder product image SVG
 *
 * CRITICAL: The logo has a white circle baked in. All raster outputs must be
 * composited onto ink (#060606) or teal (#66C0C9) background.
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SOURCE_LOGO = path.resolve(PROJECT_ROOT, 'ref', 'RozeLogo.png');

// Brand colors
const INK = '#060606';
const TEAL = '#66C0C9';
const MIST = '#B5DDDF';
const TEAL_DEEP = '#1E6A74';

// Directories
const ICONS_DIR = path.resolve(PROJECT_ROOT, 'public', 'icons');
const LOGO_DIR = path.resolve(PROJECT_ROOT, 'public', 'logo');
const PRODUCTS_DIR = path.resolve(PROJECT_ROOT, 'public', 'products');

/**
 * Ensure directories exist
 */
async function ensureDirs() {
  for (const dir of [ICONS_DIR, LOGO_DIR, PRODUCTS_DIR]) {
    await fs.mkdir(dir, { recursive: true });
  }
}

/**
 * Create a PNG with the logo composited onto a colored background
 * @param {string} outputPath
 * @param {number} width
 * @param {number} height
 * @param {string} backgroundColor - hex color
 * @param {boolean} cropToCircles - if true, extract just the circles mark
 */
async function createLogoOnBackground(outputPath, width, height, backgroundColor, cropToCircles = false) {
  let pipeline = sharp(SOURCE_LOGO);

  if (cropToCircles) {
    // Crop to just the circles mark (excluding ROZE wordmark on the right)
    // The source is 2400x1338. Circles appear to occupy approximately
    // the left 1100-1200px width, centered vertically around 669px (height/2).
    // For a square crop, use ~1100x1100 centered on the circles.
    const cropSize = 1100;
    const left = 200; // offset from left to center circles
    const top = Math.max(0, 669 - cropSize / 2);
    pipeline = pipeline.extract({
      left,
      top: Math.min(top, 1338 - cropSize),
      width: cropSize,
      height: cropSize
    });
  }

  // Create background
  const bgBuffer = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: backgroundColor
    }
  }).png().toBuffer();

  // Resize logo to fit within the dimensions with margin
  const margin = Math.min(width, height) * 0.15; // 15% margin
  const maxWidth = width - (margin * 2);
  const maxHeight = height - (margin * 2);

  const logoBuffer = await pipeline
    .resize(Math.floor(maxWidth), Math.floor(maxHeight), {
      fit: 'inside',
      withoutEnlargement: true
    })
    .png()
    .toBuffer();

  // Get logo dimensions to center it
  const logoMeta = await sharp(logoBuffer).metadata();
  const x = Math.floor((width - logoMeta.width) / 2);
  const y = Math.floor((height - logoMeta.height) / 2);

  // Composite logo onto background
  const result = await sharp(bgBuffer)
    .composite([
      {
        input: logoBuffer,
        left: x,
        top: y
      }
    ])
    .png()
    .toFile(outputPath);

  return result;
}

/**
 * Create a favicon from the source logo
 */
async function createFavicon(size, cropToCircles = false) {
  const outputPath = path.resolve(ICONS_DIR, `favicon-${size}.png`);

  let pipeline = sharp(SOURCE_LOGO);

  if (cropToCircles) {
    // Crop to just circles
    const cropSize = 1100;
    const left = 200;
    const top = Math.max(0, 669 - cropSize / 2);
    pipeline = pipeline.extract({
      left,
      top: Math.min(top, 1338 - cropSize),
      width: cropSize,
      height: cropSize
    });
  }

  // Create ink background
  const bgBuffer = await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: INK
    }
  }).png().toBuffer();

  // Resize and center logo
  const margin = Math.ceil(size * 0.1); // 10% padding
  const logoSize = size - (margin * 2);

  const logoBuffer = await pipeline
    .resize(logoSize, logoSize, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .png()
    .toBuffer();

  const logoMeta = await sharp(logoBuffer).metadata();
  const x = Math.floor((size - logoMeta.width) / 2);
  const y = Math.floor((size - logoMeta.height) / 2);

  await sharp(bgBuffer)
    .composite([{ input: logoBuffer, left: x, top: y }])
    .png()
    .toFile(outputPath);

  console.log(`✓ Created ${path.basename(outputPath)}`);
}

/**
 * Create Apple touch icon (180x180, opaque)
 */
async function createAppleTouchIcon() {
  const size = 180;
  const outputPath = path.resolve(ICONS_DIR, 'apple-touch-icon.png');

  const bgBuffer = await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: INK
    }
  }).png().toBuffer();

  const margin = Math.ceil(size * 0.12);
  const logoSize = size - (margin * 2);

  const logoBuffer = await sharp(SOURCE_LOGO)
    .resize(logoSize, logoSize, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .png()
    .toBuffer();

  const logoMeta = await sharp(logoBuffer).metadata();
  const x = Math.floor((size - logoMeta.width) / 2);
  const y = Math.floor((size - logoMeta.height) / 2);

  await sharp(bgBuffer)
    .composite([{ input: logoBuffer, left: x, top: y }])
    .png()
    .toFile(outputPath);

  console.log(`✓ Created ${path.basename(outputPath)}`);
}

/**
 * Create PWA icon
 */
async function createPWAIcon(size) {
  const outputPath = path.resolve(ICONS_DIR, `icon-${size}.png`);

  const bgBuffer = await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: INK
    }
  }).png().toBuffer();

  const margin = Math.ceil(size * 0.15);
  const logoSize = size - (margin * 2);

  const logoBuffer = await sharp(SOURCE_LOGO)
    .resize(logoSize, logoSize, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .png()
    .toBuffer();

  const logoMeta = await sharp(logoBuffer).metadata();
  const x = Math.floor((size - logoMeta.width) / 2);
  const y = Math.floor((size - logoMeta.height) / 2);

  await sharp(bgBuffer)
    .composite([{ input: logoBuffer, left: x, top: y }])
    .png()
    .toFile(outputPath);

  console.log(`✓ Created ${path.basename(outputPath)}`);
}

/**
 * Create OG image (1200x630)
 */
async function createOGImage() {
  const outputPath = path.resolve(PROJECT_ROOT, 'public', 'og-image.png');
  await createLogoOnBackground(outputPath, 1200, 630, INK, false);
  console.log(`✓ Created og-image.png`);
}

/**
 * Create logo copy at native resolution
 */
async function copyLogoNative() {
  const outputPath = path.resolve(LOGO_DIR, 'roze-logo.png');
  await fs.copyFile(SOURCE_LOGO, outputPath);
  console.log(`✓ Created roze-logo.png (native 2400x1338)`);
}

/**
 * Create logo on teal background (matching native resolution)
 */
async function createLogoOnTeal() {
  const outputPath = path.resolve(LOGO_DIR, 'roze-logo-on-teal.png');
  await createLogoOnBackground(outputPath, 2400, 1338, TEAL, false);
  console.log(`✓ Created roze-logo-on-teal.png`);
}

/**
 * Create favicon.ico
 */
async function createFaviconICO() {
  const outputPath = path.resolve(PROJECT_ROOT, 'public', 'favicon.ico');

  // For simplicity, create a 32x32 ICO from the favicon-32 PNG
  // In production, use a proper ICO encoder, but sharp doesn't support ICO output directly.
  // As a fallback, we'll create it from the 32px PNG.
  // Note: A proper multi-size ICO would need more complex handling.

  const bgBuffer = await sharp({
    create: {
      width: 32,
      height: 32,
      channels: 3,
      background: INK
    }
  }).png().toBuffer();

  const margin = Math.ceil(32 * 0.1);
  const logoSize = 32 - (margin * 2);

  const logoBuffer = await sharp(SOURCE_LOGO)
    .resize(logoSize, logoSize, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .png()
    .toBuffer();

  const logoMeta = await sharp(logoBuffer).metadata();
  const x = Math.floor((32 - logoMeta.width) / 2);
  const y = Math.floor((32 - logoMeta.height) / 2);

  // Sharp can't directly write ICO, so we'll write as PNG
  // A proper implementation would use an ICO library
  // For now, create a 32x32 PNG as favicon.png instead, or use ico package
  // The manifest will reference the PNG files

  // Alternative: save as .ico using a workaround - just note this is PNG-based
  const buffer = await sharp(bgBuffer)
    .composite([{ input: logoBuffer, left: x, top: y }])
    .png()
    .toBuffer();

  await fs.writeFile(outputPath, buffer);
  console.log(`✓ Created favicon.ico (as PNG-based 32x32)`);
}

/**
 * Create site.webmanifest
 */
async function createWebManifest() {
  const outputPath = path.resolve(PROJECT_ROOT, 'public', 'site.webmanifest');

  const manifest = {
    name: 'روز موبايل',
    short_name: 'ROZE',
    description: 'Roze Mobiles & Computers - Sales and Service',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: INK,
    theme_color: INK,
    lang: 'ar-JO',
    dir: 'rtl',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/favicon-48.png',
        sizes: '48x48',
        type: 'image/png'
      }
    ]
  };

  await fs.writeFile(outputPath, JSON.stringify(manifest, null, 2));
  console.log(`✓ Created site.webmanifest`);
}

/**
 * Create placeholder product image SVG
 */
async function createPlaceholderSVG() {
  const outputPath = path.resolve(PRODUCTS_DIR, 'placeholder.svg');

  // Mist background #B5DDDF, centered device glyph in teal-deep #1E6A74
  const svg = `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <!-- Mist background -->
  <rect width="400" height="400" fill="#B5DDDF"/>

  <!-- Simple centered device glyph (smartphone) -->
  <!-- This is a deliberate, intentional placeholder design -->
  <g transform="translate(200, 200)">
    <!-- Phone body -->
    <rect x="-50" y="-90" width="100" height="180" rx="8" fill="none" stroke="#1E6A74" stroke-width="3"/>

    <!-- Screen -->
    <rect x="-45" y="-80" width="90" height="130" rx="4" fill="#1E6A74" opacity="0.15"/>

    <!-- Notch -->
    <rect x="-20" y="-80" width="40" height="12" rx="6" fill="#B5DDDF"/>

    <!-- Home button -->
    <circle cx="0" cy="75" r="4" fill="#1E6A74"/>

    <!-- Speaker slot -->
    <line x1="-15" y1="-85" x2="15" y2="-85" stroke="#1E6A74" stroke-width="1.5" opacity="0.5"/>
  </g>
</svg>`;

  await fs.writeFile(outputPath, svg);
  console.log(`✓ Created placeholder.svg`);
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('Generating ROZE brand assets...\n');

    await ensureDirs();

    // Favicons - 16px and 32px crop to circles only
    console.log('Creating favicons...');
    await createFavicon(16, true); // Crop to circles
    await createFavicon(32, true); // Crop to circles
    await createFavicon(48, false); // Full logo

    console.log('\nCreating Apple touch icon...');
    await createAppleTouchIcon();

    console.log('\nCreating PWA icons...');
    await createPWAIcon(192);
    await createPWAIcon(512);

    console.log('\nCreating OG image...');
    await createOGImage();

    console.log('\nCreating logo copies...');
    await copyLogoNative();
    await createLogoOnTeal();

    console.log('\nCreating favicon.ico...');
    await createFaviconICO();

    console.log('\nCreating web manifest...');
    await createWebManifest();

    console.log('\nCreating placeholder product image...');
    await createPlaceholderSVG();

    console.log('\n✓ All assets generated successfully!');
  } catch (error) {
    console.error('Error generating assets:', error);
    process.exit(1);
  }
}

main();
