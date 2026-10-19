/** Refuse exporting clipped text rather than silently hiding information. */
export function getQrCardFitError(root: ParentNode): string | null {
  const card = root.querySelector<HTMLElement>("[data-qr-card]");
  if (!card) return null;
  const bounds = card.getBoundingClientRect();
  const qr = card.querySelector<HTMLElement>("[data-card-qr]");
  const copy = card.querySelector<HTMLElement>("[data-card-copy]");
  if (!qr || !copy || bounds.width === 0)
    return "Chưa thể đo kích thước thẻ. Hãy mở bản xem trước và thử lại.";
  const a = qr.getBoundingClientRect();
  const b = copy.getBoundingClientRect();
  if (
    a.left < bounds.left - 1 ||
    a.right > bounds.right + 1 ||
    a.top < bounds.top - 1 ||
    a.bottom > bounds.bottom + 1
  )
    return "QR nằm ngoài vùng in. Hãy chọn bố cục khác trước khi xuất thẻ.";
  if (
    a.left < b.right - 1 &&
    a.right > b.left + 1 &&
    a.top < b.bottom - 1 &&
    a.bottom > b.top + 1
  )
    return "QR đang chồng lên chữ. Hãy đổi bố cục trước khi xuất thẻ.";
  for (const element of card.querySelectorAll<HTMLElement>(
    "[data-card-copy], [data-card-copy] *, [data-card-tagline]",
  )) {
    // Avatar zoom is deliberately clipped by its circular frame, unlike overflowing text.
    const avatarFrame = element.closest?.(".digital-card-avatar-slot");
    if (avatarFrame && avatarFrame !== element) continue;
    // Export hides editor affordances; an unpainted node has a zero viewport rect.
    if (element.getClientRects?.().length === 0) continue;
    const box = element.getBoundingClientRect();
    if (
      box.left < bounds.left - 1 ||
      box.right > bounds.right + 1 ||
      box.top < bounds.top - 1 ||
      box.bottom > bounds.bottom + 1 ||
      (!avatarFrame &&
        (element.scrollWidth > element.clientWidth + 2 ||
          element.scrollHeight > element.clientHeight + 2))
    )
      return "Nội dung dài hơn vùng in. Hãy chọn bố cục khác, rút gọn thông tin trên mẫu thẻ hoặc đổi phông chữ trước khi xuất.";
  }
  const brand = card.querySelector<HTMLElement>(
    ".digital-card-header, .qr-card-brand",
  );
  if (brand && b.top < brand.getBoundingClientRect().bottom - 1)
    return "Phần chữ đang lấn vùng logo. Hãy đổi bố cục hoặc rút gọn nội dung trên mẫu thẻ.";
  return null;
}
