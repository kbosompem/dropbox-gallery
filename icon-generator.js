const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 48, 128];

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="48" fill="url(#grad)"/>
  <g fill="white">
    <rect x="48" y="48" width="72" height="72" rx="8"/>
    <rect x="136" y="48" width="72" height="72" rx="8"/>
    <rect x="48" y="136" width="72" height="72" rx="8"/>
    <rect x="136" y="136" width="72" height="72" rx="8"/>
  </g>
</svg>`;

sizes.forEach(size => {
  const filename = `icon-${size}.png`;
  console.log(`Generate ${filename} manually or use an SVG to PNG converter`);
});

fs.writeFileSync('icon.svg', svg);
console.log('SVG icon created. Convert to PNG using an online converter or image editor.');