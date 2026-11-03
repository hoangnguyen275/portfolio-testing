import { useEffect, useRef } from "react";
import rocketIcon from "../assets/rocket-icon.ico";
import { heartPoint, smoothSegments, unit, wrap180 } from "../lib/flightMath";
import "./ScrollRocket.css";

/*
  A rocket that follows one invisible SVG path as you scroll.

  - WAYPOINTS place the path relative to page sections: x = % of page width,
    y = fraction of that section's height (can be <0 or >1 to sit above/below it).
  - `loop`  makes a loop-the-loop (radius r, turn = +1 / -1 for the side it curls to).
  - `heart` traces a heart and leaves a dotted outline behind.
  - Scroll position -> distance along the path (piecewise linear "anchors").
  - The rocket eases toward that distance, but loops play at a fixed speed and can't be skipped.
*/
const WAYPOINTS = [
  { at: "about", x: 50, y: -0.15 },
  { at: "about", x: 90, y: 0.12 },
  { at: "about", x: 90, y: 0.78, loop: { r: 55, turn: -1 } },
  { at: "skills", x: 90, y: 0.04 },
  { at: "skills", x: 94, y: 0.32 },
  { at: "skills", x: 94, y: 0.5, loop: { r: 50, turn: -1 } },
  { at: "skills", x: 8, y: 0.92 },
  { at: "ProjectContainer", x: 12, y: 0.2 },
  { at: "ProjectContainer", x: 88, y: 0.55 },
  { at: "footer", x: 50, y: -0.6, heart: { size: 55 } },
  { at: "footer", x: 88, y: 0.3 },
];

const HOME_ANGLE = 0; // the picture already points up-right, so no rotation at rest
const HANDOFF = 0.55; // first 55% of a viewport of scroll blends home pose -> flight pose
const TRAIL_OPACITY = [1, 0.6, 0.3];
const SEGMENTS = 28; // points per loop / heart
const TRAIL_DOTS = SEGMENTS + 1;
const LOOP_MS = 1500; // a loop always takes this long, however fast you scroll (was 700)
const CHASE = 0.07; // fraction of the gap to the scroll position closed per frame: lower = slower, floatier (was 0.2)
const SVGNS = "http://www.w3.org/2000/svg";

export default function ScrollRocket() {
  const layerRef = useRef(null);
  const svgRef = useRef(null);
  const measureRef = useRef(null);
  const routeRef = useRef(null);
  const trailRef = useRef(null);
  const heartsRef = useRef(null);
  const shipRef = useRef(null);

  useEffect(() => {
    const layer = layerRef.current;
    const svg = svgRef.current;
    const measure = measureRef.current;
    const route = routeRef.current;
    const trailG = trailRef.current;
    const heartsG = heartsRef.current;
    const ship = shipRef.current;
    if (!layer || !svg || !measure || !route || !trailG || !heartsG || !ship) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // fading dots that trail behind the rocket
    trailG.replaceChildren();
    const trail = [];
    for (let i = 0; i < TRAIL_DOTS; i++) {
      const c = document.createElementNS(SVGNS, "circle");
      c.setAttribute("r", "2");
      c.setAttribute("class", "rocketDot");
      c.setAttribute("opacity", "0");
      trailG.appendChild(c);
      trail.push(c);
    }

    let model = null; // everything derived from the current page layout
    let cur = -1; // where the rocket is on the path (px of path length)
    let tgt = 0; // where the scroll position says it should be
    let raf = 0;
    let last = 0;
    let dir = 1; // +1 flying down the page, -1 flying back up
    let smoothAngle = null;

    /* ---------- BUILD: turn waypoints into one path (rerun whenever the layout changes) ---------- */
    function build() {
      const home = document.querySelector("[data-rocket-home]");
      if (!home || home.offsetWidth === 0) {
        // small screens hide the rocket picture; skip the whole effect there
        model = null;
        ship.style.visibility = "hidden";
        return;
      }
      const box = layer.getBoundingClientRect();
      const W = box.width;
      const H = box.height;
      const pts = [];
      const anchors = []; // {idx: path point index, scrollY: page y at which the rocket is there}
      const loops = []; // {start, end} as point indexes
      const hearts = [];

      // the path starts at the (hidden) home picture's centre
      const hr = home.getBoundingClientRect();
      pts.push({ x: hr.left - box.left + hr.width / 2, y: hr.top - box.top + hr.height / 2 });
      anchors.push({ idx: 0, scrollY: 0.5 * window.innerHeight - (box.top + window.scrollY) });

      const wps = WAYPOINTS.flatMap((wp) => {
        const el = document.getElementById(wp.at);
        if (!el) return [];
        const r = el.getBoundingClientRect();
        return [{ wp, base: { x: (wp.x / 100) * W, y: r.top - box.top + wp.y * r.height } }];
      });

      wps.forEach(({ wp, base }, e) => {
        if (wp.loop) {
          const { r, turn = 1 } = wp.loop;
          const prev = pts[pts.length - 1] ?? base;
          const next = wps[e + 1]?.base ?? base;
          const dIn = unit(base.x - prev.x, base.y - prev.y);
          const dOut = unit(next.x - base.x, next.y - base.y);
          const fwd = unit(dIn.x + dOut.x, dIn.y + dOut.y); // average heading through the loop
          const side = { x: fwd.y, y: -fwd.x };
          const f = 0.3 * r;
          const start = pts.length;
          for (let i = 0; i <= SEGMENTS; i++) {
            // prolate cycloid = a loop-the-loop
            const t = -Math.PI + (2 * Math.PI * i) / SEGMENTS;
            const along = f * t - r * Math.sin(t);
            const across = turn * r * (1 + Math.cos(t));
            pts.push({
              x: base.x + fwd.x * along + side.x * across,
              y: base.y + fwd.y * along + side.y * across,
            });
          }
          const end = pts.length - 1;
          anchors.push({ idx: start, scrollY: pts[start].y });
          anchors.push({ idx: end, scrollY: pts[start].y }); // same scrollY: scrolling "pauses" while looping
          anchors.push({ idx: end, scrollY: pts[end].y });
          loops.push({ start, end });
        } else if (wp.heart) {
          const { size } = wp.heart;
          const start = pts.length;
          for (let i = 0; i <= SEGMENTS; i++) {
            const h = heartPoint((2 * Math.PI * i) / SEGMENTS, size);
            pts.push({ x: base.x + h.x, y: base.y + h.y });
          }
          hearts.push({ start, end: pts.length - 1 });
          const bottom = pts[start].y + 3 * size;
          anchors.push({ idx: start, scrollY: pts[start].y });
          anchors.push({ idx: pts.length - 1, scrollY: bottom });
          if (e < wps.length - 1) {
            // hop out of the heart toward the next waypoint
            const t = pts[pts.length - 1];
            const d = wps[e + 1].base.x < t.x ? -1 : 1;
            pts.push({ x: t.x + d * size * 0.3, y: t.y - 0.45 * size });
            pts.push({ x: t.x + d * size * 0.95, y: t.y - 0.25 * size });
            pts.push({ x: t.x + d * size * 1.05, y: t.y + 0.9 * size });
          }
        } else {
          pts.push(base);
          anchors.push({ idx: pts.length - 1, scrollY: base.y });
        }
      });
      if (pts.length < 2) return;

      const segs = smoothSegments(pts);
      const lenTo = (idx) => {
        // path length up to point `idx`, measured on a scratch path
        if (idx === 0) return 0;
        measure.setAttribute("d", `M${pts[0].x} ${pts[0].y}` + segs.slice(0, idx).join(""));
        return measure.getTotalLength();
      };
      let prevY = -Infinity;
      const A = anchors.map(({ idx, scrollY }) => ({
        scrollY: (prevY = Math.max(scrollY, prevY + 1)), // keep strictly increasing
        length: lenTo(idx),
      }));
      const L = loops.map(({ start, end }) => ({ start: lenTo(start), end: lenTo(end) }));
      route.setAttribute("d", `M${pts[0].x} ${pts[0].y}` + segs.join(""));
      svg.setAttribute("width", W);
      svg.setAttribute("height", H);

      // permanent dotted hearts, revealed once the rocket has flown past them
      heartsG.replaceChildren();
      const hv = hearts.map(({ start, end }) => {
        const s = lenTo(start);
        const e = lenTo(end);
        const g = document.createElementNS(SVGNS, "g");
        g.setAttribute("visibility", "hidden");
        for (let l = 10 * Math.ceil(s / 10); l <= e; l += 10) {
          const p = route.getPointAtLength(l);
          const c = document.createElementNS(SVGNS, "circle");
          c.setAttribute("cx", p.x);
          c.setAttribute("cy", p.y);
          c.setAttribute("r", "2");
          c.setAttribute("class", "rocketDot");
          g.appendChild(c);
        }
        heartsG.appendChild(g);
        return { end: e, g };
      });

      // pre-sample the finished path every 4px so per-frame lookups are cheap
      const total = route.getTotalLength();
      const samples = [];
      for (let i = 0; i <= Math.ceil(total / 4); i++) {
        samples.push(route.getPointAtLength(Math.min(i * 4, total)));
      }
      model = { A, L, hv, total, samples, W, H, boxTop: box.top + window.scrollY };
      kick();
    }

    /* ---------- scroll position -> distance along the path ---------- */
    function targetLength() {
      const { A, total, boxTop } = model;
      let t = window.scrollY + 0.5 * window.innerHeight - boxTop; // "reading line" = middle of the viewport
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const lastNeeded = A[A.length - 1].scrollY - (maxScroll + 0.5 * window.innerHeight - boxTop);
      if (lastNeeded > 0) {
        // the page can't scroll far enough to reach the end: stretch the final stretch
        t += lastNeeded * Math.min(Math.max((window.scrollY - (maxScroll - window.innerHeight)) / window.innerHeight, 0), 1);
      }
      if (t <= A[0].scrollY) return A[0].length;
      for (let i = 1; i < A.length; i++) {
        if (t <= A[i].scrollY) {
          const u = (t - A[i - 1].scrollY) / (A[i].scrollY - A[i - 1].scrollY);
          return A[i - 1].length + u * (A[i].length - A[i - 1].length);
        }
      }
      return total;
    }

    function pointAt(len) {
      const { samples, total } = model;
      const t = Math.min(Math.max(len, 0), total) / 4;
      const i = Math.min(Math.floor(t), samples.length - 2);
      const f = t - i;
      const a = samples[i];
      const b = samples[i + 1];
      return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
    }

    function homePose() {
      const home = document.querySelector("[data-rocket-home]");
      if (!home || !ship.offsetWidth) return null;
      const hb = home.getBoundingClientRect();
      const lb = layer.getBoundingClientRect();
      return { scale: hb.width / ship.offsetWidth, x: hb.left - lb.left + hb.width / 2, y: hb.top - lb.top + hb.height / 2 };
    }

    /* ---------- put the rocket at path distance `len` ---------- */
    function place(len) {
      const { total, hv } = model;
      const p = pointAt(len);
      const ahead = pointAt(Math.min(len + 2, total));
      const behind = pointAt(Math.max(len - 2, 0));
      const heading =
        (180 * (len + 2 <= total ? Math.atan2(ahead.y - p.y, ahead.x - p.x) : Math.atan2(p.y - behind.y, p.x - behind.x))) / Math.PI +
        (dir < 0 ? 180 : 0) +
        45; // +45: the picture points up-right; +180 when flying backwards

      // hand-off: near the top of the page, blend from the home pose to pure path-following
      const k = Math.min(Math.max(window.scrollY / (window.innerHeight * HANDOFF), 0), 1);
      const ease = k * k * (3 - 2 * k);
      const home = homePose();
      let target = heading;
      let scale = 1;
      if (home && ease < 1) {
        scale = home.scale + (1 - home.scale) * ease;
        target = HOME_ANGLE + wrap180(heading - HOME_ANGLE) * ease;
      }
      smoothAngle = smoothAngle === null ? target : smoothAngle + 0.25 * wrap180(target - smoothAngle);
      ship.style.visibility = "visible";
      ship.style.transform = `translate(${p.x}px,${p.y}px) translate(-50%,-50%) rotate(${smoothAngle}deg) scale(${scale})`;
      const settled = Math.abs(wrap180(target - smoothAngle)) < 0.5;

      // trail dots snapped to a 10px grid behind the rocket, fading with distance
      const reach = 280 * ease;
      const base = dir > 0 ? 10 * Math.floor(len / 10) : 10 * Math.ceil(len / 10);
      trail.forEach((c, i) => {
        const s = base - dir * i * 10;
        const d = Math.abs(len - s);
        if (s < 0 || s > total || d > reach) {
          c.setAttribute("opacity", "0");
          return;
        }
        const q = pointAt(s);
        c.setAttribute("cx", q.x);
        c.setAttribute("cy", q.y);
        c.setAttribute("opacity", TRAIL_OPACITY[Math.min(TRAIL_OPACITY.length - 1, Math.floor((d / 280) * TRAIL_OPACITY.length))]);
      });
      hv.forEach((h) => h.g.setAttribute("visibility", len >= h.end ? "visible" : "hidden"));
      return settled;
    }

    /* ---------- chase loop ---------- */
    function frame(now) {
      if (!model) {
        raf = 0;
        return;
      }
      const dt = Math.min(now - last, 50);
      last = now;
      const s = Math.sign(tgt - cur);
      if (s) dir = s;
      const inLoop = model.L.find((l) => (s > 0 ? cur >= l.start && cur < l.end : cur > l.start && cur <= l.end));
      if (inLoop) {
        const step = ((inLoop.end - inLoop.start) / LOOP_MS) * dt; // constant speed through the loop
        cur += s * Math.min(step, Math.abs(tgt - cur));
      } else {
        let next = cur + (tgt - cur) * CHASE; // ease a fraction of the remaining gap per frame
        for (const l of model.L) {
          // ...but stop at the mouth of a loop so it can't be skipped
          if (s > 0 && cur < l.start && next > l.start) next = l.start;
          if (s < 0 && cur > l.end && next < l.end) next = l.end;
        }
        cur = next;
      }
      if (Math.abs(tgt - cur) < 0.5) cur = tgt;
      const settled = place(cur);
      raf = cur === tgt && settled ? 0 : requestAnimationFrame(frame);
    }

    function kick() {
      if (!model) return;
      tgt = targetLength();
      if (cur < 0 || reduceMotion) {
        cur = tgt;
        place(cur);
        return;
      }
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }

    build();
    const ro = new ResizeObserver(build); // the page height changes as images load or the window resizes
    ro.observe(document.body);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    window.addEventListener("load", build);

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      window.removeEventListener("load", build);
      cancelAnimationFrame(raf);
      trailG.replaceChildren();
      heartsG.replaceChildren();
    };
  }, []);

  return (
    <div ref={layerRef} className="rocketLayer" aria-hidden="true">
      <svg ref={svgRef} className="rocketLayer__svg">
        <path ref={measureRef} fill="none" stroke="none" />
        <path ref={routeRef} fill="none" stroke="none" />
        <g ref={trailRef} />
        <g ref={heartsRef} />
      </svg>
      <div ref={shipRef} className="rocketShip">
        <div className="rocketShip__bob">
          <img src={rocketIcon} alt="" draggable="false" />
        </div>
      </div>
    </div>
  );
}
