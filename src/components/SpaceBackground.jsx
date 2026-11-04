import { useEffect, useRef } from "react";
import "./SpaceBackground.css";

/*
  Page-wide universe: a fixed gradient + twinkling stars (pure CSS), and a canvas of
  meteors. Each meteor enters from the right / top-right, flies left and is pulled
  down by "gravity", so it follows a falling curve rather than a straight line.
*/
const MAX_METEORS = 6;
const TAIL_SECONDS = 0.5; // how long the glowing tail is
const COLORS = ["255,255,255", "170,232,255", "200,184,255"]; // white, icy blue, lavender

export default function SpaceBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // stars only, no meteors

    const ctx = canvas.getContext("2d");
    let W = 0;
    let H = 0;
    const meteors = [];
    let raf = 0;
    let last = performance.now();
    let nextSpawn = last + 600;
    let dirty = false; // true while something is on the canvas that needs clearing

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn() {
      const fromTop = Math.random() < 0.6; // enter along the top edge, or down the right edge
      const speed = 420 + Math.random() * 380;
      meteors.push({
        x: fromTop ? W * (0.35 + Math.random() * 0.75) : W + 40,
        y: fromTop ? -40 : Math.random() * H * 0.55,
        vx: -speed * (0.85 + Math.random() * 0.35), // always travelling right -> left
        vy: speed * (0.1 + Math.random() * 0.25), // a little downward to begin with...
        g: 320 + Math.random() * 420, // ...then gravity bends the path down
        width: 1.4 + Math.random() * 1.6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        trail: [], // recent positions, newest last
      });
    }

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (now >= nextSpawn && meteors.length < MAX_METEORS) {
        spawn();
        nextSpawn = now + 900 + Math.random() * 2200;
      }

      if (meteors.length || dirty) {
        ctx.clearRect(0, 0, W, H);
        dirty = meteors.length > 0;
      }

      for (let m = meteors.length - 1; m >= 0; m--) {
        const s = meteors[m];
        s.vy += s.g * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.trail.push({ x: s.x, y: s.y, t: now });
        while (s.trail.length && now - s.trail[0].t > TAIL_SECONDS * 1000) s.trail.shift();

        if (s.x < -200 || s.y > H + 200) {
          // let the tail finish fading out once the head has left the screen
          if (!s.trail.length || now - s.trail[s.trail.length - 1].t > TAIL_SECONDS * 1000) {
            meteors.splice(m, 1);
            continue;
          }
        }

        // tail: short segments that get brighter and thicker toward the head
        ctx.lineCap = "round";
        for (let i = 1; i < s.trail.length; i++) {
          const a = s.trail[i - 1];
          const b = s.trail[i];
          const k = i / s.trail.length; // 0 = tail tip, 1 = head
          ctx.strokeStyle = `rgba(${s.color},${(k * k * 0.9).toFixed(3)})`;
          ctx.lineWidth = s.width * (0.25 + 0.75 * k);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        // glowing head
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.width * 4);
        g.addColorStop(0, `rgba(${s.color},0.95)`);
        g.addColorStop(1, `rgba(${s.color},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.width * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(frame);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="space" aria-hidden="true">
      <div className="space__stars space__stars--far" />
      <div className="space__stars space__stars--near" />
      <canvas ref={canvasRef} className="space__meteors" />
    </div>
  );
}
