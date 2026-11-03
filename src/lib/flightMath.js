// Small geometry helpers shared by the rocket flight and the solar-system orbit.

/** Normalise a vector (returns {x:0,y:0}-safe unit vector). */
export const unit = (x, y) => {
  const m = Math.hypot(x, y) || 1;
  return { x: x / m, y: y / m };
};

/** Wrap an angle in degrees to the range [-180, 180). */
export const wrap180 = (a) => (((a % 360) + 540) % 360) - 180;

/** Point on the classic parametric heart curve (t in radians), scaled so the heart is about `size` px tall. */
export const heartPoint = (t, size) => {
  const k = size / 30;
  return {
    x: 16 * Math.sin(t) ** 3 * k,
    y:
      -(
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t)
      ) * k,
  };
};

/**
 * Smooth path through points: one cubic Bezier per segment whose tangent at each
 * point is the normalised direction between its neighbours (Catmull-Rom-like).
 * Returns the array of "C..." commands (without the leading "M").
 */
export function smoothSegments(pts) {
  const tangents = pts.map((p, i) => {
    const a = pts[i - 1] ?? p;
    const b = pts[i + 1] ?? p;
    return unit(b.x - a.x, b.y - a.y);
  });
  return pts.slice(1).map((p, i) => {
    const q = pts[i];
    const h = Math.hypot(p.x - q.x, p.y - q.y) / 3;
    const t0 = tangents[i];
    const t1 = tangents[i + 1];
    return `C${q.x + t0.x * h} ${q.y + t0.y * h} ${p.x - t1.x * h} ${p.y - t1.y * h} ${p.x} ${p.y}`;
  });
}

/**
 * A closed, clockwise ellipse as an SVG path, rotated by `tiltDeg` about its centre.
 * The rotation is baked into the path (not applied as a CSS transform) because
 * SVGPathElement.getPointAtLength ignores transforms.
 * Negative tiltDeg tilts the right-hand side upward on screen.
 */
export function ellipsePath(cx, cy, rx, ry, tiltDeg) {
  const t = (tiltDeg * Math.PI) / 180;
  const cos = Math.cos(t);
  const sin = Math.sin(t);
  const at = (x) => `${cx + x * cos} ${cy + x * sin}`; // point on the tilted major axis
  return `M${at(-rx)} A${rx} ${ry} ${tiltDeg} 1 1 ${at(rx)} A${rx} ${ry} ${tiltDeg} 1 1 ${at(-rx)} Z`;
}
