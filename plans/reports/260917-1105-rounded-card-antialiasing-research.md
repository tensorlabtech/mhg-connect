# Rounded Card Anti-aliasing Research

---
date: 2026-09-17
status: applied
---

## Summary

Rounded QR cards showed a one-pixel hairline around image corners inside a
transformed dialog. Replacing `border-radius` clipping with `clip-path` did not
remove it.

## Findings

- Chromium documents that painting multiple layers through the same
  anti-aliased clip can create visible borders at fractional edge pixels.
- The card paints both a photo and a contrast overlay inside one curved edge.
- CSS Masking renders an element's descendants together as a group, then
  applies the mask to the group. This avoids repeatedly blending the same edge.
- WebKit has a long history of artifacts when transformed descendants combine
  with `overflow: hidden` and rounded corners. A mask is the established
  compositor workaround.

## Decision

Keep the physical-card `border-radius`, retain clipping for child content, and
add an opaque alpha mask to force one grouped compositing pass. Do not add a
fake border or inset shadow to conceal the artifact.

## References

- Chromium notes on anti-aliased clipping:
  https://neugierig.org/software/chromium/notes/2010/07/clipping.html
- CSS Masking Module Level 1:
  https://www.w3.org/TR/css-masking-1/
- WebKit transformed rounded clipping issue:
  https://bugs.webkit.org/show_bug.cgi?id=98538

## Unresolved questions

- None for the current Chrome/Safari demo target.
