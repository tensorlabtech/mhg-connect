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

/**
 * Đổi độ nghiêng điện thoại (độ, so với lúc mở trang) thành vị trí 0..1 như con trỏ chuột.
 * Nghiêng khoảng 20° là chạm biên, đủ thấy rõ mà không phải xoay máy nhiều.
 */
export function getTiltFromOrientation(betaDelta: number, gammaDelta: number) {
  const range = 20;
  const toUnit = (n: number) =>
    Number.isFinite(n) ? Math.min(1, Math.max(0, 0.5 + n / (2 * range))) : 0.5;
  return { x: toUnit(gammaDelta), y: toUnit(betaDelta) };
}
