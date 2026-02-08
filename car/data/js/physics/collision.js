import { clamp, vecLen } from '../core/math.js';

export function resolveCarCollision(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 1;
  const min = a.radius + b.radius;
  if (dist < min) {
    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = min - dist;
    a.x -= nx * overlap * 0.5;
    a.y -= ny * overlap * 0.5;
    b.x += nx * overlap * 0.5;
    b.y += ny * overlap * 0.5;
    const relvx = b.vx - a.vx;
    const relvy = b.vy - a.vy;
    const sep = relvx * nx + relvy * ny;
    if (sep < 0) {
      const impulse = -sep * 0.9;
      a.vx -= impulse * nx;
      a.vy -= impulse * ny;
      b.vx += impulse * nx;
      b.vy += impulse * ny;
    }
  }
}
