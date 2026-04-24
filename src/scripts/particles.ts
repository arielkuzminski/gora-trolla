if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const canvas = document.getElementById('hero-particles');

  if (canvas instanceof HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const CONFIG = {
        count: 45,
        colors: [
          'rgba(240, 192, 96, ',
          'rgba(212, 168, 67, ',
          'rgba(255, 160, 40, ',
          'rgba(220, 100, 30, ',
          'rgba(176, 32, 32, ',
        ],
        minSize: 1.2,
        maxSize: 3.2,
        minSpeed: 0.35,
        maxSpeed: 1.1,
        wobbleStrength: 0.6,
        wobbleSpeed: 0.018,
      };

      let particles: Particle[] = [];
      let raf = 0;
      let width = 0;
      let height = 0;

      function resize() {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
      }

      class Particle {
        x = 0;
        y = 0;
        size = 0;
        speed = 0;
        color = CONFIG.colors[0];
        alpha = 0;
        alphaDecay = 0;
        wobbleOffset = 0;
        wobbleAmplitude = 0;
        life = 0;
        maxLife = 0;

        constructor(fromBottom: boolean) {
          this.reset(fromBottom);
        }

        reset(fromBottom: boolean) {
          this.x = Math.random() * width;
          this.y = fromBottom ? height + Math.random() * 80 : Math.random() * height;
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
          this.life += 1;
          this.y -= this.speed;
          this.x += Math.sin(this.life * CONFIG.wobbleSpeed + this.wobbleOffset) * this.wobbleAmplitude;

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
          ctx.fillStyle = `${this.color}${this.alpha.toFixed(3)})`;
          ctx.shadowBlur = this.size * 4;
          ctx.shadowColor = `${this.color}0.9)`;
          ctx.fill();
          ctx.restore();
        }
      }

      function init() {
        resize();
        particles = [];
        for (let i = 0; i < CONFIG.count; i += 1) {
          particles.push(new Particle(false));
        }
      }

      function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i += 1) {
          particles[i].update();
          particles[i].draw();
        }

        raf = requestAnimationFrame(animate);
      }

      function startParticles() {
        init();
        animate();
      }

      window.addEventListener('resize', resize, { passive: true });

      document.addEventListener('astro:page-load', startParticles, { once: true });
      {
      }

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          cancelAnimationFrame(raf);
        } else {
          animate();
        }
      });
    }
  }
}
