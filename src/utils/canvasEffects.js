/**
 * Canvas Visual Effects & AR Stickers Engine
 * Efectos Especiales y Filtros Divertidos en Tiempo Real
 */

/**
 * Filtro cinematográfico (Teal & Orange)
 */
export function applyCinematicFilter(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    if (luminance > 128) {
      data[i] = Math.min(255, r * 1.12);
      data[i + 1] = Math.min(255, g * 0.95);
      data[i + 2] = Math.min(255, b * 0.82);
    } else {
      data[i] = Math.max(0, r * 0.85);
      data[i + 1] = Math.min(255, g * 1.05);
      data[i + 2] = Math.min(255, b * 1.2);
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Tonalidad cálida
 */
export function applyWarmTone(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] * 1.1 + 10);
    data[i + 1] = Math.min(255, data[i + 1] * 1.02);
    data[i + 2] = Math.max(0, data[i + 2] * 0.88);
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Marco decorativo
 */
export function applyFrame(ctx, width, height) {
  const borderWidth = Math.max(6, Math.min(width, height) * 0.025);
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, 'rgba(37, 99, 235, 0.7)');
  grad.addColorStop(0.5, 'rgba(96, 165, 250, 0.5)');
  grad.addColorStop(1, 'rgba(37, 99, 235, 0.7)');
  ctx.strokeStyle = grad;
  ctx.lineWidth = borderWidth;
  const r = borderWidth * 1.5;
  ctx.beginPath();
  ctx.roundRect(borderWidth / 2, borderWidth / 2, width - borderWidth, height - borderWidth, r);
  ctx.stroke();
}

/**
 * ParticleSystem para CameraModule
 */
export class ParticleSystem {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.particles = [];
    this.init();
  }

  init() {
    const count = Math.floor((this.width * this.height) / 15000);
    this.particles = Array.from({ length: Math.min(count, 40) }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      radius: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: -Math.random() * 0.8 - 0.2,
      opacity: Math.random() * 0.4 + 0.1,
      hue: Math.random() * 40 + 200,
    }));
  }

  update() {
    this.particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.opacity += (Math.random() - 0.5) * 0.02;
      p.opacity = Math.max(0.05, Math.min(0.5, p.opacity));

      if (p.y < -10) {
        p.y = this.height + 10;
        p.x = Math.random() * this.width;
      }
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;
    });
  }

  draw(ctx) {
    this.particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.opacity})`;
      ctx.fill();
    });
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }
}

/**
 * Efecto Viñeta (bordes oscurecidos)
 */
export function applyVignette(ctx, width, height) {
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.25,
    width / 2, height / 2, Math.max(width, height) * 0.75
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Mapa de Efectos Legacy para CameraModule
 */
export const EFFECTS_MAP = {
  cinematic: {
    id: 'cinematic',
    name: 'Cinematográfico',
    icon: '🎬',
    description: 'Tonos teal y naranja estilo cine',
    apply: applyCinematicFilter,
  },
  warm: {
    id: 'warm',
    name: 'Tonalidad Cálida',
    icon: '☀️',
    description: 'Acentúa tonos cálidos',
    apply: applyWarmTone,
  },
  vignette: {
    id: 'vignette',
    name: 'Iluminación Suave',
    icon: '💡',
    description: 'Viñeta con bordes oscuros',
    apply: applyVignette,
  },
  frame: {
    id: 'frame',
    name: 'Marco Decorativo',
    icon: '🖼️',
    description: 'Borde con gradiente y acentos',
    apply: applyFrame,
  },
  particles: {
    id: 'particles',
    name: 'Partículas',
    icon: '✨',
    description: 'Elementos flotantes luminosos',
    apply: null,
  },
};

// -------------------------------------------------------------
// AR STICKERS & SPECIAL FX ANIMATIONS (OVNIs, Bubu, Fuego, etc.)
// -------------------------------------------------------------

/**
 * Dibuja un Platillo Volador OVNI animado con luces y rayo tractor
 */
function drawUfo(ctx, cx, cy, scale, t) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Rayo de abducción / Tractor Beam
  const beamGrad = ctx.createLinearGradient(0, 15, 0, 300);
  const beamPulse = (Math.sin(t * 3) + 1) * 0.15 + 0.25;
  beamGrad.addColorStop(0, `rgba(57, 255, 20, ${beamPulse + 0.2})`);
  beamGrad.addColorStop(0.6, `rgba(0, 240, 255, ${beamPulse * 0.7})`);
  beamGrad.addColorStop(1, 'rgba(0, 255, 128, 0)');

  ctx.beginPath();
  ctx.moveTo(-25, 15);
  ctx.lineTo(25, 15);
  ctx.lineTo(90, 280);
  ctx.lineTo(-90, 280);
  ctx.closePath();
  ctx.fillStyle = beamGrad;
  ctx.fill();

  // Partículas flotando en el rayo
  for (let i = 0; i < 6; i++) {
    const py = ((t * 80 + i * 45) % 250) + 20;
    const px = Math.sin(t * 4 + i) * (py * 0.25);
    ctx.beginPath();
    ctx.arc(px, py, 2.5 + Math.sin(i), 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 8;
    ctx.fill();
  }

  // Cúpula / Cabina alienígena con alien adentro
  ctx.beginPath();
  ctx.arc(0, -5, 28, Math.PI, 0);
  ctx.fillStyle = 'rgba(0, 240, 255, 0.75)';
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 15;
  ctx.fill();
  ctx.strokeStyle = '#a5f3fc';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Alien pequeño dentro de la cúpula
  ctx.beginPath();
  ctx.arc(0, -10, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#10b981';
  ctx.shadowBlur = 0;
  ctx.fill();

  // Ojos negros alienígenas
  ctx.beginPath();
  ctx.ellipse(-4, -10, 3, 4.5, -0.3, 0, Math.PI * 2);
  ctx.ellipse(4, -10, 3, 4.5, 0.3, 0, Math.PI * 2);
  ctx.fillStyle = '#050505';
  ctx.fill();

  // Brillo en los ojos
  ctx.beginPath();
  ctx.arc(-4, -12, 1, 0, Math.PI * 2);
  ctx.arc(4, -12, 1, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Cuerpo principal del platillo metálico
  ctx.beginPath();
  ctx.ellipse(0, 5, 65, 18, 0, 0, Math.PI * 2);
  const saucerGrad = ctx.createLinearGradient(0, -10, 0, 20);
  saucerGrad.addColorStop(0, '#94a3b8');
  saucerGrad.addColorStop(0.5, '#475569');
  saucerGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = saucerGrad;
  ctx.shadowColor = '#00ffcc';
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Luces de neón rotativas
  const lightCount = 7;
  for (let i = 0; i < lightCount; i++) {
    const angle = (i / lightCount) * Math.PI + (t * 2.5);
    const lx = Math.cos(angle) * 52;
    const ly = Math.sin(angle) * 7 + 6;
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#fbbf24', '#a855f7'];
    const col = colors[(i + Math.floor(t * 3)) % colors.length];

    ctx.beginPath();
    ctx.arc(lx, ly, 4, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.shadowColor = col;
    ctx.shadowBlur = 10;
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Efecto Especial: Invasión Extraterrestre / OVNIs
 */
export function applyOvniEffect(ctx, width, height, time = 0) {
  const t = time * 0.0015;

  // Tinte cósmico nocturno
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, data[i] * 0.85); // Reducir rojo
    data[i + 1] = Math.min(255, data[i + 1] * 1.05); // Resaltar verde
    data[i + 2] = Math.min(255, data[i + 2] * 1.25); // Resaltar azul/cian
  }
  ctx.putImageData(imageData, 0, 0);

  // Estrellas titilantes de fondo
  ctx.save();
  for (let i = 0; i < 20; i++) {
    const sx = ((i * 137.5) % width);
    const sy = ((i * 89.3) % (height * 0.45));
    const starAlpha = (Math.sin(t * 4 + i) + 1) * 0.4 + 0.2;
    ctx.beginPath();
    ctx.arc(sx, sy, 1.5 + (i % 2), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha})`;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 6;
    ctx.fill();
  }

  // OVNI Principal Flotando en la parte superior central
  const mainUfoX = width * 0.5 + Math.sin(t * 1.8) * (width * 0.25);
  const mainUfoY = height * 0.18 + Math.cos(t * 2.2) * 15;
  const mainScale = Math.min(width, height) / 480;
  drawUfo(ctx, mainUfoX, mainUfoY, mainScale * 1.1, t);

  // OVNI secundario más pequeño en el fondo
  const smallUfoX = width * 0.2 + Math.sin(t * 1.2 + 2) * (width * 0.15);
  const smallUfoY = height * 0.12 + Math.sin(t * 2) * 8;
  drawUfo(ctx, smallUfoX, smallUfoY, mainScale * 0.55, t * 1.3);

  // Banner HUD Táctico
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = '#00ffcc';
  ctx.shadowColor = '#00ffcc';
  ctx.shadowBlur = 8;
  ctx.fillText(`🛸 ALERTA: OBJETO VOLADOR NO IDENTIFICADO DETECTADO`, 20, 32);
  ctx.font = '11px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`SECTOR: LAB-2026 // RAZÓN TELEMETRÍA: ${(Math.sin(t) * 100 + 400).toFixed(1)} GHz`, 20, 48);

  ctx.restore();
}

/**
 * Dibuja el adorable muñeco Bubu (panda/osito kawaii)
 */
function drawBubuCharacter(ctx, cx, cy, scale, t) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  const bob = Math.sin(t * 4) * 6;
  const waveAngle = Math.sin(t * 6) * 0.35;

  ctx.translate(0, bob);

  // Sombra del muñeco
  ctx.beginPath();
  ctx.ellipse(0, 85, 55, 12, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fill();

  // Orejas
  // Oreja Izquierda
  ctx.beginPath();
  ctx.arc(-42, -50, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#1e1e24';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-42, -50, 9, 0, Math.PI * 2);
  ctx.fillStyle = '#ffb6c1';
  ctx.fill();

  // Oreja Derecha
  ctx.beginPath();
  ctx.arc(42, -50, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#1e1e24';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(42, -50, 9, 0, Math.PI * 2);
  ctx.fillStyle = '#ffb6c1';
  ctx.fill();

  // Cabeza (Blanca y esponjosa)
  ctx.beginPath();
  ctx.ellipse(0, -15, 62, 52, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(255, 182, 193, 0.5)';
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Cuerpo
  ctx.beginPath();
  ctx.ellipse(0, 45, 50, 40, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.stroke();

  // Parches negros en los ojos (Estilo Panda tierno)
  ctx.beginPath();
  ctx.ellipse(-24, -18, 14, 18, -0.2, 0, Math.PI * 2);
  ctx.ellipse(24, -18, 14, 18, 0.2, 0, Math.PI * 2);
  ctx.fillStyle = '#1e1e24';
  ctx.shadowBlur = 0;
  ctx.fill();

  // Ojos brillantes grandes
  ctx.beginPath();
  ctx.arc(-22, -18, 7, 0, Math.PI * 2);
  ctx.arc(22, -18, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Pupilas
  ctx.beginPath();
  ctx.arc(-22, -18, 4.5, 0, Math.PI * 2);
  ctx.arc(22, -18, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();

  // Brillo de anime en pupilas
  ctx.beginPath();
  ctx.arc(-20, -20, 2, 0, Math.PI * 2);
  ctx.arc(24, -20, 2, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Nariz tierna
  ctx.beginPath();
  ctx.ellipse(0, -6, 5, 3.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#334155';
  ctx.fill();

  // Boquita sonriente
  ctx.beginPath();
  ctx.arc(-4, 0, 4, 0, Math.PI);
  ctx.arc(4, 0, 4, 0, Math.PI);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Mejillas sonrosadas (Rubor rosa)
  ctx.beginPath();
  ctx.arc(-36, -6, 10, 0, Math.PI * 2);
  ctx.arc(36, -6, 10, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 105, 180, 0.55)';
  ctx.fill();

  // Manita izquierda saludando (Waving paw)
  ctx.save();
  ctx.translate(-38, 25);
  ctx.rotate(waveAngle - 0.4);
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 20, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#1e1e24';
  ctx.fill();
  ctx.restore();

  // Manita derecha
  ctx.beginPath();
  ctx.ellipse(40, 32, 14, 18, 0.4, 0, Math.PI * 2);
  ctx.fillStyle = '#1e1e24';
  ctx.fill();

  // Patitas
  ctx.beginPath();
  ctx.ellipse(-24, 78, 16, 12, -0.2, 0, Math.PI * 2);
  ctx.ellipse(24, 78, 16, 12, 0.2, 0, Math.PI * 2);
  ctx.fillStyle = '#1e1e24';
  ctx.fill();

  // Moñito o corazón en la cabeza
  ctx.beginPath();
  ctx.arc(0, -62, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#ff4d6d';
  ctx.fill();

  ctx.restore();
}

/**
 * Efecto Especial: Muñeco Bubu & Dudu Kawaii
 */
export function applyBubuEffect(ctx, width, height, time = 0) {
  const t = time * 0.0015;

  // Filtro de color cálido y suave tipo pastel
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] * 1.1 + 8); // Toque rosa/cálido
    data[i + 1] = Math.min(255, data[i + 1] * 1.02);
    data[i + 2] = Math.min(255, data[i + 2] * 1.05 + 5);
  }
  ctx.putImageData(imageData, 0, 0);

  ctx.save();

  // Corazones flotantes animados 💕
  const heartCount = 7;
  for (let i = 0; i < heartCount; i++) {
    const hx = ((i * 110 + t * 40) % (width - 60)) + 30;
    const hy = height - (((t * 80 + i * 90) % (height * 0.85)) + 40);
    const hScale = (Math.sin(t * 3 + i) * 0.25 + 0.8) * (Math.min(width, height) / 500);

    ctx.save();
    ctx.translate(hx, hy);
    ctx.scale(hScale, hScale);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-12, -15, -24, 4, 0, 22);
    ctx.bezierCurveTo(24, 4, 12, -15, 0, 0);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 77, 109, 0.75)' : 'rgba(255, 143, 171, 0.75)';
    ctx.shadowColor = '#ff758f';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.restore();
  }

  // Destellos y estrellitas doradas ✨
  for (let i = 0; i < 8; i++) {
    const sx = (i * 95) % width;
    const sy = (i * 73) % height;
    const sAlpha = (Math.sin(t * 5 + i) + 1) * 0.45;
    ctx.beginPath();
    ctx.arc(sx, sy, 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 214, 10, ${sAlpha})`;
    ctx.shadowColor = '#ffd60a';
    ctx.shadowBlur = 8;
    ctx.fill();
  }

  // Muñeco Bubu en la esquina inferior derecha
  const bubuScale = (Math.min(width, height) / 480) * 0.9;
  const bubuX = width - (100 * bubuScale);
  const bubuY = height - (110 * bubuScale);
  drawBubuCharacter(ctx, bubuX, bubuY, bubuScale, t);

  // Orejitas Bubu en la parte superior para el usuario (Filtro selfie)
  const earScale = (Math.min(width, height) / 520);
  const centerX = width / 2;
  const earY = height * 0.12;

  // Oreja izquierda usuario
  ctx.beginPath();
  ctx.arc(centerX - 100 * earScale, earY, 32 * earScale, 0, Math.PI * 2);
  ctx.fillStyle = '#1e1e24';
  ctx.shadowColor = 'rgba(255, 105, 180, 0.6)';
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(centerX - 100 * earScale, earY, 18 * earScale, 0, Math.PI * 2);
  ctx.fillStyle = '#ffb6c1';
  ctx.fill();

  // Oreja derecha usuario
  ctx.beginPath();
  ctx.arc(centerX + 100 * earScale, earY, 32 * earScale, 0, Math.PI * 2);
  ctx.fillStyle = '#1e1e24';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(centerX + 100 * earScale, earY, 18 * earScale, 0, Math.PI * 2);
  ctx.fillStyle = '#ffb6c1';
  ctx.fill();

  // Banner Bubu Studio
  ctx.font = 'bold 14px "Comic Sans MS", cursive, sans-serif';
  ctx.fillStyle = '#ff4d6d';
  ctx.shadowColor = '#ffe5ec';
  ctx.shadowBlur = 8;
  ctx.fillText('🐾 Bubu & Dudu Kawaii FX 💖', 20, 32);

  ctx.restore();
}

/**
 * Efecto Especial: Llamas y Aura de Fuego 🔥
 */
export function applyFireEffect(ctx, width, height, time = 0) {
  const t = time * 0.002;

  // Tonalidad cálida y ardiente
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] * 1.35 + 15);
    data[i + 1] = Math.min(255, data[i + 1] * 0.95);
    data[i + 2] = Math.max(0, data[i + 2] * 0.7);
  }
  ctx.putImageData(imageData, 0, 0);

  ctx.save();

  // Llamas ascendentes desde el fondo
  const flameTongues = 16;
  const tongueWidth = width / flameTongues;

  for (let i = 0; i < flameTongues; i++) {
    const fx = i * tongueWidth;
    const flameHeight = Math.sin(t * 6 + i * 1.5) * 45 + 90;
    const flameGrad = ctx.createLinearGradient(fx, height, fx, height - flameHeight);
    flameGrad.addColorStop(0, 'rgba(255, 69, 0, 0.85)');
    flameGrad.addColorStop(0.5, 'rgba(255, 165, 0, 0.7)');
    flameGrad.addColorStop(0.85, 'rgba(255, 255, 0, 0.6)');
    flameGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.beginPath();
    ctx.moveTo(fx - 10, height);
    ctx.quadraticCurveTo(fx + tongueWidth / 2, height - flameHeight, fx + tongueWidth + 10, height);
    ctx.fillStyle = flameGrad;
    ctx.shadowColor = '#ff4500';
    ctx.shadowBlur = 20;
    ctx.fill();
  }

  // Chispas y brasas flotantes
  for (let i = 0; i < 25; i++) {
    const ex = ((i * 47 + t * 60) % width);
    const ey = height - (((t * 140 + i * 35) % height));
    const size = (Math.sin(i + t) + 1.5) * 2;
    ctx.beginPath();
    ctx.arc(ex, ey, size, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? '#ffdd00' : '#ff4500';
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 8;
    ctx.fill();
  }

  ctx.font = 'bold 14px monospace';
  ctx.fillStyle = '#ff6b35';
  ctx.shadowColor = '#ff4500';
  ctx.shadowBlur = 10;
  ctx.fillText('🔥 MODO AURA DE FUEGO ACTIVO 🔥', 20, 32);

  ctx.restore();
}

/**
 * Efecto Especial: Lluvia de Dinero y Riqueza 💸
 */
export function applyMoneyEffect(ctx, width, height, time = 0) {
  const t = time * 0.0018;

  ctx.save();

  // Billetes cayendo
  const billCount = 14;
  for (let i = 0; i < billCount; i++) {
    const bx = ((i * 75 + Math.sin(t * 2 + i) * 35) % (width - 60)) + 30;
    const by = ((t * 110 + i * 65) % (height + 60)) - 30;
    const rot = Math.sin(t * 3 + i) * 0.5;

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(rot);

    // Billete Verde
    ctx.fillStyle = '#15803d';
    ctx.fillRect(-28, -14, 56, 28);
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-26, -12, 52, 24);

    // Símbolo de Dólar
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 0);

    ctx.restore();
  }

  // Monedas de oro brillantes
  const coinCount = 10;
  for (let i = 0; i < coinCount; i++) {
    const cx = ((i * 105 + Math.cos(t * 2 + i) * 30) % (width - 40)) + 20;
    const cy = ((t * 150 + i * 80) % (height + 40)) - 20;
    const spin = Math.abs(Math.sin(t * 4 + i));

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(spin, 1);
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#eab308';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#713f12';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', 0, 0);
    ctx.restore();
  }

  // Diamantes y Brillos
  for (let i = 0; i < 8; i++) {
    const dx = (i * 120 + 40) % width;
    const dy = (i * 90 + 30) % height;
    const dAlpha = (Math.sin(t * 4 + i) + 1) * 0.45;
    ctx.font = '16px sans-serif';
    ctx.fillStyle = `rgba(56, 189, 248, ${dAlpha})`;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.fillText('💎', dx, dy);
  }

  ctx.font = 'bold 14px sans-serif';
  ctx.fillStyle = '#4ade80';
  ctx.shadowColor = '#22c55e';
  ctx.shadowBlur = 10;
  ctx.fillText('💰 LLUVIA MILLONARIA VIP 💎', 20, 32);

  ctx.restore();
}

/**
 * Efecto Especial: Visor Táctico Cyberpunk / Gafas Neón 🕶️
 */
export function applyCyberHudEffect(ctx, width, height, time = 0) {
  const t = time * 0.002;

  // Filtro Neón Cyberpunk
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] * 1.25);
    data[i + 1] = Math.max(0, data[i + 1] * 0.85);
    data[i + 2] = Math.min(255, data[i + 2] * 1.35);
  }
  ctx.putImageData(imageData, 0, 0);

  ctx.save();
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) * 0.22;

  // Retícula central giratoria
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(t);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 1.5);
  ctx.strokeStyle = '#00ffcc';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#00ffcc';
  ctx.shadowBlur = 12;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, r * 0.7, Math.PI * 0.5, Math.PI * 2);
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = '#f43f5e';
  ctx.stroke();
  ctx.restore();

  // Cruz de apuntado
  ctx.strokeStyle = 'rgba(0, 255, 204, 0.7)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - r - 20, cy);
  ctx.lineTo(cx - 10, cy);
  ctx.moveTo(cx + 10, cy);
  ctx.lineTo(cx + r + 20, cy);
  ctx.moveTo(cx, cy - r - 20);
  ctx.lineTo(cx, cy - 10);
  ctx.moveTo(cx, cy + 10);
  ctx.lineTo(cx, cy + r + 20);
  ctx.stroke();

  // Esquinas de escaneo HUD
  const pad = 24;
  const corner = 30;
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 3;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(pad, pad + corner);
  ctx.lineTo(pad, pad);
  ctx.lineTo(pad + corner, pad);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(width - pad - corner, pad);
  ctx.lineTo(width - pad, pad);
  ctx.lineTo(width - pad, pad + corner);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(pad, height - pad - corner);
  ctx.lineTo(pad, height - pad);
  ctx.lineTo(pad + corner, height - pad);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(width - pad - corner, height - pad);
  ctx.lineTo(width - pad, height - pad);
  ctx.lineTo(width - pad, height - pad - corner);
  ctx.stroke();

  // Datos HUD
  ctx.font = '11px monospace';
  ctx.fillStyle = '#00ffcc';
  ctx.fillText(`OBJETIVO BLOQUEADO: PARTICIPANTE [ONLINE]`, pad + 10, pad + 20);
  ctx.fillText(`FPS: 60 // SCAN: ${(Math.sin(t * 3) * 50 + 50).toFixed(0)}%`, pad + 10, pad + 35);
  ctx.fillText(`SEC-LEVEL: RED TEAM SIMULATION`, pad + 10, height - pad - 10);

  ctx.restore();
}

/**
 * Efecto Especial: Retro VHS 90s 📼
 */
export function applyVhsRetroEffect(ctx, width, height, time = 0) {
  const t = time * 0.001;

  // Ruido de líneas de escaneo VHS
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y, width, 1.5);
  }

  // Glitch horizontal ocasional
  if (Math.sin(t * 10) > 0.85) {
    const glitchY = ((t * 400) % height);
    const glitchH = 15;
    const slice = ctx.getImageData(0, glitchY, width, glitchH);
    ctx.putImageData(slice, (Math.sin(t * 20) * 15), glitchY);
  }

  // Texto VHS
  ctx.font = 'bold 16px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 4;
  ctx.fillText('PLAY 00:24:19 SP', 25, 40);

  // REC Parpadeante
  if (Math.floor(t * 2) % 2 === 0) {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(width - 95, 34, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('REC', width - 80, 40);
  }

  const now = new Date();
  ctx.fillText(`SEP. 19 1998  ${now.toLocaleTimeString()}`, 25, height - 30);

  ctx.restore();
}

/**
 * Filtro Matrix Hacker
 */
export function applyMatrixFilter(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = Math.max(0, gray * 0.1);
    data[i + 1] = Math.min(255, gray * 1.45 + 20);
    data[i + 2] = Math.max(0, gray * 0.2);
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Filtro Térmico Infrarrojo
 */
export function applyThermalFilter(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (gray < 85) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = gray * 3;
    } else if (gray < 170) {
      data[i] = 0;
      data[i + 1] = (gray - 85) * 3;
      data[i + 2] = 255 - (gray - 85) * 3;
    } else {
      data[i] = (gray - 170) * 3;
      data[i + 1] = 255;
      data[i + 2] = 0;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Filtro Noir Monocromo
 */
export function applyNoirFilter(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const contrastGray = gray > 120 ? Math.min(255, gray * 1.3) : gray * 0.75;
    data[i] = contrastGray;
    data[i + 1] = contrastGray;
    data[i + 2] = contrastGray;
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Lista de Efectos Especiales y Filtros Disponibles en el Estudio
 */
export const STUDIO_FILTERS = [
  {
    id: 'normal',
    name: 'Original',
    badge: '📸 Estándar',
    icon: '✨',
    description: 'Cámara limpia en alta definición',
    category: 'basic',
  },
  {
    id: 'ovni',
    name: 'Invasión OVNI',
    badge: '🛸 VFX Alien',
    icon: '🛸',
    description: 'Platillos voladores y rayo tractor de abducción',
    category: 'vfx',
  },
  {
    id: 'bubu',
    name: 'Muñeco Bubu Kawaii',
    badge: '🐾 Cute AR',
    icon: '💖',
    description: 'Orejitas de osito, Bubu animado, corazones y destellos',
    category: 'vfx',
  },
  {
    id: 'fire',
    name: 'Aura de Fuego',
    badge: '🔥 Dragon FX',
    icon: '🔥',
    description: 'Llamas ardientes y lluvia de brasas incandescentes',
    category: 'vfx',
  },
  {
    id: 'money',
    name: 'Lluvia de Dinero',
    badge: '💰 VIP Bling',
    icon: '💵',
    description: 'Billetes de dólar cayendo, monedas de oro y diamantes',
    category: 'vfx',
  },
  {
    id: 'cyber_hud',
    name: 'Visor Cyberpunk',
    badge: '🕶️ Holograma',
    icon: '⚡',
    description: 'Retículas tácticas, HUD de escaneo y luces de neón',
    category: 'vfx',
  },
  {
    id: 'vhs_retro',
    name: 'Cámara VHS 90s',
    badge: '📼 Retro Vintage',
    icon: '📼',
    description: 'Estilo cinta de video retro con glitch y REC parpadeante',
    category: 'vfx',
  },
  {
    id: 'thermal',
    name: 'Visión Térmica',
    badge: '🌡️ Espectro',
    icon: '🌈',
    description: 'Simulación de cámara infrarroja y mapa de calor',
    category: 'color',
  },
  {
    id: 'matrix',
    name: 'Terminal Matrix',
    badge: '💻 Hacker',
    icon: '🟢',
    description: 'Fósforo verde de terminal de ciberseguridad',
    category: 'color',
  },
  {
    id: 'noir',
    name: 'Cine Noir',
    badge: '🎞️ Monocromo',
    icon: '🖤',
    description: 'Alto contraste dramático en blanco y negro',
    category: 'color',
  },
];

/**
 * Función Maestra para Aplicar Filtros en Tiempo Real en el Canvas Loop
 */
export function applyFilterToCanvas(ctx, width, height, filterType, time = performance.now()) {
  if (!filterType || filterType === 'normal') return;

  switch (filterType) {
    case 'ovni':
      applyOvniEffect(ctx, width, height, time);
      break;
    case 'bubu':
      applyBubuEffect(ctx, width, height, time);
      break;
    case 'fire':
      applyFireEffect(ctx, width, height, time);
      break;
    case 'money':
      applyMoneyEffect(ctx, width, height, time);
      break;
    case 'cyber_hud':
      applyCyberHudEffect(ctx, width, height, time);
      break;
    case 'vhs_retro':
      applyVhsRetroEffect(ctx, width, height, time);
      break;
    case 'thermal':
      applyThermalFilter(ctx, width, height);
      break;
    case 'matrix':
      applyMatrixFilter(ctx, width, height);
      break;
    case 'noir':
      applyNoirFilter(ctx, width, height);
      break;
    case 'cinematic':
      applyCinematicFilter(ctx, width, height);
      break;
    default:
      break;
  }
}
