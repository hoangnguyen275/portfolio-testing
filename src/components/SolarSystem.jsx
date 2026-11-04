import { useEffect, useRef } from "react";
import { ellipsePath } from "../lib/flightMath";
import sun from "../assets/planets/sun.webp";
import mercury from "../assets/planets/mercury.webp";
import venus from "../assets/planets/venus.webp";
import earth from "../assets/planets/earth.webp";
import mars from "../assets/planets/mars.webp";
import jupiter from "../assets/planets/jupiter.webp";
import saturn from "../assets/planets/saturn.webp";
import uranus from "../assets/planets/uranus.webp";
import neptune from "../assets/planets/neptune.webp";
import "./SolarSystem.css";

/*
  The solar system as a page background: a big sun in the middle and eight planets,
  each on its own tilted ring (like a textbook diagram). Everything lives in a 600x600
  viewBox; the lane scales it to --L pixels.
  - rx:   horizontal radius of the planet's ring (ry = rx * RING_SQUASH)
  - size: planet width as a % of the lane
  - lap:  seconds for one trip round the ring (inner planets are quicker)
  - phase: where on the ring it starts (0..1), spread out so they don't line up
  - rock: ringed planets sway back and forth instead of rolling (a spinning ring looks wrong)
*/
const SUN_SIZE = 20; // % of the lane: still clearly bigger than any planet
const RING_SQUASH = 0.78; // how flattened the rings are
const TILT = -20; // degrees; negative lifts the right-hand side
// Rings are 40 units apart (rx 96 -> 376) so there is clear space between neighbours.
// Planets are kept small relative to that gap so they never crowd the next ring.
const PLANETS = [
  { src: mercury, size: 4.2, rx: 96, lap: 22, phase: 0.1 },
  { src: venus, size: 6, rx: 136, lap: 34, phase: 0.62 },
  { src: earth, size: 6.4, rx: 176, lap: 46, phase: 0.31 },
  { src: mars, size: 5, rx: 216, lap: 60, phase: 0.83 },
  { src: jupiter, size: 10, rx: 256, lap: 82, phase: 0.45 },
  { src: saturn, size: 10.5, rx: 296, lap: 104, phase: 0.05, rock: true },
  { src: uranus, size: 8.2, rx: 336, lap: 132, phase: 0.7, rock: true },
  { src: neptune, size: 7.2, rx: 376, lap: 164, phase: 0.22 },
];

const ORBITS = PLANETS.map((p) => ellipsePath(300, 300, p.rx, p.rx * RING_SQUASH, TILT));
const ROLL = 1; // 1 = true rolling without slipping; negative rolls the other way
const ROCK_DEG = 14;
const ROCK_SPEED = 2.4;

export default function SolarSystem() {
  const laneRef = useRef(null);
  const orbitRefs = useRef([]);
  const planetRefs = useRef([]);
  const imgRefs = useRef([]);

  useEffect(() => {
    const lane = laneRef.current;
    if (!lane) return;

    const totals = orbitRefs.current.map((o) => (o ? o.getTotalLength() : 1));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let clock = 0; // ms of animation time
    let last = performance.now();
    let visible = false;
    let raf = 0;
    let size = lane.offsetWidth || 1; // lane width in px, so viewBox units can be turned into pixels

    function draw() {
      const k = size / 600;
      PLANETS.forEach((p, i) => {
        const orbit = orbitRefs.current[i];
        const el = planetRefs.current[i];
        const img = imgRefs.current[i];
        if (!orbit || !el || !img) return;
        const total = totals[i];
        // distance travelled round this planet's ring (un-wrapped so rolling never snaps back after a lap)
        const travelled = (clock / 1000 / p.lap + p.phase) * total;
        const pt = orbit.getPointAtLength(((travelled % total) + total) % total);
        el.style.transform = `translate(${pt.x * k}px, ${pt.y * k}px) translate(-50%, -50%)`;
        // roly-poly: angle = distance travelled / radius
        const radius = p.size * 3;
        img.style.transform = p.rock
          ? `rotate(${Math.sin((clock / 1000) * ROCK_SPEED + i) * ROCK_DEG}deg)`
          : `rotate(${((travelled / radius) * 180 * ROLL) / Math.PI}deg)`;
      });
    }

    function tick(now) {
      clock += now - last;
      last = now;
      draw();
      raf = visible ? requestAnimationFrame(tick) : 0;
    }

    draw(); // place everything once, even when motion is reduced
    const ro = new ResizeObserver(() => {
      size = lane.offsetWidth || 1;
      draw();
    });
    ro.observe(lane);

    // only animate while the lane is on (or near) the screen, and not at all if motion is reduced
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !raf && !reduceMotion) {
          last = performance.now();
          raf = requestAnimationFrame(tick);
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(lane);

    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={laneRef} className="solarSystem" aria-hidden="true">
      <svg className="solarSystem__svg" viewBox="0 0 600 600">
        {ORBITS.map((d, i) => (
          <path
            key={i}
            ref={(el) => {
              orbitRefs.current[i] = el;
            }}
            d={d}
            className="solarSystem__orbit"
          />
        ))}
      </svg>

      <div className="solarSystem__sun" style={{ width: `${SUN_SIZE}%` }}>
        <img src={sun} alt="" draggable="false" />
      </div>

      {PLANETS.map((p, i) => (
        <div
          key={i}
          ref={(el) => {
            planetRefs.current[i] = el;
          }}
          className="solarSystem__planet"
          style={{ width: `${p.size}%` }}
        >
          <img
            ref={(el) => {
              imgRefs.current[i] = el;
            }}
            src={p.src}
            alt=""
            draggable="false"
          />
        </div>
      ))}
    </div>
  );
}
