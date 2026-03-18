"use client";

import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
}

interface Orb {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  color1: string;
  color2: string;
  phase: number;
  phaseSpeed: number;
}

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animFrameRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let orbs: Orb[] = [];

    const colors = [
      "rgba(59, 130, 246, ", // blue
      "rgba(14, 165, 233, ", // cyan/sky
      "rgba(99, 102, 241, ", // indigo
      "rgba(139, 92, 246, ", // violet
    ];

    const orbColors: [string, string][] = [
      ["rgba(59, 130, 246, 0.12)", "rgba(14, 165, 233, 0.04)"],
      ["rgba(99, 102, 241, 0.10)", "rgba(139, 92, 246, 0.03)"],
      ["rgba(14, 165, 233, 0.08)", "rgba(59, 130, 246, 0.02)"],
    ];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
      initOrbs();
    }

    function initParticles() {
      const count = Math.min(Math.floor((width * height) / 12000), 100);
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.1,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }

    function initOrbs() {
      orbs = [];
      const orbCount = 3;
      for (let i = 0; i < orbCount; i++) {
        const oc = orbColors[i % orbColors.length];
        orbs.push({
          x: width * (0.2 + Math.random() * 0.6),
          y: height * (0.2 + Math.random() * 0.6),
          radius: 120 + Math.random() * 180,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          color1: oc[0],
          color2: oc[1],
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: 0.003 + Math.random() * 0.005,
        });
      }
    }

    function drawOrbs(time: number) {
      for (const orb of orbs) {
        orb.phase += orb.phaseSpeed;
        const breathe = Math.sin(orb.phase) * 20;
        const r = orb.radius + breathe;

        // Move orbs slowly
        orb.x += orb.vx;
        orb.y += orb.vy;

        // Bounce off edges
        if (orb.x - r < 0 || orb.x + r > width) orb.vx *= -1;
        if (orb.y - r < 0 || orb.y + r > height) orb.vy *= -1;

        const grad = ctx!.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          r,
        );
        grad.addColorStop(0, orb.color1);
        grad.addColorStop(0.6, orb.color2);
        grad.addColorStop(1, "rgba(0,0,0,0)");

        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(orb.x, orb.y, r, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function drawGrid() {
      const gridSize = 60;
      ctx!.strokeStyle = "rgba(59, 130, 246, 0.04)";
      ctx!.lineWidth = 0.5;

      // Horizontal lines
      for (let y = 0; y < height; y += gridSize) {
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(width, y);
        ctx!.stroke();
      }
      // Vertical lines
      for (let x = 0; x < width; x += gridSize) {
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, height);
        ctx!.stroke();
      }
    }

    function drawParticles() {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const connectionDist = 120;
      const mouseDist = 180;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse interaction — gentle repulsion
        const dxm = p.x - mx;
        const dym = p.y - my;
        const distMouse = Math.sqrt(dxm * dxm + dym * dym);
        if (distMouse < mouseDist && distMouse > 0) {
          const force = ((mouseDist - distMouse) / mouseDist) * 0.015;
          p.vx += (dxm / distMouse) * force;
          p.vy += (dym / distMouse) * force;
        }

        // Damping
        p.vx *= 0.998;
        p.vy *= 0.998;

        // Draw particle
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `${p.color}${p.opacity})`;
        ctx!.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.15;
            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(p2.x, p2.y);
            ctx!.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }

        // Connection to mouse
        if (distMouse < mouseDist) {
          const alpha = (1 - distMouse / mouseDist) * 0.3;
          ctx!.beginPath();
          ctx!.moveTo(p.x, p.y);
          ctx!.lineTo(mx, my);
          ctx!.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
          ctx!.lineWidth = 0.6;
          ctx!.stroke();
        }
      }
    }

    function drawArc(time: number) {
      // Large decorative arcs (like tellor.io circular elements)
      const cx = width * 0.75;
      const cy = height * 0.45;
      const r = Math.min(width, height) * 0.35;

      ctx!.save();
      ctx!.globalAlpha = 0.06;
      ctx!.strokeStyle = "rgba(59, 130, 246, 1)";
      ctx!.lineWidth = 1.5;

      // Outer arc
      const startAngle = time * 0.0002;
      ctx!.beginPath();
      ctx!.arc(cx, cy, r, startAngle, startAngle + Math.PI * 1.2);
      ctx!.stroke();

      // Inner arc
      ctx!.beginPath();
      ctx!.arc(cx, cy, r * 0.7, startAngle + Math.PI, startAngle + Math.PI * 2);
      ctx!.stroke();

      // Smallest arc
      ctx!.strokeStyle = "rgba(14, 165, 233, 1)";
      ctx!.beginPath();
      ctx!.arc(cx, cy, r * 0.4, -startAngle, -startAngle + Math.PI * 0.8);
      ctx!.stroke();

      ctx!.restore();
    }

    function animate(time: number) {
      ctx!.clearRect(0, 0, width, height);

      drawGrid();
      drawOrbs(time);
      drawArc(time);
      drawParticles();

      animFrameRef.current = requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [handleMouseMove]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "auto" }}
    />
  );
}
