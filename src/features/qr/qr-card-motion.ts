export function getCardMotion(x: number, y: number) {
  const clamp = (n: number) =>
    Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.5;
  x = clamp(x);
  y = clamp(y);
  return {
    rotateX: (0.5 - y) * 9,
    rotateY: (x - 0.5) * 12,
    glareX: x * 100,
    glareY: y * 100,
  };
}
