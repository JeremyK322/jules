// ── Background Animation (User Fireflies & AI Letter-Mapped Bio-Algae) ────────────────────
(function(window) {
  let bgCanvas, ctx;

  // Fireflies (User typing)
  const glowbugs = [];
  const keyMap = {};
  const bugDecay = 0.00025;

  // Bio-Algae (AI feeding & spreading by letters)
  const bioAlgaeParticles = [];
  const MAX_ALGAE = 250;
  let algaeActivity = 0.15;
  const activityDecay = 0.00015;

  // Staggered spawning queue across frames
  const spawnQueue = [];

  let lastFrameTime = 0;
  const FRAME_INTERVAL = 1000 / 30; // 30 FPS target

  function resizeCanvas() {
    if (!bgCanvas) return;
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }

  // ── Firefly / Glowbug Class (User Keypresses) ──
  function createGlowbugs() {
    glowbugs.length = 0;
    const keys = ['e','a','t','s','n','r','o','i','l','d','h','m','u','w','y','*'];
    const width = bgCanvas ? bgCanvas.width : window.innerWidth;
    const height = bgCanvas ? bgCanvas.height : window.innerHeight;

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
        x: Math.random() * width,
        y: Math.random() * height,
        targetX: Math.random() * width,
        targetY: Math.random() * height,
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
    if (!bgCanvas) return;
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

  function updateGlowbugs(dt) {
    if (!bgCanvas) return;
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

  function drawGlowbugs() {
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

  // ── AI Bio-Algae Class (Sustained Life & Letter-Mapped Bloom) ──
  class BioAlgaeParticle {
    constructor(x, y, char = 'a') {
      this.x = x;
      this.y = y;
      this.char = char;
      this.size = 2.0 + Math.random() * 4.0;
      this.vx = (Math.random() - 0.5) * 1.2;
      this.vy = -Math.random() * 0.8 - 0.2;
      this.life = 1.0;
      // 3 to 10 seconds of lifespan (slow decay)
      this.decay = 0.0001 + Math.random() * 0.0002;

      // Color spectrum: Cyan (175) to Electric Blue (220)
      const code = char.charCodeAt(0) || 97;
      this.hue = 175 + (code % 45);
      this.brightness = 0.7 + Math.random() * 0.3;
      this.phase = Math.random() * Math.PI * 2;
    }

    update(dt) {
      const now = performance.now();
      this.x += this.vx + Math.sin(now * 0.0015 + this.phase) * 0.6;
      this.y += this.vy + Math.cos(now * 0.0018 + this.phase) * 0.4;
      this.life -= this.decay * dt;
    }

    draw(ctx) {
      if (this.life <= 0) return;
      const alpha = Math.max(0, this.life * this.brightness);
      const glowRadius = this.size * (7 + algaeActivity * 6);

      const glowGrad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowRadius);
      glowGrad.addColorStop(0, `hsla(${this.hue}, 100%, 65%, ${alpha * 0.65})`);
      glowGrad.addColorStop(0.5, `hsla(${this.hue}, 90%, 50%, ${alpha * 0.2})`);
      glowGrad.addColorStop(1, 'transparent');

      ctx.save();
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Core electric algae dot
      ctx.fillStyle = `hsla(${this.hue}, 100%, 90%, ${alpha * 0.9})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function getLetterCoordinates(char) {
    if (!bgCanvas) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const width = bgCanvas.width;
    const height = bgCanvas.height;
    const lower = char.toLowerCase();
    const isVowel = ['a','e','i','o','u'].includes(lower);

    if (isVowel) {
      // Vowels bloom near the center of the screen
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (width * 0.2);
      return {
        x: width / 2 + Math.cos(angle) * dist,
        y: height / 2 + Math.sin(angle) * dist
      };
    } else {
      // Consonants spread outward towards edges/top/bottom based on ASCII value
      const code = lower.charCodeAt(0) || 97;
      const norm = (code - 97) / 26; // 0 to 1
      const angle = norm * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const dist = (width * 0.2) + Math.random() * (width * 0.35);
      return {
        x: Math.max(30, Math.min(width - 30, width / 2 + Math.cos(angle) * dist)),
        y: Math.max(30, Math.min(height - 30, height / 2 + Math.sin(angle) * dist))
      };
    }
  }

  function feedBioAlgaeFromText(text) {
    if (!text || !bgCanvas) return;
    const chars = text.split('').filter(c => /[a-zA-Z]/.test(c));
    // Denser spawn count calculation capped at 60
    const spawnCount = Math.min(60, Math.max(10, Math.floor(chars.length / 5)));

    // Queue particles to spawn across multiple frames for a sustained living bloom
    for (let i = 0; i < spawnCount; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)] || 'a';
      spawnQueue.push(char);
    }
  }

  function processSpawnQueue() {
    if (spawnQueue.length === 0) return;
    // Spawn 2 to 4 particles per frame to create a sustained multi-frame swirl
    const toSpawn = Math.min(spawnQueue.length, 3);
    for (let i = 0; i < toSpawn; i++) {
      const char = spawnQueue.shift();
      if (bioAlgaeParticles.length >= MAX_ALGAE) {
        bioAlgaeParticles.shift(); // Replace oldest
      }
      const coords = getLetterCoordinates(char);
      bioAlgaeParticles.push(new BioAlgaeParticle(coords.x, coords.y, char));
    }
  }

  function updateSystem(dt) {
    updateGlowbugs(dt);
    processSpawnQueue();

    // Decay algae activity
    algaeActivity = Math.max(0.1, algaeActivity - activityDecay * dt);

    // Update bio-algae particles
    for (let i = bioAlgaeParticles.length - 1; i >= 0; i--) {
      bioAlgaeParticles[i].update(dt);
      if (bioAlgaeParticles[i].life <= 0) {
        bioAlgaeParticles.splice(i, 1);
      }
    }
  }

  function drawBackground() {
    if (!ctx || !bgCanvas) return;
    ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

    // Atmospheric deep abyssal background radial gradient
    const bgGrad = ctx.createRadialGradient(
      bgCanvas.width / 2, bgCanvas.height / 2, 0,
      bgCanvas.width / 2, bgCanvas.height / 2, bgCanvas.width * 0.75
    );
    bgGrad.addColorStop(0, `rgba(4, 20, 38, ${0.15 + algaeActivity * 0.25})`);
    bgGrad.addColorStop(0.6, `rgba(2, 10, 20, ${0.08 + algaeActivity * 0.15})`);
    bgGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    // 1. Draw User Fireflies (golden/yellow/green glowbugs)
    drawGlowbugs();

    // 2. Draw AI Bio-Algae (electric blue/cyan particles)
    bioAlgaeParticles.forEach(p => p.draw(ctx));
  }

  function animationLoop(ts) {
    if (ts - lastFrameTime < FRAME_INTERVAL) {
      requestAnimationFrame(animationLoop);
      return;
    }
    const dt = Math.min(ts - lastFrameTime, 100);
    lastFrameTime = ts;

    updateSystem(dt);
    drawBackground();
    requestAnimationFrame(animationLoop);
  }

  function boostFire(chars, fullText) {
    algaeActivity = Math.min(1.0, algaeActivity + Math.min(0.5, (chars / 2000) * 0.4));
    feedBioAlgaeFromText(fullText || "The Adze storytelling AI policy assistant");
  }

  function initAnimations() {
    bgCanvas = document.getElementById('bgCanvas');
    if (!bgCanvas) return;
    ctx = bgCanvas.getContext('2d');
    resizeCanvas();
    createGlowbugs();
    window.addEventListener('resize', resizeCanvas);

    // User Keypresses feed fireflies
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
