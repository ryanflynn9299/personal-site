"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animated Starfield Background
 * Creates a parallax effect with randomly generated stars.
 */
export function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    canvas.width = windowSize.width;
    canvas.height = windowSize.height;

    const stars: {
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
    }[] = [];
    const starCount = 200;

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random(),
      });
    }

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#020617"; // Slate 950
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });

      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [windowSize]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-20 pointer-events-none"
      style={{ filter: "blur(0.5px)" }}
    />
  );
}

/**
 * HUD Overlay Component
 * Adds subtle scanlines and a refined vignette.
 */
export function HUDOverlay() {
  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {/* Subtle Scanlines Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(56,189,248,0.01),rgba(167,139,250,0.01),rgba(56,189,248,0.01))] bg-[length:100%_4px,4px_100%]" />

      {/* Soft Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(15,23,42,0.6)]" />

      {/* Refined Boundary Lines */}
      <div className="absolute inset-x-8 top-8 h-px bg-sky-500/10 shadow-[0_0_8px_rgba(56,189,248,0.2)]" />
      <div className="absolute inset-x-8 bottom-8 h-px bg-sky-500/10 shadow-[0_0_8px_rgba(56,189,248,0.2)]" />
    </div>
  );
}
