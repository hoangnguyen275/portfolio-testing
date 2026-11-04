import { useEffect, useRef } from "react";
import "./SpaceBackground.css";

/*
  Page-wide universe: a fixed gradient + twinkling stars (pure CSS), and a canvas of
  meteors. Each meteor enters from the right / top-right and flies in a straight line,
  slanting down toward the left at about the same angle as the others in its shower.

  Meteors arrive in showers: every BURST_EVERY_MS a handful (4 or 5) fall one after another.
  The whole layer is position:fixed, so it always fills the visible screen: wherever you have
  scrolled to, the shower plays out right there, behind the page content.
*/
const BURST_EVERY_MS = 6000; // time between showers
const BURST_MIN = 4; // meteors per shower: 4 or 5
const BURST_MAX = 5;
const BURST_SPREAD_MS = 1500; // the meteors of one shower start spread over this long
const FIRST_BURST_MS = 1000; // first shower, shortly after the page loads
const FALL_ANGLE_DEG = 35; // how steeply they fall: 0 = flat across the screen, 90 = straight down
const ANGLE_JITTER_DEG = 5; // each meteor's angle varies by up to this much, so they are nearly parallel
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
    let nextBurst = last + FIRST_BURST_MS; // when the next shower starts
    const queue = []; // start times of meteors in the current shower that haven't launched yet
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
      const speed = 520 + Math.random() * 300;
      const angle = ((FALL_ANGLE_DEG + (Math.random() * 2 - 1) * ANGLE_JITTER_DEG) * Math.PI) / 180;
      meteors.push({
        x: fromTop ? W * (0.4 + Math.random() * 0.85) : W + 40,
        y: fromTop ? -40 : Math.random() * H * 0.5,
        vx: -speed * Math.cos(angle), // right -> left...
        vy: speed * Math.sin(angle), // ...and down: constant, so the path is a straight line
        width: 1.4 + Math.random() * 1.6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        trail: [], // recent positions, newest last
      });
    }

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (now >= nextBurst) {
        // a new shower: schedule 4-5 meteors at random moments over the next second and a half
        const count = BURST_MIN + Math.floor(Math.random() * (BURST_MAX - BURST_MIN + 1));
        for (let i = 0; i < count; i++) queue.push(now + Math.random() * BURST_SPREAD_MS);
        nextBurst = now + BURST_EVERY_MS;
      }
      for (let q = queue.length - 1; q >= 0; q--) {
        if (now >= queue[q]) {
          spawn();
          queue.splice(q, 1);
        }
      }

      if (meteors.length || dirty) {
        ctx.clearRect(0, 0, W, H);
        dirty = meteors.length > 0;
      }

      for (let m = meteors.length - 1; m >= 0; m--) {
        const s = meteors[m];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        const gone = s.x < -200 || s.y > H + 200; // head has left the screen
        if (!gone) s.trail.push({ x: s.x, y: s.y, t: now });
        while (s.trail.length && now - s.trail[0].t > TAIL_SECONDS * 1000) s.trail.shift();
        if (gone && !s.trail.length) {
          // head is off-screen and the tail has finished fading: remove it
          meteors.splice(m, 1);
          continue;
        }
        if (s.trail.length < 2) continue; // nothing to draw yet

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
