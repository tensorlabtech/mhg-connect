import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadCardPng, rasterizeCardSvg } from "./qr-card-download";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("card PNG downloads", () => {
  it("rasterizes an embedded card without waiting for an animation frame in a background tab", async () => {
    const context = { drawImage: vi.fn() };
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => context,
      toDataURL: vi.fn(() => "data:image/png;base64,card"),
    };
    vi.stubGlobal("document", { createElement: () => canvas });
    vi.stubGlobal("requestAnimationFrame", () => {
      throw new Error("Background frame suspended");
    });
    vi.stubGlobal(
      "Image",
      class {
        onload?: () => void;
        set src(_value: string) {
          queueMicrotask(() => this.onload?.());
        }
      },
    );
    expect(await rasterizeCardSvg("data:image/svg+xml,test", 2016, 1272)).toBe(
      "data:image/png;base64,card",
    );
    expect(canvas.width).toBe(2016);
    expect(canvas.height).toBe(1272);
    expect(context.drawImage).toHaveBeenCalledOnce();
  });
  it("rejects invalid raster dimensions", async () => {
    for (const size of [0, -1, Number.NaN, 10000])
      await expect(rasterizeCardSvg("svg", size, 100)).rejects.toThrow();
  });
  it("times out a stalled image load and releases its timer", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("Image", class {});
    const checked = expect(
      rasterizeCardSvg("data:image/svg+xml,stalled", 300, 200),
    ).rejects.toThrow("Xuất ảnh quá lâu");
    await vi.advanceTimersByTimeAsync(15_000);
    await checked;
    expect(vi.getTimerCount()).toBe(0);
  });
  it("uses a short blob URL, then releases it after the browser can save", async () => {
    vi.useFakeTimers();
    const blob = new Blob(["png"], { type: "image/png" });
    const fetchMock = vi.fn().mockResolvedValue({ blob: async () => blob });
    const createObjectURL = vi.fn().mockReturnValue("blob:local-card");
    const revokeObjectURL = vi.fn();
    const link = { href: "", download: "", click: vi.fn(), remove: vi.fn() };
    const append = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
    vi.stubGlobal("document", { createElement: () => link, body: { append } });

    await downloadCardPng("data:image/png;base64,cG5n", "card.png");

    expect(fetchMock).toHaveBeenCalledWith("data:image/png;base64,cG5n");
    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(link.href).toBe("blob:local-card");
    expect(link.download).toBe("card.png");
    expect(append).toHaveBeenCalledWith(link);
    expect(link.click).toHaveBeenCalledOnce();
    expect(link.remove).toHaveBeenCalledOnce();
    expect(revokeObjectURL).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:local-card");
  });

  it("does not start a download if PNG conversion fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Invalid PNG")));
    await expect(downloadCardPng("broken", "card.png")).rejects.toThrow(
      "Invalid PNG",
    );
  });
});
