export const TAU = Math.PI * 2;

export function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
export function lerp(a, b, t) { return a + (b - a) * t; }
export function smoothstep(a, b, t) {
  const x = clamp((t - a) / (b - a), 0, 1);
  return x * x * (3 - 2 * x);
}
export function vecLen(x, y) { return Math.hypot(x, y); }
export function vecNorm(x, y) {
  const l = Math.hypot(x, y) || 1;
  return { x: x / l, y: y / l };
}
export function dot(ax, ay, bx, by) { return ax * bx + ay * by; }
export function cross(ax, ay, bx, by) { return ax * by - ay * bx; }
export function angleNorm(a) {
  while (a < -Math.PI) a += TAU;
  while (a > Math.PI) a -= TAU;
  return a;
}
export function rand(a, b) { return a + Math.random() * (b - a); }
export function randInt(a, b) { return Math.floor(rand(a, b + 1)); }
export function sign(v) { return v < 0 ? -1 : v > 0 ? 1 : 0; }
export function mixAngles(a, b, t) {
  const d = angleNorm(b - a);
  return a + d * t;
}
