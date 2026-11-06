/**
 * cubicBezier: turns CSS-style control points into a GSAP ease function.
 * Why: GSAP's ease strings do not understand `cubic-bezier(...)` without its CustomEase plugin, but accept a
 * function. The site's rise animations use the same curve as the CSS ones, cubic-bezier(.2,.7,.2,1).
 * Method: solve x(t) = progress for t by Newton's method, then return y(t) (the same maths browsers use).
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (p: number) => number {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const x = (t: number) => ((ax * t + bx) * t + cx) * t;
  const y = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (p) => {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    let t = p;
    for (let i = 0; i < 8; i++) {
      const err = x(t) - p;
      if (Math.abs(err) < 1e-5) break;
      const slope = dx(t);
      if (Math.abs(slope) < 1e-6) break;
      t -= err / slope;
    }
    return y(Math.min(1, Math.max(0, t)));
  };
}
