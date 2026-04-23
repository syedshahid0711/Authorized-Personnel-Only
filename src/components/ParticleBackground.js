import React, { useEffect, useRef } from 'react';

const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    // Resize canvas to match window size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };
    window.addEventListener('resize', resize);

    // Track mouse position
    let mouse = { x: null, y: null, radius: 150 };
    const handleMouseMove = (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);

    // Particle Class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        // Make dots slightly different sizes
        this.size = Math.random() * 2.5 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 20) + 1;
        
        // Randomize colors to match the Antigravity style (blue, teal, white)
        const colors = [
          'rgba(59, 130, 246, 0.7)',  // Blue
          'rgba(16, 185, 129, 0.7)',  // Green/Teal
          'rgba(255, 255, 255, 0.4)', // White
          'rgba(148, 163, 184, 0.5)'  // Grayish
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }

      update() {
        // Mouse interaction logic (repulsion)
        if (mouse.x != null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          let forceDirectionX = dx / distance;
          let forceDirectionY = dy / distance;
          let maxDistance = mouse.radius;
          let force = (maxDistance - distance) / maxDistance;
          let directionX = forceDirectionX * force * this.density;
          let directionY = forceDirectionY * force * this.density;

          if (distance < mouse.radius) {
            this.x -= directionX;
            this.y -= directionY;
          } else {
            if (this.x !== this.baseX) {
              let dx = this.x - this.baseX;
              this.x -= dx / 10;
            }
            if (this.y !== this.baseY) {
              let dy = this.y - this.baseY;
              this.y -= dy / 10;
            }
          }
        } else {
          // Slowly return to base if mouse leaves
          if (this.x !== this.baseX) {
            let dx = this.x - this.baseX;
            this.x -= dx / 20;
          }
          if (this.y !== this.baseY) {
            let dy = this.y - this.baseY;
            this.y -= dy / 20;
          }
        }
        
        // Add a slight constant floating movement
        this.baseX += (Math.random() - 0.5) * 0.5;
        this.baseY += (Math.random() - 0.5) * 0.5;

        this.draw();
      }
    }

    // Initialize particles
    const init = () => {
      particles = [];
      // Calculate number of particles based on screen size so it's not too crowded
      const numberOfParticles = (canvas.width * canvas.height) / 8000;
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    };

    // First initialization
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1, // Keep it behind everything
        pointerEvents: 'none' // Let clicks pass through to the dashboard
      }}
    />
  );
};

export default ParticleBackground;
