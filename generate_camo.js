const fs = require('fs');

const width = 800;
const height = 800;

// Indian Army Camo Colors
const colors = [
  '#304D27', // Forest Green
  '#4A3525', // Earth Brown
  '#1A1A1A'  // Black
];

const bgColor = '#8D9674'; // Base Khaki

function randomPoints(count) {
  const pts = [];
  for(let i=0; i<count; i++) {
    pts.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 40 + Math.random() * 80
    });
  }
  return pts;
}

let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${bgColor}"/>
  <filter id="blur">
    <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
    <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
  </filter>
  <g filter="url(#blur)">
`;

colors.forEach(color => {
  const points = randomPoints(15);
  points.forEach(p => {
    svg += `    <circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="${color}" />\n`;
    for(let i=0; i<3; i++) {
      const ox = p.x + (Math.random() - 0.5) * p.r * 1.5;
      const oy = p.y + (Math.random() - 0.5) * p.r * 1.5;
      const or = p.r * (0.5 + Math.random() * 0.8);
      svg += `    <circle cx="${ox}" cy="${oy}" r="${or}" fill="${color}" />\n`;
    }
  });
});

svg += `  </g>
</svg>`;

fs.writeFileSync('src/camo.svg', svg);
console.log('camo.svg generated');
