# Boilerplate UI Port

## Source Manifest

- Source: `/Users/lethai/Desktop/projects/startup/boiler-plate`
- Target: `/Users/lethai/Desktop/projects/startup/mhg`
- Source framework: React 19, Vite, TypeScript, Tailwind CSS v4.
- Target framework: Next.js App Router, React, TypeScript, Tailwind CSS v4.
- Source Git ref: unavailable; source directory is not a Git repository.
- Reviewed surface: `package.json`, `components.json`, global CSS/tokens, 62 UI modules, design-system catalogue, profile demo, quotation demo, public assets and `AGENTS.md`.

## Source Anatomy

| Layer          | Source                                         | Target                                                     |
| -------------- | ---------------------------------------------- | ---------------------------------------------------------- |
| Tokens/fonts   | `src/index.css`                                | `src/app/globals.css`                                      |
| UI components  | `src/components/ui/*`                          | Same alias and path                                        |
| Catalogue      | `src/pages/design-system/*`                    | `src/features/dev/design-system/*` + App Router page       |
| Profile demo   | `src/pages/demo-profile/*`                     | `src/features/dev/demo-profile/*` + App Router page        |
| Quotation demo | `src/pages/outsource-quotation/*`              | `src/features/dev/outsource-quotation/*` + App Router page |
| Assets         | `public/images`, `public/files`, icons/favicon | Same public paths                                          |
| Routing        | React Router in `src/App.tsx`                  | Next file-system routes                                    |
| UI rules       | Source `AGENTS.md`                             | Merged into target `AGENTS.md`                             |

## Dependency Matrix

| Concern         | Source                                       | Target choice                          | Status  |
| --------------- | -------------------------------------------- | -------------------------------------- | ------- |
| React           | React 19                                     | Current stable React supported by Next | Adapt   |
| Router          | `react-router-dom`                           | `next/navigation` + route files        | Replace |
| CSS pipeline    | `@tailwindcss/vite`                          | `@tailwindcss/postcss`                 | Replace |
| UI primitives   | Radix, Base UI, shadcn, Vaul                 | Preserve                               | Copy    |
| Icons/motion    | Lucide, Motion, Lottie                       | Preserve                               | Copy    |
| Fonts           | Fontsource Be Vietnam Pro + Playfair Display | Preserve                               | Copy    |
| Toasts          | Sonner                                       | Preserve; provider in root layout      | Adapt   |
| Client behavior | Implicit Vite client runtime                 | Explicit Next client boundaries        | Adapt   |

## Challenge Decisions

| #   | Question                        | Source answer                            | Local answer                    | Risk if wrong                  | Decision                              |
| --- | ------------------------------- | ---------------------------------------- | ------------------------------- | ------------------------------ | ------------------------------------- |
| 1   | Có cần đủ component?            | Catalogue phụ thuộc toàn bộ bộ UI        | Target chưa có UI               | Catalogue thiếu hoặc import vỡ | Mang toàn bộ                          |
| 2   | Cài shadcn mới có đơn giản hơn? | Source đã custom variant/token           | Cài mới mất quyết định đã duyệt | Visual regression lớn          | Copy source                           |
| 3   | Có mang Vite/router cũ?         | Vite dùng SPA router                     | Sản phẩm cần Next               | Hai routing model xung đột     | Không mang                            |
| 4   | Ai sở hữu code sau port?        | Boilerplate là nguồn ban đầu             | MHG repo phát triển độc lập     | Drift giữa hai repo            | Target sở hữu bản copy                |
| 5   | Có mang mọi `_dev` page?        | Ba page là catalogue, profile, quotation | User yêu cầu demo đã đóng gói   | Thiếu acceptance reference     | Mang cả ba                            |
| 6   | Có đưa `_dev` vào product nav?  | Chỉ route nội bộ                         | Không phải customer flow        | Lộ UI thử nghiệm               | Giữ route, không đưa vào nav sản phẩm |
| 7   | Có đổi visual khi port?         | Dark/white/gold đã được duyệt            | Chưa có yêu cầu redesign        | Mất baseline                   | Giữ nguyên trước, polish sau          |

## Risk Score

Low. Không có code target để xung đột. Rủi ro chính là Next client boundary, router API và CSS import order; tất cả kiểm tra được bằng typecheck, production compile và browser QA.

## Implementation Result

- Next.js `16.3.4`, React `19.3.0`, TypeScript và Tailwind CSS v4 chạy trực tiếp tại root.
- Đã port 62 UI module, sau adapter có 25 file feature demo và 5 public asset được tham chiếu trực tiếp.
- App Router dùng thư mục filesystem `%5Fdev` để giữ URL công khai `/_dev/*`; underscore thô là private folder trong Next.
- Đã thay React Router search params bằng `next/navigation`, thêm Suspense boundary và metadata route.
- Root providers quản lý Tooltip và Sonner; `<html class="dark">` giữ fixed dark theme ngay từ first paint.
- `useIsMobile` khởi tạo ổn định cho hydration; sidebar skeleton dùng width cố định thay cho random render.
- CSS fixture được import qua global bundle để tương thích App Router escape route; selector profile/quotation được prefix và print rule dùng named page `quotation`, nên không đổi behavior của page khác.
- Presentational primitives giữ server-compatible; client boundary tập trung ở interactive UI và cụm action share của profile.
- Nội dung quotation được giữ nguyên như artifact hình ảnh nội bộ. Nó không phải product authority và không thay đổi phạm vi MVP trong plan.

## Verification

- `npm run typecheck`: pass.
- `npm run build`: pass; static routes gồm `/`, `/_dev/design-system`, `/_dev/demo-profile`, `/_dev/demo-outsource-quotation`.
- `npm run lint`: 0 error; còn cảnh báo `<img>` có chủ đích trong fixture/catalogue và một warning ở artifact `bao-gia-phase-1` ngoài scope.
- Browser desktop: profile và quotation render đúng asset/font/layout; quotation không overflow ngang ở 1280px.
- Browser mobile 375px: profile, quotation và catalogue không overflow ngang.
- Catalogue hiển thị đủ `62 mục`; search `dialog` cập nhật URL và lọc còn 3 mục; dialog mở/đóng đúng.
- Hai legacy URL trả redirect 308 tới route canonical.
- Ba page, hai redirect và năm public asset đều trả response thành công; browser console không có error/warning.

## Production Boundary

Các route `_dev` và PDF hiện cố ý sẵn sàng cho local/demo URL. `robots: noindex` không phải access control. Trước production deploy, Phase 5 phải xác nhận có public chúng cho khách hay gate bằng environment/auth; homepage sản phẩm không liên kết tới các artifact nội bộ này.

## Acceptance

- `/_dev/design-system` render catalogue và interaction states.
- `/_dev/demo-profile` giữ bố cục, share, vCard và assets.
- `/_dev/demo-outsource-quotation` giữ layout và print stylesheet.
- Alias `@/*`, tokens, fonts và control scale hoạt động trong Next.
- Không còn dependency/runtime Vite hoặc React Router.
- `AGENTS.md` giữ nguyên authority tài liệu MHG và bổ sung đầy đủ UI rules.
