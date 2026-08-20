import sharp from "sharp";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// CONFIGURATION
// ============================================================

const IMAGE_WIDTH = 400;
const IMAGE_HEIGHT = 400;
const QUALITY = 90;

// ============================================================
// REALISTIC FABRIC PATTERN GENERATORS
// ============================================================

/**
 * Generates a realistic fabric texture based on fabric type
 */
function generateRealisticFabricSVG(
  fabricType: string,
  color: string,
  colorName: string,
  quality: string,
  width: number = IMAGE_WIDTH,
  height: number = IMAGE_HEIGHT
): string {
  const baseColor = color || "#CCCCCC";
  const lightColor = lightenColor(baseColor, 20);
  const darkColor = darkenColor(baseColor, 20);
  const veryLight = lightenColor(baseColor, 40);
  const veryDark = darkenColor(baseColor, 40);

  let textureDefs = "";
  let fillStyle = "";
  const patternId = `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Different fabric patterns based on type
  switch (fabricType.toLowerCase()) {
    case "cotton":
    case "poplin":
    case "broadcloth":
      textureDefs = `
        <pattern id="${patternId}" width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="${baseColor}" />
          <line x1="0" y1="4" x2="16" y2="4" stroke="${veryLight}" stroke-width="1" opacity="0.3" />
          <line x1="0" y1="8" x2="16" y2="8" stroke="${darkColor}" stroke-width="0.5" opacity="0.2" />
          <line x1="4" y1="0" x2="4" y2="16" stroke="${veryLight}" stroke-width="1" opacity="0.2" />
          <line x1="12" y1="0" x2="12" y2="16" stroke="${darkColor}" stroke-width="0.5" opacity="0.2" />
          <rect x="6" y="6" width="4" height="4" fill="${veryLight}" opacity="0.1" />
        </pattern>
      `;
      fillStyle = `url(#${patternId})`;
      break;

    case "silk":
    case "charmeuse":
    case "chiffon":
      textureDefs = `
        <linearGradient id="silkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${veryLight};stop-opacity:1" />
          <stop offset="25%" style="stop-color:${baseColor};stop-opacity:1" />
          <stop offset="50%" style="stop-color:${lightColor};stop-opacity:0.9" />
          <stop offset="75%" style="stop-color:${darkColor};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${veryDark};stop-opacity:1" />
        </linearGradient>
        <pattern id="${patternId}" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="60" height="60" fill="url(#silkGrad)" />
          <ellipse cx="30" cy="30" rx="20" ry="30" fill="${veryLight}" opacity="0.05" />
          <ellipse cx="15" cy="15" rx="10" ry="15" fill="${veryDark}" opacity="0.05" />
        </pattern>
      `;
      fillStyle = `url(#${patternId})`;
      break;

    case "denim":
    case "jean":
      textureDefs = `
        <pattern id="${patternId}" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="12" height="12" fill="${baseColor}" />
          <rect x="0" y="3" width="12" height="2" fill="${veryDark}" opacity="0.5" />
          <rect x="0" y="7" width="12" height="2" fill="${veryDark}" opacity="0.3" />
          <rect x="3" y="0" width="2" height="12" fill="${veryLight}" opacity="0.2" />
          <rect x="7" y="0" width="2" height="12" fill="${veryLight}" opacity="0.15" />
        </pattern>
      `;
      fillStyle = `url(#${patternId})`;
      break;

    case "velvet":
    case "velour":
      textureDefs = `
        <pattern id="${patternId}" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="${baseColor}" />
          <rect x="0" y="0" width="4" height="8" fill="${darkColor}" opacity="0.3" />
          <rect x="4" y="0" width="4" height="8" fill="${veryLight}" opacity="0.1" />
          <rect x="0" y="4" width="8" height="1" fill="${veryDark}" opacity="0.15" />
        </pattern>
      `;
      fillStyle = `url(#${patternId})`;
      break;

    case "polyester":
    case "nylon":
    case "taffeta":
      textureDefs = `
        <pattern id="${patternId}" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="${baseColor}" />
          <circle cx="5" cy="5" r="3" fill="${veryLight}" opacity="0.3" />
          <circle cx="15" cy="15" r="3" fill="${veryDark}" opacity="0.2" />
          <rect x="0" y="10" width="20" height="0.5" fill="${darkColor}" opacity="0.2" />
          <rect x="10" y="0" width="0.5" height="20" fill="${darkColor}" opacity="0.2" />
          <circle cx="10" cy="10" r="1" fill="${lightColor}" opacity="0.4" />
        </pattern>
      `;
      fillStyle = `url(#${patternId})`;
      break;

    case "leather":
    case "suede":
    case "faux leather":
      textureDefs = `
        <pattern id="${patternId}" width="50" height="50" patternUnits="userSpaceOnUse">
          <rect width="50" height="50" fill="${baseColor}" />
          <path d="M5,5 Q10,2 15,5 Q20,8 25,5 Q30,2 35,5 Q40,8 45,5" stroke="${veryDark}" stroke-width="0.8" fill="none" opacity="0.3" />
          <path d="M5,15 Q10,12 15,15 Q20,18 25,15 Q30,12 35,15 Q40,18 45,15" stroke="${veryLight}" stroke-width="0.5" fill="none" opacity="0.15" />
          <path d="M5,25 Q10,22 15,25 Q20,28 25,25 Q30,22 35,25 Q40,28 45,25" stroke="${veryDark}" stroke-width="0.8" fill="none" opacity="0.25" />
          <path d="M5,35 Q10,32 15,35 Q20,38 25,35 Q30,32 35,35 Q40,38 45,35" stroke="${veryLight}" stroke-width="0.5" fill="none" opacity="0.1" />
          <ellipse cx="25" cy="25" rx="8" ry="4" fill="${darkColor}" opacity="0.1" />
        </pattern>
      `;
      fillStyle = `url(#${patternId})`;
      break;

    case "knit":
    case "jersey":
    case "interlock":
      textureDefs = `
        <pattern id="${patternId}" width="12" height="16" patternUnits="userSpaceOnUse">
          <rect width="12" height="16" fill="${baseColor}" />
          <path d="M0,3 Q6,0 12,3 Q6,6 0,3" stroke="${darkColor}" stroke-width="0.5" fill="none" opacity="0.25" />
          <path d="M0,9 Q6,6 12,9 Q6,12 0,9" stroke="${darkColor}" stroke-width="0.5" fill="none" opacity="0.25" />
          <path d="M0,15 Q6,12 12,15" stroke="${darkColor}" stroke-width="0.5" fill="none" opacity="0.25" />
          <rect x="3" y="4" width="6" height="2" fill="${veryLight}" opacity="0.1" />
        </pattern>
      `;
      fillStyle = `url(#${patternId})`;
      break;

    case "linen":
    case "hemp":
      textureDefs = `
        <pattern id="${patternId}" width="30" height="30" patternUnits="userSpaceOnUse">
          <rect width="30" height="30" fill="${baseColor}" />
          <line x1="0" y1="2" x2="30" y2="2" stroke="${darkColor}" stroke-width="1" opacity="0.15" />
          <line x1="0" y1="8" x2="30" y2="8" stroke="${veryLight}" stroke-width="1" opacity="0.1" />
          <line x1="0" y1="14" x2="30" y2="14" stroke="${darkColor}" stroke-width="0.5" opacity="0.1" />
          <line x1="2" y1="0" x2="2" y2="30" stroke="${darkColor}" stroke-width="1" opacity="0.12" />
          <line x1="8" y1="0" x2="8" y2="30" stroke="${veryLight}" stroke-width="1" opacity="0.08" />
          <line x1="14" y1="0" x2="14" y2="30" stroke="${darkColor}" stroke-width="0.5" opacity="0.08" />
        </pattern>
      `;
      fillStyle = `url(#${patternId})`;
      break;

    case "wool":
    case "tweed":
    case "flannel":
      textureDefs = `
        <pattern id="${patternId}" width="24" height="24" patternUnits="userSpaceOnUse">
          <rect width="24" height="24" fill="${baseColor}" />
          <rect x="0" y="0" width="12" height="12" fill="${veryLight}" opacity="0.2" />
          <rect x="12" y="12" width="12" height="12" fill="${veryDark}" opacity="0.2" />
          <circle cx="6" cy="6" r="2" fill="${lightColor}" opacity="0.3" />
          <circle cx="18" cy="18" r="2" fill="${darkColor}" opacity="0.3" />
          <circle cx="6" cy="18" r="2" fill="${darkColor}" opacity="0.2" />
          <circle cx="18" cy="6" r="2" fill="${lightColor}" opacity="0.2" />
        </pattern>
      `;
      fillStyle = `url(#${patternId})`;
      break;

    default:
      // Generic texture with subtle pattern
      textureDefs = `
        <pattern id="${patternId}" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="${baseColor}" />
          <rect x="0" y="0" width="10" height="10" fill="${veryLight}" opacity="0.1" />
          <rect x="10" y="10" width="10" height="10" fill="${veryDark}" opacity="0.1" />
        </pattern>
      `;
      fillStyle = `url(#${patternId})`;
      break;
  }

  // Create realistic fabric swatch with lighting and shadow
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        ${textureDefs}
        
        <!-- Lighting gradients -->
        <radialGradient id="highlight" cx="30%" cy="25%" r="70%">
          <stop offset="0%" style="stop-color:white;stop-opacity:0.15" />
          <stop offset="50%" style="stop-color:white;stop-opacity:0.05" />
          <stop offset="100%" style="stop-color:black;stop-opacity:0.1" />
        </radialGradient>
        
        <linearGradient id="shadow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:black;stop-opacity:0.05" />
          <stop offset="50%" style="stop-color:black;stop-opacity:0.02" />
          <stop offset="100%" style="stop-color:black;stop-opacity:0.15" />
        </linearGradient>
        
        <linearGradient id="edgeShadow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:black;stop-opacity:0.2" />
          <stop offset="100%" style="stop-color:black;stop-opacity:0.05" />
        </linearGradient>
        
        <filter id="fabricShadow">
          <feDropShadow dx="3" dy="5" stdDeviation="8" flood-color="black" flood-opacity="0.2" />
        </filter>
        
        <filter id="innerGlow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
          <feOffset dx="1" dy="1" result="offsetBlur"/>
          <feComposite in="SourceGraphic" in2="offsetBlur" operator="over"/>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="#f0f0f0" rx="12" />
      
      <!-- Main fabric swatch with shadow -->
      <rect x="20" y="20" width="${width - 40}" height="${height - 80}" rx="8" fill="${fillStyle}" filter="url(#fabricShadow)" />
      
      <!-- Edge detail (fabric fold) -->
      <rect x="20" y="${height - 60}" width="${width - 40}" height="40" rx="0 0 8 8" fill="url(#edgeShadow)" opacity="0.3" />
      
      <!-- Highlight overlay -->
      <rect x="20" y="20" width="${width - 40}" height="${height - 80}" rx="8" fill="url(#highlight)" />
      
      <!-- Subtle shadow overlay -->
      <rect x="20" y="20" width="${width - 40}" height="${height - 80}" rx="8" fill="url(#shadow)" />
      
      <!-- Quality badge -->
      <rect x="30" y="30" width="60" height="24" rx="12" fill="${quality === 'Premium' ? '#FFD700' : '#999999'}" opacity="0.9" />
      <text x="60" y="42" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="${quality === 'Premium' ? '#8B6914' : 'white'}" text-anchor="middle" dominant-baseline="central">
        ${quality.toUpperCase()}
      </text>
      
      <!-- Color name and fabric type -->
      <rect x="30" y="${height - 55}" width="${width - 60}" height="35" rx="6" fill="rgba(0,0,0,0.7)" />
      <text x="${width / 2}" y="${height - 37}" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">
        ${colorName}
      </text>
      <text x="${width / 2}" y="${height - 22}" font-family="Arial, sans-serif" font-size="10" fill="#CCCCCC" text-anchor="middle" dominant-baseline="central">
        ${fabricType}
      </text>
      
      <!-- Color indicator -->
      <rect x="20" y="20" width="12" height="12" rx="2" fill="${baseColor}" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
    </svg>
  `;
}

/**
 * Generates a realistic WIP (Work in Progress) swatch image
 */
function generateWIPSwatchSVG(
  fabricType: string,
  color: string,
  colorName: string,
  quality: string,
  width: number = IMAGE_WIDTH,
  height: number = IMAGE_HEIGHT
): string {
  const baseSvg = generateRealisticFabricSVG(fabricType, color, colorName, quality, width, height);
  
  // Add WIP overlay
  const wipOverlay = `
    <!-- WIP Overlay -->
    <rect x="20" y="20" width="${width - 40}" height="${height - 80}" rx="8" fill="rgba(255,215,0,0.08)" />
    <rect x="${width / 2 - 100}" y="${height / 2 - 40}" width="200" height="80" rx="12" fill="rgba(0,0,0,0.75)" />
    
    <!-- Animated/progress indicator -->
    <circle cx="${width / 2}" cy="${height / 2 - 10}" r="25" fill="none" stroke="#FFD700" stroke-width="3" stroke-dasharray="8,4" />
    <text x="${width / 2}" y="${height / 2 - 10}" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#FFD700" text-anchor="middle" dominant-baseline="central">
      75%
    </text>
    <text x="${width / 2}" y="${height / 2 + 25}" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">
      WORK IN PROGRESS
    </text>
    
    <!-- Progress bar -->
    <rect x="50" y="${height - 95}" width="${width - 100}" height="8" rx="4" fill="rgba(255,255,255,0.2)" />
    <rect x="50" y="${height - 95}" width="${(width - 100) * 0.75}" height="8" rx="4" fill="#FFD700" />
  `;
  
  // Insert the WIP overlay before the closing </svg> tag
  return baseSvg.replace('</svg>', wipOverlay + '</svg>');
}

/**
 * Generates a realistic Final (completed) swatch image with approval badge
 */
function generateFinalSwatchSVG(
  fabricType: string,
  color: string,
  colorName: string,
  quality: string,
  width: number = IMAGE_WIDTH,
  height: number = IMAGE_HEIGHT
): string {
  const baseSvg = generateRealisticFabricSVG(fabricType, color, colorName, quality, width, height);
  
  const finalOverlay = `
    <!-- Final/Approved Badge -->
    <rect x="${width - 100}" y="30" width="70" height="24" rx="12" fill="#4CAF50" />
    <text x="${width - 65}" y="42" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">
      ✓ APPROVED
    </text>
    
    <!-- Ready for production indicator -->
    <rect x="${width / 2 - 80}" y="${height / 2 - 20}" width="160" height="40" rx="8" fill="rgba(76,175,80,0.15)" stroke="#4CAF50" stroke-width="2" stroke-dasharray="4,2" />
    <text x="${width / 2}" y="${height / 2}" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#4CAF50" text-anchor="middle" dominant-baseline="central">
      READY FOR PRODUCTION
    </text>
  `;
  
  return baseSvg.replace('</svg>', finalOverlay + '</svg>');
}

/**
 * Generates a reference/inspiration image (mood board style)
 */
function generateReferenceImageSVG(
  fabricType: string,
  color: string,
  colorName: string,
  quality: string,
  width: number = IMAGE_WIDTH,
  height: number = IMAGE_HEIGHT
): string {
  const baseColor = color || "#CCCCCC";
  const lightColor = lightenColor(baseColor, 30);
  
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="refBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f8f8f8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e8e8e8;stop-opacity:1" />
        </linearGradient>
        <filter id="refShadow">
          <feDropShadow dx="2" dy="4" stdDeviation="6" flood-color="black" flood-opacity="0.1" />
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#refBg)" rx="12" />
      
      <!-- Title -->
      <text x="30" y="40" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#333" dominant-baseline="central">
        INSPIRATION BOARD
      </text>
      <line x1="30" y1="48" x2="200" y2="48" stroke="#CCCCCC" stroke-width="1" />
      
      <!-- Main swatch card -->
      <rect x="30" y="60" width="${width - 80}" height="${height - 120}" rx="12" fill="white" filter="url(#refShadow)" />
      <rect x="30" y="60" width="${width - 80}" height="${height - 120}" rx="12" fill="${baseColor}" opacity="0.1" />
      
      <!-- Color swatches -->
      <rect x="50" y="80" width="60" height="60" rx="4" fill="${baseColor}" stroke="#ddd" stroke-width="1" />
      <rect x="120" y="80" width="60" height="60" rx="4" fill="${lightColor}" stroke="#ddd" stroke-width="1" />
      <rect x="190" y="80" width="60" height="60" rx="4" fill="${lightenColor(baseColor, 50)}" stroke="#ddd" stroke-width="1" />
      
      <!-- Fabric details -->
      <text x="50" y="165" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#333">${colorName}</text>
      <text x="50" y="180" font-family="Arial, sans-serif" font-size="10" fill="#666">${fabricType}</text>
      <text x="50" y="195" font-family="Arial, sans-serif" font-size="10" fill="#888">${quality} Quality</text>
      
      <!-- Mood tags -->
      <rect x="50" y="210" width="80" height="22" rx="11" fill="#E8F5E9" />
      <text x="90" y="221" font-family="Arial, sans-serif" font-size="10" fill="#4CAF50" text-anchor="middle" dominant-baseline="central">Elegant</text>
      
      <rect x="140" y="210" width="70" height="22" rx="11" fill="#E3F2FD" />
      <text x="175" y="221" font-family="Arial, sans-serif" font-size="10" fill="#2196F3" text-anchor="middle" dominant-baseline="central">Modern</text>
      
      <rect x="220" y="210" width="80" height="22" rx="11" fill="#FFF3E0" />
      <text x="260" y="221" font-family="Arial, sans-serif" font-size="10" fill="#FF9800" text-anchor="middle" dominant-baseline="central">Premium</text>
      
      <!-- Notes section -->
      <text x="50" y="${height - 100}" font-family="Arial, sans-serif" font-size="11" fill="#666" font-style="italic">
        • Luxurious feel with excellent drape
      </text>
      <text x="50" y="${height - 85}" font-family="Arial, sans-serif" font-size="11" fill="#666" font-style="italic">
        • Ideal for ${fabricType.toLowerCase()} garments
      </text>
      <text x="50" y="${height - 70}" font-family="Arial, sans-serif" font-size="11" fill="#666" font-style="italic">
        • ${quality === 'Premium' ? 'High-end quality' : 'Good quality'} finish
      </text>
    </svg>
  `;
}

// ============================================================
// COLOR HELPERS
// ============================================================

function lightenColor(hex: string, percent: number): string {
  if (!hex || !hex.startsWith("#")) return "#CCCCCC";
  const num = parseInt(hex.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

function darkenColor(hex: string, percent: number): string {
  if (!hex || !hex.startsWith("#")) return "#666666";
  const num = parseInt(hex.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);
  return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

// ============================================================
// IMAGE TO BASE64 CONVERTER
// ============================================================

async function imageToBase64(imagePath: string): Promise<string> {
  const imageBuffer = await fs.readFile(imagePath);
  return imageBuffer.toString('base64');
}

// ============================================================
// MAIN GENERATION FUNCTION
// ============================================================

export async function generateRealisticImages(): Promise<void> {
  console.log("\n🎨 Generating realistic fabric images...\n");

  const swatchData = [
    // Your swatch data with realistic colors and fabric types
    {
      swatchCode: "CL001-SW001",
      swatchName: "Recycled Licensed Aluminum Shirt",
      fabricType: "Cotton",
      quality: "Premium",
      colorName: "Recycled White",
      hexCode: "#F5F5F0",
    },
    {
      swatchCode: "CL001-SW002",
      swatchName: "Gold Sequins",
      fabricType: "Polyester",
      quality: "Standard",
      colorName: "Gold",
      hexCode: "#FFD700",
    },
    {
      swatchCode: "CL002-SW001",
      swatchName: "Blue Silk Charmeuse",
      fabricType: "Silk",
      quality: "Premium",
      colorName: "Royal Blue",
      hexCode: "#4169E1",
    },
    {
      swatchCode: "CL002-SW002",
      swatchName: "Black Velvet Evening",
      fabricType: "Velvet",
      quality: "Premium",
      colorName: "Midnight Black",
      hexCode: "#1a1a1a",
    },
    {
      swatchCode: "CL003-SW001",
      swatchName: "Floral Print Cotton",
      fabricType: "Cotton",
      quality: "Standard",
      colorName: "Multi Color",
      hexCode: "#FF6B6B",
    },
    {
      swatchCode: "CL004-SW001",
      swatchName: "Green Polyester Sport",
      fabricType: "Polyester",
      quality: "Standard",
      colorName: "Forest Green",
      hexCode: "#228B22",
    },
    {
      swatchCode: "CL005-SW001",
      swatchName: "White Mesh Sportswear",
      fabricType: "Knit",
      quality: "Premium",
      colorName: "Pure White",
      hexCode: "#FFFFFF",
    },
    {
      swatchCode: "CL006-SW001",
      swatchName: "Denim Blue Jean",
      fabricType: "Denim",
      quality: "Premium",
      colorName: "Indigo Blue",
      hexCode: "#1E3A8A",
    },
    {
      swatchCode: "CL007-SW001",
      swatchName: "Orange Nylon Active",
      fabricType: "Nylon",
      quality: "Standard",
      colorName: "Safety Orange",
      hexCode: "#FFA500",
    },
    {
      swatchCode: "CL008-SW001",
      swatchName: "Grey Spandex Yoga",
      fabricType: "Jersey",
      quality: "Premium",
      colorName: "Charcoal Grey",
      hexCode: "#808080",
    },
    {
      swatchCode: "CL009-SW001",
      swatchName: "Black Compression Base",
      fabricType: "Knit",
      quality: "Premium",
      colorName: "Jet Black",
      hexCode: "#1a1a1a",
    },
    {
      swatchCode: "CL010-SW001",
      swatchName: "Yellow Polyester Rain",
      fabricType: "Polyester",
      quality: "Standard",
      colorName: "Yellow",
      hexCode: "#FFD700",
    },
    {
      swatchCode: "CL011-SW001",
      swatchName: "Purple Nulu Fabric",
      fabricType: "Knit",
      quality: "Premium",
      colorName: "Deep Purple",
      hexCode: "#800080",
    },
    {
      swatchCode: "CL012-SW001",
      swatchName: "Navy Terry Toweling",
      fabricType: "Knit",
      quality: "Standard",
      colorName: "Navy Blue",
      hexCode: "#000080",
    },
    {
      swatchCode: "CL013-SW001",
      swatchName: "Pink Fleece Winter",
      fabricType: "Knit",
      quality: "Premium",
      colorName: "Blush Pink",
      hexCode: "#FFC0CB",
    },
    {
      swatchCode: "CL014-SW001",
      swatchName: "Silver Lycra Dance",
      fabricType: "Jersey",
      quality: "Premium",
      colorName: "Silver",
      hexCode: "#C0C0C0",
    },
    {
      swatchCode: "CL015-SW001",
      swatchName: "Beige Suede Luxe",
      fabricType: "Leather",
      quality: "Standard",
      colorName: "Beige",
      hexCode: "#F5F5DC",
    },
    {
      swatchCode: "CL016-SW001",
      swatchName: "Checkered Canvas Bag",
      fabricType: "Cotton",
      quality: "Standard",
      colorName: "Black/White Check",
      hexCode: "#000000",
    },
    {
      swatchCode: "CL017-SW001",
      swatchName: "Brown Leather Heritage",
      fabricType: "Leather",
      quality: "Premium",
      colorName: "Rich Brown",
      hexCode: "#8B4513",
    },
    {
      swatchCode: "CL018-SW001",
      swatchName: "Off-White Duck Canvas",
      fabricType: "Cotton",
      quality: "Standard",
      colorName: "Off-White",
      hexCode: "#F5F5F0",
    },
    {
      swatchCode: "CL019-SW001",
      swatchName: "Black Gore-Tex Waterproof",
      fabricType: "Polyester",
      quality: "Premium",
      colorName: "Black",
      hexCode: "#000000",
    },
    {
      swatchCode: "CL020-SW001",
      swatchName: "Paisley Print Silk",
      fabricType: "Silk",
      quality: "Standard",
      colorName: "Multi Color",
      hexCode: "#FF1493",
    },
  ];

  let totalImages = 0;

  for (const data of swatchData) {
    const code = data.swatchCode;
    const baseDir = path.join(process.cwd(), "uploads", "swatches", code);
    const wipDir = path.join(baseDir, "wip");
    const finalDir = path.join(baseDir, "final");
    const refDir = path.join(baseDir, "reference");

    await fs.ensureDir(wipDir);
    await fs.ensureDir(finalDir);
    await fs.ensureDir(refDir);

    console.log(`📁 Processing: ${code} - ${data.swatchName}`);

    // Generate WIP images (2)
    for (let i = 1; i <= 2; i++) {
      const svg = generateWIPSwatchSVG(
        data.fabricType,
        data.hexCode,
        `${data.colorName} (WIP ${i})`,
        data.quality
      );
      const filePath = path.join(wipDir, `sample_wip_${i}.png`);
      await sharp(Buffer.from(svg)).png({ quality: QUALITY }).toFile(filePath);
      totalImages++;
      
      // Also generate base64 version for seeder
      const base64Path = path.join(wipDir, `sample_wip_${i}.base64.txt`);
      const base64 = await imageToBase64(filePath);
      await fs.writeFile(base64Path, base64);
      console.log(`  ✅ WIP ${i} generated (PNG + Base64)`);
    }

    // Generate Final images (2)
    for (let i = 1; i <= 2; i++) {
      const svg = generateFinalSwatchSVG(
        data.fabricType,
        data.hexCode,
        `${data.colorName} (Final ${i})`,
        data.quality
      );
      const filePath = path.join(finalDir, `sample_final_${i}.png`);
      await sharp(Buffer.from(svg)).png({ quality: QUALITY }).toFile(filePath);
      totalImages++;
      
      // Also generate base64 version
      const base64Path = path.join(finalDir, `sample_final_${i}.base64.txt`);
      const base64 = await imageToBase64(filePath);
      await fs.writeFile(base64Path, base64);
      console.log(`  ✅ Final ${i} generated (PNG + Base64)`);
    }

    // Generate Reference images (2)
    for (let i = 1; i <= 2; i++) {
      const svg = generateReferenceImageSVG(
        data.fabricType,
        data.hexCode,
        data.colorName,
        data.quality
      );
      const filePath = path.join(refDir, `reference_${i}.png`);
      await sharp(Buffer.from(svg)).png({ quality: QUALITY }).toFile(filePath);
      totalImages++;
      
      // Also generate base64 version
      const base64Path = path.join(refDir, `reference_${i}.base64.txt`);
      const base64 = await imageToBase64(filePath);
      await fs.writeFile(base64Path, base64);
      console.log(`  ✅ Reference ${i} generated (PNG + Base64)`);
    }

    console.log(`✅ Completed: ${code}\n`);
  }

  console.log(`\n🎉 Successfully generated ${totalImages} realistic images with base64 exports!`);
  console.log(`📁 Images saved in: ${path.join(process.cwd(), "uploads", "swatches")}`);
  // console.log(`📄 Base64 files saved alongside each image (`.base64.txt`)`);
}

// ============================================================
// RUN
// ============================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  generateRealisticImages().catch(console.error);
}