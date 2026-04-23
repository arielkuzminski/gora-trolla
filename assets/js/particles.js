/* ==========================================================================
   GÓRA TROLLA — Ember Particle Engine
   Canvas 2D — unoszące się iskry nad hero
   ========================================================================== */

(function () {
  'use strict';

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Particle config
  const CONFIG = {
    count: 45,
    colors: [
      'rgba(240, 192, 96, ',   // gold glow
      'rgba(212, 168, 67, ',   // gold bright
      'rgba(255, 160, 40, ',   // amber
      'rgba(220, 100, 30, ',   // deep amber
      'rgba(176, 32, 32, ',    // crimson ember
    ],
    minSize: 1.2,
    maxSize: 3.2,
    minSpeed: 0.35,
    maxSpeed: 1.1,
    wobbleStrength: 0.6,
    wobbleSpeed: 0.018,
  };

  let particles = [];
  let raf;
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor(fromBottom) {
      this.reset(fromBottom);
    }

    reset(fromBottom) {
      this.x = Math.random() * W;
      this.y = fromBottom ? H + Math.random() * 80 : Math.random() * H;
      this.size = CONFIG.minSize + Math.random() * (CONFIG.maxSize - CONFIG.minSize);
      this.speed = CONFIG.minSpeed + Math.random() * (CONFIG.maxSpeed - CONFIG.minSpeed);
      this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
      this.alpha = 0.1 + Math.random() * 0.75;
      this.alphaDecay = 0.0008 + Math.random() * 0.0012;
      this.wobbleOffset = Math.random() * Math.PI * 2;
      this.wobbleAmplitude = 0.3 + Math.random() * CONFIG.wobbleStrength;
      this.life = 0;
      this.maxLife = 180 + Math.random() * 200;
    }

    update() {
      this.life++;
      this.y -= this.speed;
      this.x += Math.sin(this.life * CONFIG.wobbleSpeed + this.wobbleOffset) * this.wobbleAmplitude;

      // Fade in first 30 frames, fade out last 60 frames
      if (this.life < 30) {
        this.alpha = (this.life / 30) * 0.85;
      } else if (this.life > this.maxLife - 60) {
        this.alpha = Math.max(0, this.alpha - this.alphaDecay * 3);
      }

      if (this.life >= this.maxLife || this.y < -10) {
        this.reset(true);
      }
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.alpha.toFixed(3) + ')';
      ctx.shadowBlur = this.size * 4;
      ctx.shadowColor = this.color + '0.9)';
      ctx.fill();
      ctx.restore();
    }
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < CONFIG.count; i++) {
      particles.push(new Particle(false));
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    raf = requestAnimationFrame(animate);
  }

  // Start
  window.addEventListener('resize', function () {
    resize();
  }, { passive: true });

  window.addEventListener('DOMContentLoaded', function () {
    init();
    animate();
  });

  // Pause when tab hidden (performance)
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      animate();
    }
  });
})();
