// ── Background Animation (Fireflies & Ember Fire) ────────────────────
(function(window) {
  let bgCanvas, ctx;
  let fireIntensity = 0.0;
  const maxFire = 0.45;
  const fireDecay = 0.0000005;
  const embers = [];
  const MAX_EMBERS = 70;
  const glowbugs = [];
  const keyMap = {};
  const bugDecay = 0.00025;
  let lastFrameTime = 0;
  const FRAME_INTERVAL = 1000 / 30;

  function resizeCanvas() {
    if (!bgCanvas) return;
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }

  class Ember {
    constructor(x, y, i) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = -Math.random() * 0.9 - 0.3;
      this.life = 1;
      this.decay = 0.003 + Math.random() * 0.005;
      this.size = 1 + Math.random() * 2.2;
      this.intensity = i;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.998;
      this.vy -= 0.0008;
      this.life -= this.decay;
    }
    draw(ctx, baseColor) {
      if (this.life <= 0) return;
      const a = this.life * 0.7 * (this.intensity / maxFire);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function createGlowbugs() {
    const keys = ['e','a','t','s','n','r','o','i','l','d','h','m','u','w','y','*'];
    keys.forEach(k => {
      let hue;
      if (k === '*') hue = 90;
      else if (['e','a','t','s'].includes(k)) hue = 55 + Math.random() * 25;
      else if (['n','r','o','i'].includes(k)) hue = 75 + Math.random() * 35;
      else if (['l','d','h'].includes(k)) hue = 100 + Math.random() * 45;
      else hue = 60 + Math.random() * 70;

      const bug = {
        key: k,
        hue,
        sat: 30 + Math.random() * 30,
        light: 75 + Math.random() * 15,
        brightness: 0,
        x: Math.random() * (bgCanvas ? bgCanvas.width : window.innerWidth),
        y: Math.random() * (bgCanvas ? bgCanvas.height : window.innerHeight),
        targetX: Math.random() * (bgCanvas ? bgCanvas.width : window.innerWidth),
        targetY: Math.random() * (bgCanvas ? bgCanvas.height : window.innerHeight),
        vx: 0,
        vy: 0,
        size: 2.5 + Math.random() * 4.5,
        phase: Math.random() * Math.PI * 2
      };
      glowbugs.push(bug);
      keyMap[k] = glowbugs.length - 1;
    });
  }

  function boostBug(keyChar) {
    const idx = keyMap[keyChar] !== undefined ? keyMap[keyChar] : keyMap['*'];
    if (idx === undefined || !glowbugs[idx]) return;
    const bug = glowbugs[idx];
    bug.brightness = Math.min(bug.brightness + 0.55, 1);
    bug.targetX = Math.random() * bgCanvas.width;
    bug.targetY = Math.random() * bgCanvas.height;
    if (idx !== keyMap['*']) {
      const fallback = glowbugs[keyMap['*']];
      if (fallback) fallback.brightness = Math.min(fallback.brightness + 0.12, 0.75);
    }
  }

  function updateFire(dt) {
    fireIntensity = Math.max(0, fireIntensity - fireDecay * dt);
    const targetCount = Math.floor(MAX_EMBERS * (fireIntensity / maxFire));
    while (embers.length < targetCount && embers.length < MAX_EMBERS) {
      const x = bgCanvas.width / 2 + (Math.random() - 0.5) * 140;
      const y = bgCanvas.height - 25 + Math.random() * 20;
      embers.push(new Ember(x, y, fireIntensity));
    }
    for (let i = embers.length - 1; i >= 0; i--) {
      embers[i].update();
      if (embers[i].life <= 0) embers.splice(i, 1);
    }
  }

  function updateGlowbugs(dt) {
    const now = performance.now();
    glowbugs.forEach(bug => {
      bug.brightness = Math.max(bug.brightness - bugDecay * dt, 0);
      if (bug.brightness < 0.03 && Math.random() < 0.01) {
        bug.targetX = Math.random() * bgCanvas.width;
        bug.targetY = Math.random() * bgCanvas.height;
      }
      const hoverX = Math.sin(now * 0.0018 + bug.phase) * 30;
      const hoverY = Math.cos(now * 0.0022 + bug.phase) * 22;
      const destX = bug.targetX + hoverX;
      const destY = bug.targetY + hoverY;
      const speed = 0.02 + bug.brightness * 0.12;
      bug.vx += (destX - bug.x) * speed * 0.012;
      bug.vy += (destY - bug.y) * speed * 0.012;
      bug.vx *= 0.96;
      bug.vy *= 0.96;
      bug.x += bug.vx;
      bug.y += bug.vy;
      if (bug.x < -50) bug.x = bgCanvas.width + 50;
      if (bug.x > bgCanvas.width + 50) bug.x = -50;
      if (bug.y < -50) bug.y = bgCanvas.height + 50;
      if (bug.y > bgCanvas.height + 50) bug.y = -50;
    });
  }

  function drawBackground() {
    if (!ctx || !bgCanvas) return;
    ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    if (fireIntensity > 0.001) {
      const r = 80 + fireIntensity * 600;
      const g = 20 + fireIntensity * 450;
      const b = 30 - fireIntensity * 100;
      const baseColor = `rgb(${Math.min(r, 255)},${Math.min(g, 255)},${Math.max(b, 0)})`;
      const grad = ctx.createRadialGradient(
        bgCanvas.width / 2, bgCanvas.height - 10, 0,
        bgCanvas.width / 2, bgCanvas.height - 10, 280 + fireIntensity * 350
      );
      grad.addColorStop(0, `rgba(${Math.min(r, 255)},${Math.min(g, 255)},${Math.max(b, 0)},${0.15 + fireIntensity * 0.4})`);
      grad.addColorStop(0.6, `rgba(${Math.min(r, 255)},${Math.min(g, 255)},${Math.max(b, 0)},0.03)`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
      embers.forEach(ember => ember.draw(ctx, baseColor));
    }
    glowbugs.forEach(bug => {
      const alpha = bug.brightness * 0.85;
      if (alpha < 0.02) return;
      const halo = bug.size * 9 + bug.brightness * 22;
      const haloGrad = ctx.createRadialGradient(bug.x, bug.y, 0, bug.x, bug.y, halo);
      haloGrad.addColorStop(0, `hsla(${bug.hue},${bug.sat}%,${bug.light}%,${alpha * 0.45})`);
      haloGrad.addColorStop(0.5, `hsla(${bug.hue},${bug.sat}%,${bug.light}%,0)`);
      haloGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(bug.x, bug.y, halo, 0, Math.PI * 2);
      ctx.fill();

      const core = bug.size * 1.6 + bug.brightness * 3.5;
      const coreGrad = ctx.createRadialGradient(bug.x, bug.y, 0, bug.x, bug.y, core);
      coreGrad.addColorStop(0, `hsla(${bug.hue},25%,92%,${alpha * 0.9})`);
      coreGrad.addColorStop(0.3, `hsla(${bug.hue},${bug.sat}%,${bug.light}%,${alpha * 0.9})`);
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(bug.x, bug.y, core, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  let lastTimestamp = 0;
  function animationLoop(ts) {
    if (ts - lastFrameTime < FRAME_INTERVAL) {
      requestAnimationFrame(animationLoop);
      return;
    }
    lastFrameTime = ts;
    const dt = Math.min(ts - lastTimestamp, 100);
    lastTimestamp = ts;
    updateFire(dt);
    updateGlowbugs(dt);
    drawBackground();
    requestAnimationFrame(animationLoop);
  }

  function boostFire(chars) {
    fireIntensity = Math.min(maxFire, fireIntensity + Math.min(0.25, (chars / 4000) * 0.2));
  }

  function initAnimations() {
    bgCanvas = document.getElementById('bgCanvas');
    if (!bgCanvas) return;
    ctx = bgCanvas.getContext('2d');
    resizeCanvas();
    createGlowbugs();
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        const key = e.key;
        if (key.length === 1) boostBug(key.toLowerCase());
      }
    });
    requestAnimationFrame(animationLoop);
  }

  window.initAnimations = initAnimations;
  window.boostFire = boostFire;
})(window);
