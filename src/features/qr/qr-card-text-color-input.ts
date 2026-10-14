import { z } from "zod";

import { qrCardTextColorPattern } from "@/features/qr/qr-card-layout";

/** Màu chữ gửi lên server: "#RRGGBB" (không phân biệt hoa thường) hoặc null là tự động; bỏ trống là giữ nguyên. */
export const qrCardTextColorInput = z
  .string()
  .trim()
  .toLowerCase()
  .regex(qrCardTextColorPattern)
  .nullable()
  .optional();
