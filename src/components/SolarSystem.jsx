import { useEffect, useRef } from "react";
import { ellipsePath } from "../lib/flightMath";
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
  Eight planets circling on a tilted oval, drawn as a page background.
  Everything is in a 600x600 viewBox; the lane scales it to --L pixels.
  - size: planet width as a % of the lane
  - rock: ringed planets sway back and forth instead of rolling (a spinning ring looks wrong)
*/
const PLANETS = [
  { src: mercury, size: 7 },
  { src: venus, size: 9.5 },
  { src: earth, size: 10 },
  { src: mars, size: 8 },
  { src: jupiter, size: 14.5 },
  { src: saturn, size: 15, rock: true },
  { src: uranus, size: 13, rock: true },
  { src: neptune, size: 10 },
];

// oval ~35% bigger than the prototype's, tilted so the right side is 20 degrees higher
const ORBIT = ellipsePath(300, 300, 276, 216, -20);
const LAP_SECONDS = 60;
const ROLL = 1; // 1 = true rolling without slipping; negative rolls the other way
const ROCK_DEG = 14;
const ROCK_SPEED = 2.4;

export default function SolarSystem() {
  const laneRef = useRef(null);
  const orbitRef = useRef(null);
  const planetRefs = useRef([]);
  const imgRefs = useRef([]);

  useEffect(() => {
    const lane = laneRef.current;
    const orbit = orbitRef.current;
    if (!lane || !orbit) return;

    const total = orbit.getTotalLength();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let clock = 0; // ms of animation time
    let last = performance.now();
    let visible = false;
    let raf = 0;
    let size = lane.offsetWidth || 1; // lane width in px, so viewBox units can be turned into pixels

    function draw() {
      const k = size / 600;
      PLANETS.forEach((p, i) => {
        const el = planetRefs.current[i];
        const img = imgRefs.current[i];
        if (!el || !img) return;
        // each planet sits at an evenly staggered fraction of the lap
        const travelled = (clock / 1000 / LAP_SECONDS + i / PLANETS.length) * total;
        const pt = orbit.getPointAtLength(((travelled % total) + total) % total);
        el.style.transform = `translate(${pt.x * k}px, ${pt.y * k}px) translate(-50%, -50%)`;
        // roly-poly: angle = distance travelled / radius (un-wrapped so it never snaps back after a lap)
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
        <path ref={orbitRef} d={ORBIT} className="solarSystem__orbit" />
      </svg>
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
