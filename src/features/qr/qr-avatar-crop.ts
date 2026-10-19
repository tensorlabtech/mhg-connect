export type AvatarCrop = { x: number; y: number; zoom: number };
export const DEFAULT_AVATAR_CROP: AvatarCrop = { x: 50, y: 50, zoom: 1 };

function bounded(
  value: number | undefined,
  fallback: number,
  min: number,
  max: number,
) {
  return Math.min(
    max,
    Math.max(min, Number.isFinite(value) ? value! : fallback),
  );
}
export function normalizeAvatarCrop(crop?: Partial<AvatarCrop>): AvatarCrop {
  return {
    x: bounded(crop?.x, 50, 0, 100),
    y: bounded(crop?.y, 50, 0, 100),
    zoom: bounded(crop?.zoom, 1, 1, 3),
  };
}
export function avatarCropStyle(crop?: AvatarCrop) {
  const { x, y, zoom } = normalizeAvatarCrop(crop);
  return {
    objectPosition: `${x}% ${y}%`,
    transformOrigin: `${x}% ${y}%`,
    transform: `scale(${zoom})`,
  };
}
/** Object-position and transform-origin share a focal point, keeping all edges covered. */
export function moveAvatarCrop(
  crop: AvatarCrop,
  dx: number,
  dy: number,
  size: number,
  imageWidth: number,
  imageHeight: number,
): AvatarCrop {
  const current = normalizeAvatarCrop(crop);
  if (
    ![size, imageWidth, imageHeight].every((v) => Number.isFinite(v) && v > 0)
  )
    return current;
  const cover = Math.max(size / imageWidth, size / imageHeight);
  const overflowX = imageWidth * cover * current.zoom - size;
  const overflowY = imageHeight * cover * current.zoom - size;
  return normalizeAvatarCrop({
    ...current,
    x:
      overflowX > 0.01
        ? Math.round((current.x - (dx / overflowX) * 100) * 100) / 100
        : current.x,
    y:
      overflowY > 0.01
        ? Math.round((current.y - (dy / overflowY) * 100) * 100) / 100
        : current.y,
  });
}
