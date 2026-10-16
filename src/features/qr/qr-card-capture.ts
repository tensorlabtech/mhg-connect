/** Remove presentation effects for the entire capture, restoring them even after errors. */
export async function withFlatCardCapture<T>(
  root: HTMLElement,
  capture: () => Promise<T>,
): Promise<T> {
  const surface =
    root.closest<HTMLElement>("[data-card-interactive]") ??
    root.querySelector<HTMLElement>("[data-card-interactive]");
  const previous = surface?.getAttribute("data-card-capture");
  surface?.setAttribute("data-card-capture", "true");
  try {
    await new Promise<void>((resolve) => {
      // Background tabs can suspend animation frames indefinitely.
      const fallback = setTimeout(resolve, 120);
      requestAnimationFrame(() => {
        clearTimeout(fallback);
        resolve();
      });
    });
    return await capture();
  } finally {
    if (surface) {
      if (previous === null) surface.removeAttribute("data-card-capture");
      else if (previous !== undefined)
        surface.setAttribute("data-card-capture", previous);
    }
  }
}
