"use client";

import { useEffect, useRef, useCallback } from "react";

const CARD_COUNT = 4;
const PARTICLE_COUNT = 35;
const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

type Card = {
  x: number;
  y: number;
  w: number;
  h: number;
  phase: number;
  opacity: number;
  driftX: number;
  driftY: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  phase: number;
};

function initCards(cw: number, ch: number): Card[] {
  const cards: Card[] = [];
  for (let i = 0; i < CARD_COUNT; i++) {
    const aspect = 0.65 + Math.random() * 0.35;
    const base = Math.min(cw, ch) * (0.12 + Math.random() * 0.12);
    const w = base;
    const h = base * aspect;
    cards.push({
      x: Math.random() * (cw - w) - w * 0.2,
      y: Math.random() * (ch - h) - h * 0.2,
      w,
      h,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.015 + Math.random() * 0.03,
      driftX: (Math.random() - 0.5) * 0.15,
      driftY: (Math.random() - 0.5) * 0.08,
    });
  }
  return cards;
}

function initParticles(cw: number, ch: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * cw,
      y: Math.random() * ch,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.15,
      size: 0.5 + Math.random() * 1.2,
      opacity: 0.02 + Math.random() * 0.04,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return particles;
}

export function ResaleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardsRef = useRef<Card[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const lastRef = useRef(0);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const t = lastRef.current * 0.001;

    ctx.clearRect(0, 0, cw, ch);

    // Soft grid: very subtle, supports without distracting
    ctx.strokeStyle = "rgba(255,255,255,0.012)";
    ctx.lineWidth = 1;
    const lineSpacing = 80;
    const offset = (t * 12) % lineSpacing;
    for (let y = -offset; y < ch + lineSpacing; y += lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(cw, y);
      ctx.stroke();
    }

    // Card silhouettes: rounded rects that drift and fade
    const cards = cardsRef.current;
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      const x = c.x + Math.sin(t + c.phase) * cw * c.driftX;
      const y = c.y + Math.cos(t * 0.7 + c.phase) * ch * c.driftY;
      const opacity = c.opacity * (0.6 + 0.4 * Math.sin(t * 0.5 + c.phase * 2));
      const r = Math.min(c.w, c.h) * 0.08;

      ctx.strokeStyle = `rgba(255,255,255,${Math.min(opacity, 0.045)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      roundRect(ctx, x, y, c.w, c.h, r);
      ctx.stroke();
    }

    // Data particles: sparse dots suggesting extracted features / value signals
    const particles = particlesRef.current;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > cw) p.vx *= -1;
      if (p.y < 0 || p.y > ch) p.vy *= -1;
      p.x = Math.max(0, Math.min(cw, p.x));
      p.y = Math.max(0, Math.min(ch, p.y));

      const flicker = 0.75 + 0.25 * Math.sin(t * 2 + p.phase);
      ctx.fillStyle = `rgba(255,255,255,${Math.min(p.opacity * flicker, 0.055)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      cardsRef.current = initCards(w, h);
      particlesRef.current = initParticles(w, h);
    };

    resize();
    window.addEventListener("resize", resize);

    let lastTick = 0;
    const loop = (now: number) => {
      rafRef.current = requestAnimationFrame(loop);
      if (now - lastTick >= FRAME_INTERVAL) {
        lastTick = now;
        lastRef.current = now;
        draw();
      }
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 h-full w-full pointer-events-none"
      style={{ imageRendering: "auto" }}
      aria-hidden
    />
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}
