import { afterEach, describe, expect, it, vi } from "vitest";
import { qrOnlyPng } from "./qr-only-export";

afterEach(() => vi.unstubAllGlobals());

describe("QR-only export", () => {
  function setup(fail = false, contextMissing = false) {
    const context = {
      fillStyle: "",
      imageSmoothingEnabled: true,
      fillRect: vi.fn(),
      drawImage: vi.fn(),
    };
    const canvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => (contextMissing ? null : context)),
      toDataURL: vi.fn(() => "data:image/png;base64,qr"),
    };
    let input: Blob | undefined;
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", {
      createObjectURL: (blob: Blob) => {
        input = blob;
        return "blob:qr";
      },
      revokeObjectURL,
    });
    vi.stubGlobal("document", { createElement: vi.fn(() => canvas) });
    vi.stubGlobal(
      "Image",
      class {
        onload?: () => void;
        onerror?: () => void;
        set src(_value: string) {
          queueMicrotask(() => (fail ? this.onerror?.() : this.onload?.()));
        }
      },
    );
    return { context, canvas, revokeObjectURL, input: () => input };
  }
  it("rasterizes the exact QR SVG on an opaque white square without card content", async () => {
    const mocks = setup();
    const svg = '<svg viewBox="0 0 41 41"><path d="M4 4h7v7H4z"/></svg>';
    expect(await qrOnlyPng(svg)).toBe("data:image/png;base64,qr");
    expect(await mocks.input()?.text()).toBe(svg);
    expect(mocks.input()?.type).toBe("image/svg+xml;charset=utf-8");
    expect(mocks.canvas.width).toBe(2048);
    expect(mocks.canvas.height).toBe(2048);
    expect(mocks.context.fillStyle).toBe("#ffffff");
    expect(mocks.context.fillRect).toHaveBeenCalledWith(0, 0, 2048, 2048);
    expect(mocks.context.drawImage).toHaveBeenCalledOnce();
    expect(mocks.revokeObjectURL).toHaveBeenCalledWith("blob:qr");
  });
  it("releases the SVG and reports a conversion error instead of downloading blank QR", async () => {
    const mocks = setup(true);
    await expect(qrOnlyPng("invalid")).rejects.toThrow();
    expect(mocks.canvas.toDataURL).not.toHaveBeenCalled();
    expect(mocks.revokeObjectURL).toHaveBeenCalledWith("blob:qr");
  });
  it("handles unavailable canvas without leaking an image URL", async () => {
    const mocks = setup(false, true);
    await expect(qrOnlyPng("<svg/>")).rejects.toThrow();
    expect(mocks.revokeObjectURL).toHaveBeenCalledWith("blob:qr");
  });
});
