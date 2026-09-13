export function createDefaultProfileLabel(date = new Date()) {
  return `Hồ sơ ${new Intl.DateTimeFormat("vi-VN").format(date)}`;
}
