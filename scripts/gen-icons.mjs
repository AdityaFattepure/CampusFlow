// Generate CampusFlow PWA icons (192 + 512) from a pixel-art graduation cap SVG.
// Uses sharp (already a project dependency) to rasterize. Run once: `bun scripts/gen-icons.mjs`
import sharp from "sharp";
import { writeFileSync } from "fs";

// Pixel cap paths (14x14 grid, crispEdges). Matches src/components/layout/pixel-logo.tsx.
const CAP_BOARD = `
  <rect x="6" y="2" width="2" height="1"/>
  <rect x="5" y="3" width="1" height="1"/><rect x="6" y="3" width="2" height="1"/><rect x="8" y="3" width="1" height="1"/>
  <rect x="3" y="4" width="1" height="1"/><rect x="4" y="4" width="1" height="1"/><rect x="5" y="4" width="4" height="1"/><rect x="9" y="4" width="1" height="1"/><rect x="10" y="4" width="1" height="1"/>
  <rect x="1" y="5" width="2" height="1"/><rect x="3" y="5" width="8" height="1"/><rect x="11" y="5" width="2" height="1"/>
  <rect x="0" y="6" width="2" height="1"/><rect x="2" y="6" width="10" height="1"/><rect x="12" y="6" width="2" height="1"/>
`;
const CAP_BASE = `
  <rect x="4" y="7" width="6" height="1"/>
  <rect x="3" y="8" width="8" height="1"/>
  <rect x="4" y="9" width="6" height="1"/>
  <rect x="5" y="10" width="4" height="1"/>
`;
const CAP_TASSLE = `
  <rect x="11" y="4" width="1" height="1"/>
  <rect x="11" y="5" width="1" height="3"/>
  <rect x="10" y="8" width="3" height="2"/>
  <rect x="11" y="10" width="1" height="1"/>
`;

function iconSVG() {
  // Integer scale keeps every pixel edge crisp.
  const scale = 23; // 14 * 23 = 322px cap
  const tx = (512 - 322) / 2; // 95 — center horizontally
  const ty = 106; // center visually (cap occupies y 2..11)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" shape-rendering="crispEdges">
  <rect width="512" height="512" fill="#3a9d6f"/>
  <g transform="translate(${tx} ${ty}) scale(${scale})">
    <g fill="#f7efdd">${CAP_BOARD}</g>
    <g fill="#cfc4a8">${CAP_BASE}</g>
    <g fill="#e0a83a">${CAP_TASSLE}</g>
  </g>
</svg>`;
}

const svg = iconSVG();
writeFileSync("public/icon.svg", svg);

await sharp(Buffer.from(svg)).png().toFile("public/icon-512.png");
await sharp(Buffer.from(svg)).resize(192, 192).png().toFile("public/icon-192.png");

console.log("icons generated: public/icon-512.png, public/icon-192.png, public/icon.svg");
