// Script to generate placeholder PWA icons
// Run with: node scripts/generate-icons.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.join(__dirname, "../public/icons");

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Generate SVG content for each size
function generateSVG(size) {
  const padding = Math.floor(size / 8);
  const circleRadius = (size - padding * 2) / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  const fontSize = Math.floor(size / 2);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#1a1a2e"/>
  <circle cx="${centerX}" cy="${centerY}" r="${circleRadius}" fill="#7c3aed"/>
  <text x="${centerX}" y="${centerY}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">T</text>
</svg>`;
}

// Generate SVG and convert to PNG
async function generateIcons() {
  for (const size of sizes) {
    const svg = generateSVG(size);
    const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);

    await sharp(Buffer.from(svg)).resize(size, size).png().toFile(pngPath);

    console.log(`Created ${pngPath}`);
  }

  console.log("\n✅ PNG icons created!");
}

generateIcons().catch(console.error);
