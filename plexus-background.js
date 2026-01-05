// Advanced Interactive Plexus/Constellation Background
const canvas = document.getElementById('plexus-bg');
const ctx = canvas.getContext('2d');

// Responsive canvas size
function setCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
setCanvasSize();
window.addEventListener('resize', setCanvasSize);

// Mouse tracking and interaction
let mouse = { x: -1000, y: -1000, down: false };
let ripple = { x: -1000, y: -1000, radius: 0, active: false };
canvas.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
canvas.addEventListener('mouseleave', () => {
  mouse.x = -1000;
  mouse.y = -1000;
});
canvas.addEventListener('mousedown', e => {
  mouse.down = true;
  ripple.x = e.clientX;
  ripple.y = e.clientY;
  ripple.radius = 0;
  ripple.active = true;
});
canvas.addEventListener('mouseup', () => {
  mouse.down = false;
});

// Layer configs
const layers = [
  {
    count: 30,
    size: 4,
    speed: 0.7,
    color: 'rgba(0,194,255,0.8)',
    lineColor: 'rgba(0,194,255,0.25)',
    glowColor: 'rgba(16,185,129,0.8)', // green
    connectionDist: 180,
    parallax: 1.0
  },
  {
    count: 40,
    size: 2.5,
    speed: 0.35,
    color: 'rgba(0,194,255,0.4)',
    lineColor: 'rgba(0,194,255,0.12)',
    glowColor: 'rgba(16,185,129,0.5)',
    connectionDist: 120,
    parallax: 0.6
  },
  {
    count: 50,
    size: 1.5,
    speed: 0.18,
    color: 'rgba(0,194,255,0.18)',
    lineColor: 'rgba(0,194,255,0.07)',
    glowColor: 'rgba(16,185,129,0.2)',
    connectionDist: 80,
    parallax: 0.3
  }
];

// Generate nodes for each layer
const nodeLayers = layers.map(layer =>
  Array.from({ length: layer.count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * layer.speed,
    vy: (Math.random() - 0.5) * layer.speed
  }))
);

function drawNode(node, layer, mouseDist, colorShift) {
  let size = layer.size;
  let color = layer.color;
  // Mouse proximity glow
  if (mouseDist < 100) {
    size += 2 * (1 - mouseDist / 100);
    color = layer.glowColor;
    ctx.shadowColor = layer.glowColor;
    ctx.shadowBlur = 16 * (1 - mouseDist / 100);
  } else {
    ctx.shadowBlur = 0;
  }
  // Ripple effect
  if (ripple.active && Math.sqrt((node.x - ripple.x) ** 2 + (node.y - ripple.y) ** 2) < ripple.radius) {
    size += 3 * (1 - (Math.sqrt((node.x - ripple.x) ** 2 + (node.y - ripple.y) ** 2) / ripple.radius));
    color = `rgba(${0+colorShift},${194-colorShift},${255},0.9)`;
    ctx.shadowColor = `rgba(0,255,180,0.8)`;
    ctx.shadowBlur = 24;
  }
  ctx.beginPath();
  ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawConnection(n1, n2, layer, mouseDist1, mouseDist2, colorShift) {
  let opacity = 0.25 * (1 - dist(n1, n2) / layer.connectionDist);
  let color = layer.lineColor;
  // Mouse proximity pulse
  if (mouseDist1 < 100 || mouseDist2 < 100) {
    color = layer.glowColor;
    opacity = 0.7 * (1 - Math.min(mouseDist1, mouseDist2) / 100);
  }
  // Ripple effect
  if (ripple.active && (Math.sqrt((n1.x - ripple.x) ** 2 + (n1.y - ripple.y) ** 2) < ripple.radius || Math.sqrt((n2.x - ripple.x) ** 2 + (n2.y - ripple.y) ** 2) < ripple.radius)) {
    color = `rgba(${0+colorShift},${194-colorShift},${255},${opacity})`;
    opacity = 0.9;
  }
  ctx.beginPath();
  ctx.moveTo(n1.x, n1.y);
  ctx.lineTo(n2.x, n2.y);
  ctx.strokeStyle = color.replace(/\d?\.?\d+\)$/g, opacity + ')');
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

function dist(n1, n2) {
  const dx = n1.x - n2.x;
  const dy = n1.y - n2.y;
  return Math.sqrt(dx * dx + dy * dy);
}


let colorShift = 0;
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  colorShift = (colorShift + 1) % 80;
  // Ripple animation
  if (ripple.active) {
    ripple.radius += 8;
    if (ripple.radius > 180) ripple.active = false;
  }
  layers.forEach((layer, i) => {
    const nodes = nodeLayers[i];
    nodes.forEach((node, idx) => {
      // Parallax mouse effect
      let mx = mouse.x === -1000 ? 0 : (mouse.x - canvas.width / 2) * layer.parallax * 0.03;
      let my = mouse.y === -1000 ? 0 : (mouse.y - canvas.height / 2) * layer.parallax * 0.03;
      node.x += node.vx + mx;
      node.y += node.vy + my;
      // Node repulsion from mouse
      if (mouse.x !== -1000) {
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 80) {
          node.x += dx / d * 2;
          node.y += dy / d * 2;
        }
      }
      // Wrap around edges
      if (node.x < 0) node.x += canvas.width;
      if (node.x > canvas.width) node.x -= canvas.width;
      if (node.y < 0) node.y += canvas.height;
      if (node.y > canvas.height) node.y -= canvas.height;
      // Mouse distance
      const mouseDist = Math.sqrt((node.x - mouse.x) ** 2 + (node.y - mouse.y) ** 2);
      drawNode(node, layer, mouseDist, colorShift);
    });
    // Connections
    for (let a = 0; a < nodes.length; a++) {
      for (let b = a + 1; b < nodes.length; b++) {
        if (dist(nodes[a], nodes[b]) < layer.connectionDist) {
          const mouseDistA = Math.sqrt((nodes[a].x - mouse.x) ** 2 + (nodes[a].y - mouse.y) ** 2);
          const mouseDistB = Math.sqrt((nodes[b].x - mouse.x) ** 2 + (nodes[b].y - mouse.y) ** 2);
          drawConnection(nodes[a], nodes[b], layer, mouseDistA, mouseDistB, colorShift);
        }
      }
    }
  });
  requestAnimationFrame(animate);
}
animate();
