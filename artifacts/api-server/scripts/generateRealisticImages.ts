import sharp from "sharp";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// CONFIGURATION
// ============================================================

const IMAGE_WIDTH = 600;
const IMAGE_HEIGHT = 600;
const QUALITY = 95;

// ============================================================
// ADVANCED COLOR HELPERS
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
// REALISTIC PRODUCT IMAGE GENERATORS
// ============================================================

/**
 * Generates a realistic fabric/product image based on swatch description
 */
function generateRealisticProductImage(
  swatchName: string,
  fabricType: string,
  color: string,
  colorName: string,
  quality: string,
  width: number = IMAGE_WIDTH,
  height: number = IMAGE_HEIGHT,
  isWIP: boolean = false,
  isReference: boolean = false
): string {
  const baseColor = color || "#CCCCCC";
  const darkColor = darkenColor(baseColor, 30);
  const lightColor = lightenColor(baseColor, 30);
  const veryLight = lightenColor(baseColor, 50);
  
  // Parse swatch name to extract key features
  const features = parseSwatchFeatures(swatchName);
  
  // Generate appropriate texture based on fabric type
  const texturePattern = generateRealisticTexture(fabricType, baseColor, features);
  
  // Build the SVG
  let svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <!-- Gradients for realistic lighting -->
        <radialGradient id="bgLight" cx="40%" cy="30%" r="80%">
          <stop offset="0%" style="stop-color:${veryLight};stop-opacity:0.3" />
          <stop offset="60%" style="stop-color:${baseColor};stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:${darkColor};stop-opacity:0.4" />
        </radialGradient>
        
        <radialGradient id="highlight" cx="35%" cy="25%" r="60%">
          <stop offset="0%" style="stop-color:white;stop-opacity:0.25" />
          <stop offset="60%" style="stop-color:white;stop-opacity:0.05" />
          <stop offset="100%" style="stop-color:transparent;stop-opacity:0" />
        </radialGradient>
        
        <linearGradient id="shadowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:black;stop-opacity:0.05" />
          <stop offset="50%" style="stop-color:black;stop-opacity:0.02" />
          <stop offset="100%" style="stop-color:black;stop-opacity:0.2" />
        </linearGradient>
        
        <linearGradient id="edgeShadow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:black;stop-opacity:0.25" />
          <stop offset="20%" style="stop-color:black;stop-opacity:0.05" />
          <stop offset="80%" style="stop-color:black;stop-opacity:0.05" />
          <stop offset="100%" style="stop-color:black;stop-opacity:0.25" />
        </linearGradient>
        
        <filter id="productShadow">
          <feDropShadow dx="4" dy="8" stdDeviation="12" flood-color="black" flood-opacity="0.25" />
        </filter>
        
        <filter id="innerGlow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
          <feOffset dx="1" dy="1" result="offsetBlur"/>
          <feComposite in="SourceGraphic" in2="offsetBlur" operator="over"/>
        </filter>
        
        ${texturePattern.defs}
      </defs>
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="#f5f5f5" rx="16" />
      
      <!-- Main fabric panel -->
      <rect x="40" y="40" width="${width - 80}" height="${height - 160}" rx="12" fill="${baseColor}" filter="url(#productShadow)" />
      
      <!-- Texture overlay -->
      <rect x="40" y="40" width="${width - 80}" height="${height - 160}" rx="12" fill="${texturePattern.url}" opacity="${texturePattern.opacity || 0.8}" />
      
      <!-- Lighting overlays -->
      <rect x="40" y="40" width="${width - 80}" height="${height - 160}" rx="12" fill="url(#highlight)" />
      <rect x="40" y="40" width="${width - 80}" height="${height - 160}" rx="12" fill="url(#bgLight)" />
      <rect x="40" y="40" width="${width - 80}" height="${height - 160}" rx="12" fill="url(#shadowGrad)" />
      
      <!-- Edge detail (fabric fold) -->
      <rect x="40" y="${height - 120}" width="${width - 80}" height="40" rx="0 0 12 12" fill="url(#edgeShadow)" opacity="0.4" />
      
      <!-- Quality badge -->
      <rect x="60" y="60" width="80" height="28" rx="14" fill="${quality === 'Premium' ? '#FFD700' : quality === 'Standard' ? '#90A4AE' : '#78909C'}" opacity="0.95" />
      <text x="100" y="74" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="${quality === 'Premium' ? '#8B6914' : 'white'}" text-anchor="middle" dominant-baseline="central">
        ${quality.toUpperCase()}
      </text>
      
      <!-- Brand/Material badge -->
      <rect x="${width - 140}" y="60" width="80" height="28" rx="14" fill="${baseColor}" opacity="0.8" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
      <text x="${width - 100}" y="74" font-family="Arial, sans-serif" font-size="10" fill="white" text-anchor="middle" dominant-baseline="central">
        ${features.material || fabricType}
      </text>
      
      <!-- Decorative element based on swatch type -->
      ${generateDecorativeElement(features, baseColor, width, height)}
      
      <!-- Bottom info panel -->
      <rect x="60" y="${height - 100}" width="${width - 120}" height="70" rx="10" fill="rgba(0,0,0,0.8)" />
      <text x="${width / 2}" y="${height - 65}" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">
        ${swatchName}
      </text>
      <text x="${width / 2}" y="${height - 40}" font-family="Arial, sans-serif" font-size="12" fill="#CCCCCC" text-anchor="middle" dominant-baseline="central">
        ${colorName} • ${fabricType} • ${features.design || ''}
      </text>`;
  
  // Add WIP overlay
  if (isWIP) {
    svg += `
      <!-- WIP Overlay -->
      <rect x="0" y="0" width="${width}" height="${height}" fill="rgba(0,0,0,0.3)" rx="16" />
      <rect x="${width / 2 - 140}" y="${height / 2 - 60}" width="280" height="120" rx="16" fill="rgba(0,0,0,0.85)" />
      
      <!-- Progress circle -->
      <circle cx="${width / 2}" cy="${height / 2 - 10}" r="35" fill="none" stroke="#FFD700" stroke-width="4" stroke-dasharray="80, 40" />
      <text x="${width / 2}" y="${height / 2 - 10}" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#FFD700" text-anchor="middle" dominant-baseline="central">
        70%
      </text>
      
      <text x="${width / 2}" y="${height / 2 + 40}" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">
        ⚡ WORK IN PROGRESS
      </text>
      
      <!-- Progress bar -->
      <rect x="80" y="${height / 2 + 60}" width="${width - 160}" height="6" rx="3" fill="rgba(255,255,255,0.2)" />
      <rect x="80" y="${height / 2 + 60}" width="${(width - 160) * 0.7}" height="6" rx="3" fill="#FFD700" />`;
  }
  
  // Add Reference/Mood Board overlay
  if (isReference) {
    svg += `
      <!-- Reference/Mood Board Overlay -->
      <rect x="0" y="0" width="${width}" height="${height}" fill="rgba(0,0,0,0.15)" rx="16" />
      
      <!-- Mood board elements -->
      <rect x="60" y="80" width="${width - 120}" height="${height - 260}" rx="12" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
      
      <text x="${width / 2}" y="110" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">
        🎯 INSPIRATION BOARD
      </text>
      
      <!-- Inspiration cards -->
      <rect x="90" y="130" width="120" height="100" rx="8" fill="${baseColor}" opacity="0.3" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
      <rect x="230" y="130" width="120" height="100" rx="8" fill="${lightColor}" opacity="0.3" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
      <rect x="370" y="130" width="120" height="100" rx="8" fill="${darkColor}" opacity="0.3" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
      
      <text x="150" y="275" font-family="Arial, sans-serif" font-size="11" fill="white" text-anchor="middle">Color Palette</text>
      
      <!-- Mood tags -->
      <rect x="100" y="300" width="90" height="28" rx="14" fill="rgba(255,215,0,0.2)" stroke="rgba(255,215,0,0.4)" stroke-width="1" />
      <text x="145" y="314" font-family="Arial, sans-serif" font-size="11" fill="#FFD700" text-anchor="middle" dominant-baseline="central">Luxury</text>
      
      <rect x="210" y="300" width="80" height="28" rx="14" fill="rgba(100,200,255,0.2)" stroke="rgba(100,200,255,0.4)" stroke-width="1" />
      <text x="250" y="314" font-family="Arial, sans-serif" font-size="11" fill="#64C8FF" text-anchor="middle" dominant-baseline="central">Modern</text>
      
      <rect x="310" y="300" width="90" height="28" rx="14" fill="rgba(255,100,100,0.2)" stroke="rgba(255,100,100,0.4)" stroke-width="1" />
      <text x="355" y="314" font-family="Arial, sans-serif" font-size="11" fill="#FF6464" text-anchor="middle" dominant-baseline="central">Elegant</text>
      
      <text x="${width / 2}" y="${height - 100}" font-family="Arial, sans-serif" font-size="12" fill="rgba(255,255,255,0.6)" text-anchor="middle" font-style="italic">
        "${swatchName} - ${fabricType} fabric with ${colorName} finish"
      </text>`;
  }
  
  svg += `</svg>`;
  return svg;
}

/**
 * Parse swatch name to extract features
 */
function parseSwatchFeatures(swatchName: string): any {
  const features: any = {
    design: '',
    material: '',
    finish: '',
    pattern: ''
  };
  
  const lower = swatchName.toLowerCase();
  
  // Detect material types
  const materials = ['cotton', 'silk', 'linen', 'wool', 'polyester', 'nylon', 'velvet', 'denim', 'lace', 'leather', 'mesh', 'gore-tex', 'spandex'];
  for (const mat of materials) {
    if (lower.includes(mat)) {
      features.material = mat;
      break;
    }
  }
  
  // Detect design styles
  const designs = ['printed', 'embroidered', 'woven', 'knit', 'charmeuse', 'jersey', 'twill', 'satin', 'taffeta', 'poplin'];
  for (const design of designs) {
    if (lower.includes(design)) {
      features.design = design;
      break;
    }
  }
  
  // Detect patterns
  const patterns = ['floral', 'paisley', 'checkered', 'striped', 'plaid', 'geometric', 'abstract', 'solid'];
  for (const pattern of patterns) {
    if (lower.includes(pattern)) {
      features.pattern = pattern;
      break;
    }
  }
  
  // Detect finishes
  const finishes = ['matte', 'glossy', 'shiny', 'brushed', 'washed', 'crinkled', 'textured'];
  for (const finish of finishes) {
    if (lower.includes(finish)) {
      features.finish = finish;
      break;
    }
  }
  
  return features;
}

/**
 * Generate realistic texture pattern based on fabric type
 */
function generateRealisticTexture(fabricType: string, baseColor: string, features: any): { defs: string, url: string, opacity?: number } {
  const lightColor = lightenColor(baseColor, 20);
  const darkColor = darkenColor(baseColor, 20);
  const veryLight = lightenColor(baseColor, 40);
  const veryDark = darkenColor(baseColor, 40);
  
  const patternId = `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  let defs = '';
  let url = '';
  let opacity = 0.9;
  
  switch (fabricType.toLowerCase()) {
    case 'cotton':
    case 'poplin':
    case 'broadcloth':
      defs = `
        <pattern id="${patternId}" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="transparent" />
          <rect x="0" y="0" width="10" height="10" fill="${veryLight}" opacity="0.15" />
          <rect x="10" y="10" width="10" height="10" fill="${veryDark}" opacity="0.1" />
          <line x1="0" y1="5" x2="20" y2="5" stroke="${lightColor}" stroke-width="0.5" opacity="0.2" />
          <line x1="0" y1="15" x2="20" y2="15" stroke="${darkColor}" stroke-width="0.5" opacity="0.2" />
          <line x1="5" y1="0" x2="5" y2="20" stroke="${lightColor}" stroke-width="0.5" opacity="0.15" />
          <line x1="15" y1="0" x2="15" y2="20" stroke="${darkColor}" stroke-width="0.5" opacity="0.15" />
        </pattern>
      `;
      url = `url(#${patternId})`;
      break;
      
    case 'silk':
    case 'charmeuse':
    case 'chiffon':
      defs = `
        <linearGradient id="${patternId}Grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${veryLight};stop-opacity:0.8" />
          <stop offset="30%" style="stop-color:${baseColor};stop-opacity:0.6" />
          <stop offset="50%" style="stop-color:${lightColor};stop-opacity:0.5" />
          <stop offset="70%" style="stop-color:${darkColor};stop-opacity:0.6" />
          <stop offset="100%" style="stop-color:${veryDark};stop-opacity:0.8" />
        </linearGradient>
        <pattern id="${patternId}" width="80" height="80" patternUnits="userSpaceOnUse">
          <rect width="80" height="80" fill="url(#${patternId}Grad)" />
          <ellipse cx="40" cy="40" rx="30" ry="20" fill="${veryLight}" opacity="0.05" />
          <ellipse cx="20" cy="20" rx="15" ry="10" fill="${veryDark}" opacity="0.05" />
        </pattern>
      `;
      url = `url(#${patternId})`;
      opacity = 0.7;
      break;
      
    case 'denim':
    case 'jean':
      defs = `
        <pattern id="${patternId}" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="16" height="16" fill="transparent" />
          <rect x="0" y="4" width="16" height="2" fill="${veryDark}" opacity="0.4" />
          <rect x="0" y="10" width="16" height="2" fill="${veryDark}" opacity="0.25" />
          <rect x="4" y="0" width="2" height="16" fill="${veryLight}" opacity="0.15" />
          <rect x="10" y="0" width="2" height="16" fill="${veryLight}" opacity="0.1" />
        </pattern>
      `;
      url = `url(#${patternId})`;
      break;
      
    case 'velvet':
    case 'velour':
      defs = `
        <pattern id="${patternId}" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="transparent" />
          <rect x="0" y="0" width="5" height="10" fill="${darkColor}" opacity="0.25" />
          <rect x="5" y="0" width="5" height="10" fill="${veryLight}" opacity="0.08" />
          <rect x="0" y="5" width="10" height="1" fill="${veryDark}" opacity="0.15" />
        </pattern>
      `;
      url = `url(#${patternId})`;
      break;
      
    case 'polyester':
    case 'nylon':
    case 'taffeta':
      defs = `
        <pattern id="${patternId}" width="24" height="24" patternUnits="userSpaceOnUse">
          <rect width="24" height="24" fill="transparent" />
          <circle cx="6" cy="6" r="3" fill="${veryLight}" opacity="0.25" />
          <circle cx="18" cy="18" r="3" fill="${veryDark}" opacity="0.15" />
          <rect x="0" y="12" width="24" height="0.5" fill="${darkColor}" opacity="0.15" />
          <rect x="12" y="0" width="0.5" height="24" fill="${darkColor}" opacity="0.15" />
          <circle cx="12" cy="12" r="1.5" fill="${lightColor}" opacity="0.3" />
        </pattern>
      `;
      url = `url(#${patternId})`;
      break;
      
    case 'leather':
    case 'suede':
      defs = `
        <pattern id="${patternId}" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="60" height="60" fill="transparent" />
          <path d="M8,8 Q16,4 24,8 Q32,12 40,8 Q48,4 56,8" stroke="${veryDark}" stroke-width="1" fill="none" opacity="0.2" />
          <path d="M8,20 Q16,16 24,20 Q32,24 40,20 Q48,16 56,20" stroke="${veryLight}" stroke-width="0.8" fill="none" opacity="0.1" />
          <path d="M8,32 Q16,28 24,32 Q32,36 40,32 Q48,28 56,32" stroke="${veryDark}" stroke-width="1" fill="none" opacity="0.15" />
          <path d="M8,44 Q16,40 24,44 Q32,48 40,44 Q48,40 56,44" stroke="${veryLight}" stroke-width="0.8" fill="none" opacity="0.08" />
          <ellipse cx="30" cy="30" rx="10" ry="6" fill="${darkColor}" opacity="0.08" />
        </pattern>
      `;
      url = `url(#${patternId})`;
      break;
      
    case 'knit':
    case 'jersey':
    case 'interlock':
      defs = `
        <pattern id="${patternId}" width="14" height="18" patternUnits="userSpaceOnUse">
          <rect width="14" height="18" fill="transparent" />
          <path d="M0,4 Q7,0 14,4 Q7,8 0,4" stroke="${darkColor}" stroke-width="0.8" fill="none" opacity="0.2" />
          <path d="M0,12 Q7,8 14,12 Q7,16 0,12" stroke="${darkColor}" stroke-width="0.8" fill="none" opacity="0.2" />
          <path d="M0,20 Q7,16 14,20" stroke="${darkColor}" stroke-width="0.8" fill="none" opacity="0.2" />
          <rect x="4" y="5" width="6" height="2" fill="${veryLight}" opacity="0.08" />
        </pattern>
      `;
      url = `url(#${patternId})`;
      break;
      
    case 'linen':
    case 'hemp':
      defs = `
        <pattern id="${patternId}" width="36" height="36" patternUnits="userSpaceOnUse">
          <rect width="36" height="36" fill="transparent" />
          <line x1="0" y1="3" x2="36" y2="3" stroke="${darkColor}" stroke-width="1.2" opacity="0.12" />
          <line x1="0" y1="10" x2="36" y2="10" stroke="${veryLight}" stroke-width="1" opacity="0.08" />
          <line x1="0" y1="17" x2="36" y2="17" stroke="${darkColor}" stroke-width="0.8" opacity="0.08" />
          <line x1="0" y1="24" x2="36" y2="24" stroke="${veryLight}" stroke-width="1" opacity="0.06" />
          <line x1="0" y1="31" x2="36" y2="31" stroke="${darkColor}" stroke-width="0.8" opacity="0.06" />
          <line x1="3" y1="0" x2="3" y2="36" stroke="${darkColor}" stroke-width="1" opacity="0.1" />
          <line x1="10" y1="0" x2="10" y2="36" stroke="${veryLight}" stroke-width="0.8" opacity="0.06" />
          <line x1="17" y1="0" x2="17" y2="36" stroke="${darkColor}" stroke-width="0.8" opacity="0.06" />
        </pattern>
      `;
      url = `url(#${patternId})`;
      break;
      
    case 'wool':
    case 'tweed':
    case 'flannel':
      defs = `
        <pattern id="${patternId}" width="28" height="28" patternUnits="userSpaceOnUse">
          <rect width="28" height="28" fill="transparent" />
          <rect x="0" y="0" width="14" height="14" fill="${veryLight}" opacity="0.15" />
          <rect x="14" y="14" width="14" height="14" fill="${veryDark}" opacity="0.15" />
          <circle cx="7" cy="7" r="3" fill="${lightColor}" opacity="0.2" />
          <circle cx="21" cy="21" r="3" fill="${darkColor}" opacity="0.2" />
          <circle cx="7" cy="21" r="3" fill="${darkColor}" opacity="0.15" />
          <circle cx="21" cy="7" r="3" fill="${lightColor}" opacity="0.15" />
        </pattern>
      `;
      url = `url(#${patternId})`;
      break;
      
    default:
      defs = `
        <pattern id="${patternId}" width="24" height="24" patternUnits="userSpaceOnUse">
          <rect width="24" height="24" fill="transparent" />
          <rect x="0" y="0" width="12" height="12" fill="${veryLight}" opacity="0.08" />
          <rect x="12" y="12" width="12" height="12" fill="${veryDark}" opacity="0.08" />
        </pattern>
      `;
      url = `url(#${patternId})`;
      break;
  }
  
  return { defs, url, opacity };
}

/**
 * Generate decorative elements based on swatch features
 */
function generateDecorativeElement(features: any, baseColor: string, width: number, height: number): string {
  const elements = [];
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Add pattern-specific decorations
  if (features.pattern === 'floral') {
    elements.push(`
      <g opacity="0.15">
        <circle cx="${centerX - 80}" cy="${centerY - 60}" r="20" fill="none" stroke="${darkenColor(baseColor, 20)}" stroke-width="2" />
        <circle cx="${centerX - 80}" cy="${centerY - 60}" r="12" fill="${lightenColor(baseColor, 20)}" opacity="0.3" />
        <circle cx="${centerX + 80}" cy="${centerY + 60}" r="15" fill="none" stroke="${darkenColor(baseColor, 20)}" stroke-width="2" />
        <circle cx="${centerX + 80}" cy="${centerY + 60}" r="8" fill="${lightenColor(baseColor, 20)}" opacity="0.3" />
      </g>
    `);
  }
  
  if (features.pattern === 'geometric' || features.pattern === 'checkered') {
    elements.push(`
      <g opacity="0.1">
        <rect x="${centerX - 100}" y="${centerY - 60}" width="40" height="40" fill="${darkenColor(baseColor, 20)}" />
        <rect x="${centerX - 40}" y="${centerY - 60}" width="40" height="40" fill="${lightenColor(baseColor, 20)}" />
        <rect x="${centerX - 100}" y="${centerY}" width="40" height="40" fill="${lightenColor(baseColor, 20)}" />
        <rect x="${centerX - 40}" y="${centerY}" width="40" height="40" fill="${darkenColor(baseColor, 20)}" />
      </g>
    `);
  }
  
  if (features.material === 'velvet' || features.material === 'silk') {
    elements.push(`
      <g opacity="0.08">
        <ellipse cx="${centerX}" cy="${centerY - 30}" rx="120" ry="60" fill="${lightenColor(baseColor, 40)}" />
        <ellipse cx="${centerX}" cy="${centerY + 30}" rx="100" ry="40" fill="${darkenColor(baseColor, 20)}" />
      </g>
    `);
  }
  
  return elements.join('\n');
}

// ============================================================
// MAIN GENERATION FUNCTION
// ============================================================

export async function generateRealisticImages(): Promise<void> {
  console.log("\n🎨 Generating realistic product images...\n");

  const swatchData = [
    // Your complete swatch data with descriptions
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
      swatchName: "Gold Sequins Embellishment",
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
      swatchName: "Black Velvet Evening Fabric",
      fabricType: "Velvet",
      quality: "Premium",
      colorName: "Midnight Black",
      hexCode: "#1a1a1a",
    },
    {
      swatchCode: "CL003-SW001",
      swatchName: "Floral Print Cotton Dress",
      fabricType: "Cotton",
      quality: "Standard",
      colorName: "Multi Color Floral",
      hexCode: "#FF6B6B",
    },
    {
      swatchCode: "CL004-SW001",
      swatchName: "Green Polyester Sportswear",
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
      swatchName: "Indigo Denim Jean Fabric",
      fabricType: "Denim",
      quality: "Premium",
      colorName: "Indigo Blue",
      hexCode: "#1E3A8A",
    },
    {
      swatchCode: "CL007-SW001",
      swatchName: "Orange Nylon Activewear",
      fabricType: "Nylon",
      quality: "Standard",
      colorName: "Safety Orange",
      hexCode: "#FFA500",
    },
    {
      swatchCode: "CL008-SW001",
      swatchName: "Charcoal Grey Spandex Yoga",
      fabricType: "Jersey",
      quality: "Premium",
      colorName: "Charcoal Grey",
      hexCode: "#808080",
    },
    {
      swatchCode: "CL009-SW001",
      swatchName: "Black Compression Base Layer",
      fabricType: "Knit",
      quality: "Premium",
      colorName: "Jet Black",
      hexCode: "#1a1a1a",
    },
    {
      swatchCode: "CL010-SW001",
      swatchName: "Yellow Polyester Rainwear",
      fabricType: "Polyester",
      quality: "Standard",
      colorName: "Bright Yellow",
      hexCode: "#FFD700",
    },
    {
      swatchCode: "CL011-SW001",
      swatchName: "Deep Purple Nulu Fabric",
      fabricType: "Knit",
      quality: "Premium",
      colorName: "Deep Purple",
      hexCode: "#800080",
    },
    {
      swatchCode: "CL012-SW001",
      swatchName: "Navy Terry Toweling Fabric",
      fabricType: "Knit",
      quality: "Standard",
      colorName: "Navy Blue",
      hexCode: "#000080",
    },
    {
      swatchCode: "CL013-SW001",
      swatchName: "Blush Pink Fleece Winter",
      fabricType: "Knit",
      quality: "Premium",
      colorName: "Blush Pink",
      hexCode: "#FFC0CB",
    },
    {
      swatchCode: "CL014-SW001",
      swatchName: "Silver Lycra Dancewear",
      fabricType: "Jersey",
      quality: "Premium",
      colorName: "Silver",
      hexCode: "#C0C0C0",
    },
    {
      swatchCode: "CL015-SW001",
      swatchName: "Beige Suede Luxe Fabric",
      fabricType: "Leather",
      quality: "Standard",
      colorName: "Beige",
      hexCode: "#F5F5DC",
    },
    {
      swatchCode: "CL016-SW001",
      swatchName: "Black/White Checkered Canvas",
      fabricType: "Cotton",
      quality: "Standard",
      colorName: "Checkered",
      hexCode: "#000000",
    },
    {
      swatchCode: "CL017-SW001",
      swatchName: "Rich Brown Leather Heritage",
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
      swatchName: "Paisley Print Silk Fabric",
      fabricType: "Silk",
      quality: "Standard",
      colorName: "Multi Color Paisley",
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

    // Generate 2 WIP images
    for (let i = 1; i <= 2; i++) {
      const svg = generateRealisticProductImage(
        data.swatchName,
        data.fabricType,
        data.hexCode,
        data.colorName,
        data.quality,
        IMAGE_WIDTH,
        IMAGE_HEIGHT,
        true, // isWIP
        false // isReference
      );
      const filePath = path.join(wipDir, `sample_wip_${i}.png`);
      await sharp(Buffer.from(svg)).png({ quality: QUALITY }).toFile(filePath);
      totalImages++;
      console.log(`  ✅ WIP ${i} generated: ${data.swatchName}`);
    }

    // Generate 2 Final images
    for (let i = 1; i <= 2; i++) {
      const svg = generateRealisticProductImage(
        data.swatchName,
        data.fabricType,
        data.hexCode,
        data.colorName,
        data.quality,
        IMAGE_WIDTH,
        IMAGE_HEIGHT,
        false, // isWIP
        false // isReference
      );
      const filePath = path.join(finalDir, `sample_final_${i}.png`);
      await sharp(Buffer.from(svg)).png({ quality: QUALITY }).toFile(filePath);
      totalImages++;
      console.log(`  ✅ Final ${i} generated: ${data.swatchName}`);
    }

    // Generate 2 Reference images (Mood Board style)
    for (let i = 1; i <= 2; i++) {
      const svg = generateRealisticProductImage(
        data.swatchName,
        data.fabricType,
        data.hexCode,
        data.colorName,
        data.quality,
        IMAGE_WIDTH,
        IMAGE_HEIGHT,
        false, // isWIP
        true // isReference
      );
      const filePath = path.join(refDir, `reference_${i}.png`);
      await sharp(Buffer.from(svg)).png({ quality: QUALITY }).toFile(filePath);
      totalImages++;
      console.log(`  ✅ Reference ${i} generated: ${data.swatchName}`);
    }

    console.log(`✅ Completed: ${code}\n`);
  }

  console.log(`\n🎉 Successfully generated ${totalImages} realistic product images!`);
  console.log(`📁 Images saved in: ${path.join(process.cwd(), "uploads", "swatches")}`);
}

// ============================================================
// RUN
// ============================================================

generateRealisticImages().catch(console.error);