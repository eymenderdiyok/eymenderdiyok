export const TireModel = {
  gripCurve(speed) {
    const s = Math.max(0, speed);
    const peak = 30;
    const base = 1.0;
    const drop = Math.min(1, (s - peak) / 80);
    return base - drop * 0.35;
  },
  slipToGrip(slip) {
    const x = Math.abs(slip);
    if (x < 0.1) return 1.0 - x * 2;
    if (x < 0.5) return 0.8 - (x-0.1) * 0.8;
    return 0.5 - Math.min(0.4, (x-0.5) * 0.3);
  }
};
