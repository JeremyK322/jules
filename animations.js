// ── Bioluminescent Ocean Waves & Electric Blue Algae Animation ────────────
(function(window) {
  let bgCanvas, ctx;
  let activityIntensity = 0.15; // Ambient activity level
  const maxActivity = 1.0;
  const activityDecay = 0.00015; // Decay rate per ms

  const algaeParticles = [];
  const MAX_ALGAE = 120;
  let lastFrameTime = 0;
  const FRAME_INTERVAL = 1000 / 30; // 30 FPS target

  function resizeCanvas() {
    if (!bgCanvas) return;
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }

  class BioAlgae {
    constructor(x, y, isBloom = false) {
      this.x = x !== undefined ? x : Math.random() * (bgCanvas ? bgCanvas.width : window.innerWidth);
      this.y = y !== undefined ? y : (bgCanvas ? bgCanvas.height : window.innerHeight) - Math.random() * (bgCanvas ? bgCanvas.height * 0.6 : 400);
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = -Math.random() * 0.6 - 0.2;
      this.size = 1.5 + Math.random() * 3.5;
      this.life = 1.0;
      this.decay = 0.002 + Math.random() * 0.004;
      this.hue = 180 + Math.random() * 35; // Cyan (180) to Electric Blue (215)
      this.brightness = isBloom ? 0.9 + Math.random() * 0.1 : 0.4 + Math.random() * 0.5;
      this.phase = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.002 + Math.random() * 0.003;
    }

    update(dt) {
      const now = performance.now();
      this.x += this.vx + Math.sin(now * 0.001 + this.phase) * 0.5;
      this.y += this.vy + Math.cos(now * 0.0012 + this.phase) * 0.3;
      this.life -= this.decay;
      this.brightness = Math.min(1.0, this.brightness + Math.sin(now * this.pulseSpeed) * 0.05);

      if (this.x < -20) this.x = (bgCanvas ? bgCanvas.width : window.innerWidth) + 20;
      if (this.x > (bgCanvas ? bgCanvas.width : window.innerWidth) + 20) this.x = -20;
    }

    draw(ctx) {
      if (this.life <= 0) return;
      const alpha = Math.max(0, this.life * this.brightness * (0.4 + activityIntensity * 0.6));
      const glowRadius = this.size * (6 + activityIntensity * 8);

      // Outer glowing halo
      const glowGrad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowRadius);
      glowGrad.addColorStop(0, `hsla(${this.hue}, 100%, 65%, ${alpha * 0.7})`);
      glowGrad.addColorStop(0.4, `hsla(${this.hue}, 90%, 50%, ${alpha * 0.25})`);
      glowGrad.addColorStop(1, 'transparent');

      ctx.save();
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Intense bioluminescent core
      ctx.fillStyle = `hsla(${this.hue}, 100%, 88%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function createInitialAlgae() {
    algaeParticles.length = 0;
    const initialCount = Math.floor(MAX_ALGAE * 0.4);
    for (let i = 0; i < initialCount; i++) {
      algaeParticles.push(new BioAlgae());
    }
  }

  function boostAlgaeBloom() {
    // Add pulsing bioluminescent algae particles on keypress or AI response
    const bloomCount = 3 + Math.floor(activityIntensity * 8);
    for (let i = 0; i < bloomCount; i++) {
      if (algaeParticles.length < MAX_ALGAE) {
        const x = Math.random() * bgCanvas.width;
        const y = bgCanvas.height - Math.random() * (bgCanvas.height * 0.5);
        algaeParticles.push(new BioAlgae(x, y, true));
      }
    }
  }

  function drawBioluminescentWaves(time) {
    if (!ctx || !bgCanvas) return;
    const width = bgCanvas.width;
    const height = bgCanvas.height;

    // Number of active wave layers scales with AI activity (3 to 6 waves)
    const waveCount = 3 + Math.floor(activityIntensity * 3);
    const baseWaveHeight = height * 0.25;

    for (let i = 0; i < waveCount; i++) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, height);

      const waveSpeed = (0.0008 + i * 0.0004) * (1 + activityIntensity * 1.5);
      const amplitude = (15 + i * 12) * (1 + activityIntensity * 1.8);
      const frequency = 0.004 - i * 0.0006;

      for (let x = 0; x <= width; x += 15) {
        const y = height - baseWaveHeight + (i * 25) +
                  Math.sin(x * frequency + time * waveSpeed + i) * amplitude +
                  Math.cos(x * frequency * 0.5 + time * waveSpeed * 0.7) * (amplitude * 0.5);
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.closePath();

      // Wave color gradients (deep abyssal ocean to electric cyan crests)
      const hue = 185 + i * 10; // Cyan to Deep Sapphire Blue
      const alpha = (0.06 + (i * 0.03)) * (0.8 + activityIntensity * 1.2);

      const grad = ctx.createLinearGradient(0, height - baseWaveHeight, 0, height);
      grad.addColorStop(0, `hsla(${hue}, 100%, 60%, ${alpha * 1.5})`); // Crest bioluminescence
      grad.addColorStop(0.3, `hsla(${hue - 15}, 85%, 40%, ${alpha * 0.8})`);
      grad.addColorStop(1, `hsla(220, 90%, 10%, ${alpha * 0.4})`); // Deep ocean abyss

      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }
  }

  function updateSystem(dt) {
    // Slowly decay activity back to ambient floor
    activityIntensity = Math.max(0.12, activityIntensity - activityDecay * dt);

    // Maintain target algae particle count proportional to AI activity
    const targetAlgaeCount = Math.floor(25 + (MAX_ALGAE - 25) * (activityIntensity / maxActivity));
    while (algaeParticles.length < targetAlgaeCount) {
      algaeParticles.push(new BioAlgae());
    }

    // Update particles
    for (let i = algaeParticles.length - 1; i >= 0; i--) {
      algaeParticles[i].update(dt);
      if (algaeParticles[i].life <= 0) {
        algaeParticles.splice(i, 1);
      }
    }
  }

  function drawBackground() {
    if (!ctx || !bgCanvas) return;
    const now = performance.now();
    ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

    // Deep ocean atmospheric radial background
    const bgGrad = ctx.createRadialGradient(
      bgCanvas.width / 2, bgCanvas.height * 0.8, 0,
      bgCanvas.width / 2, bgCanvas.height * 0.8, bgCanvas.width * 0.8
    );
    bgGrad.addColorStop(0, `rgba(4, 25, 45, ${0.2 + activityIntensity * 0.35})`);
    bgGrad.addColorStop(0.6, `rgba(2, 12, 25, ${0.1 + activityIntensity * 0.2})`);
    bgGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    // Render waves
    drawBioluminescentWaves(now);

    // Render bio-algae plankton particles
    algaeParticles.forEach(p => p.draw(ctx));
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

  function boostFire(chars) {
    // Increase activity intensity as AI generates responses
    const boost = Math.min(0.35, (chars / 2500) * 0.25);
    activityIntensity = Math.min(maxActivity, activityIntensity + boost);
    boostAlgaeBloom();
  }

  function initAnimations() {
    bgCanvas = document.getElementById('bgCanvas');
    if (!bgCanvas) return;
    ctx = bgCanvas.getContext('2d');
    resizeCanvas();
    createInitialAlgae();
    window.addEventListener('resize', resizeCanvas);

    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        activityIntensity = Math.min(maxActivity, activityIntensity + 0.03);
        if (Math.random() < 0.3) boostAlgaeBloom();
      }
    });

    requestAnimationFrame(animationLoop);
  }

  window.initAnimations = initAnimations;
  window.boostFire = boostFire;
})(window);
