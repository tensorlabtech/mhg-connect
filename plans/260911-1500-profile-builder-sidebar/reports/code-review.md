# Profile Builder Sidebar - Code Review

## Verdict

**PASS.** Không có finding P0/P1 trong scope. Implementation đáp ứng acceptance, giữ nguyên draft/publish/autosave/QR contracts và không làm thay đổi public `/q/[token]` khi caller không opt in vào selection mode.

## Acceptance review

| Acceptance | Result | Evidence |
|---|---|---|
| Một sidebar trái desktop, không có right inspector | PASS | `src/features/profile/profile-builder.tsx:265-330` dùng grid `22rem + canvas`; chỉ branch desktop mount một `<aside>` trái. Không còn right inspector/toolbar tree. |
| Mobile dùng cùng editing surface | PASS | `profile-builder.tsx:72-76`, `267-288` dùng `useSyncExternalStore` tại breakpoint 1024px và mount Sheet/aside loại trừ nhau; cùng một `sidebar` composition tại dòng 234-263. Browser QA 375px trong `reports/test-report.md` xác nhận Sheet và không overflow. |
| Sidebar có Back, list/detail, reorder, fields, save/history/publish | PASS | Header/body/footer composition tại `src/features/profile/profile-builder-sidebar.tsx:83-205`; Outline tại 119-125; Inspector tại 128-153; Undo/Redo/public/Publish tại 157-204. |
| Canvas chỉ chọn block, không có field/link riêng tư | PASS | Builder truyền `selection` và `showActions={false}` tại `profile-builder.tsx:314-325`. `PublicProfile` chỉ bật selection qua prop additive tại `src/features/profile/public-profile.tsx:42-63`; directory rows chuyển sang inert `<div>` qua `preview` tại 93-109, 635-649. Tests kiểm tra không input/textarea/mailto/tel tại `src/features/profile/profile-builder-view.test.tsx:30-54` và không anchor/empty tab stop tại `src/features/profile/public-profile.test.tsx:69-90`. |
| Hidden/empty blocks không tạo tab stop, vẫn sửa qua Outline | PASS | `public-profile.tsx:93-109`, `473-479` bỏ selection wrapper khi block không có public-visible content. Outline vẫn liệt kê mọi optional block tại `src/features/profile/profile-builder-outline.tsx:68-70`, `132-149`. |
| Tất cả content fields nằm trong sidebar | PASS | Identity/Bio fields và placeholders tại `src/features/profile/profile-builder-inspector-fields.tsx:102-248`; Contact/Social fields tại `src/features/profile/profile-builder-inspector.tsx:78-207`. Focused renderer tests tại `profile-builder-inspector.test.tsx:43-59`. |
| Stable history/autosave semantics | PASS | Content updates giữ coalesce keys cho Identity, Bio, Contact và Social (`profile-builder-inspector-fields.tsx:147-180`, `217-231`; `profile-builder-inspector.tsx:107-203`). Visibility/layout/reorder là discrete updates. Builder tiếp tục dùng cùng history/autosave hooks và flush/version/publish flow tại `profile-builder.tsx:91-105`, `117-215`. |
| Publish khóa mutations | PASS | `changeDocument` và pending media có guard tại `profile-builder.tsx:117-131`; Sidebar fieldset/footer controls nhận `publishing` tại `profile-builder-sidebar.tsx:119-152`, `157-204`; Outline truyền disabled vào sensors và mọi control, đồng thời guard `handleDragEnd` tại `profile-builder-outline.tsx:48-85`, `137-149`, `207-295`. |
| Publish validation mở đúng detail/mobile Sheet và focus field | PASS | Name/contact email map sang selection, detail mode và mobile Sheet rồi double-RAF focus visible input tại `profile-builder.tsx:173-197`. Inspector render đúng labeled input và `aria-invalid` tại `profile-builder-inspector-fields.tsx:147-154` và `profile-builder-inspector.tsx:107-123`, `301-320`. Server chỉ trả lỗi email khi field public-visible, nên target luôn sửa được. |
| DnD và keyboard reorder còn hoạt động | PASS | Pointer/Keyboard sensors, `sortableKeyboardCoordinates`, screen-reader instructions và explicit up/down controls còn nguyên tại `profile-builder-outline.tsx:61-67`, `103-151`, `239-280`. |
| Public `/q/[token]` không đổi | PASS | Selection là prop optional; không có interaction prop thì `BlockFrame` trả content gốc tại `public-profile.tsx:126-161`. `showActions` mặc định `true` tại 48-63, public caller không override, và regression test yêu cầu actions/default public markup tại `public-profile.test.tsx:27-35`. Real public links/actions desktop và 375px được xác nhận trong `reports/test-report.md`. |
| API/blast radius | PASS | `PublicProfile.selection` và Inspector `invalidField` đều additive/optional; existing editor/public call sites vẫn type-safe. Không có schema, migration, auth, DB, QR hoặc storage change trong scope. |

## Responsive and accessibility review

- Desktop/mobile Sidebar trees mount mutually exclusively after hydration; không còn duplicate form, DnD sensors hoặc focus target.
- Empty selection wrappers bị loại; visible wrapper hỗ trợ Enter/Space và accessible label tại `public-profile.tsx:139-159`.
- Icon-only actions dùng shared `IconButton` + tooltip; reorder controls và mobile Sheet actions dùng target phù hợp. Reduced-motion spinner được giữ tại `profile-builder-sidebar.tsx:197-203`.
- Real-route QA đã kiểm tra desktop và exact 375px, Sheet mở, selection, public links/actions và horizontal overflow theo `reports/test-report.md`.

## Documentation review

- `README.md` mô tả đúng Sidebar Builder đang active, Canvas selection-only, autosaved draft tách public snapshot, và route new/edit hiện tại.
- `plans/260911-1438-profile-view-reset/plan.md` được đánh dấu superseded bởi Sidebar plan; historical outcome không bị viết lại.
- `reports/debug-report.md` và `reports/test-report.md` khớp source hiện tại; SHA-1 source snapshot trong test report đã được đối chiếu.

## Fresh verification

- `npm run typecheck` — PASS, exit 0.
- `npm test` — PASS, 7 files / 19 tests.
- `npm run lint` — PASS, 0 errors; 3 warnings hiện hữu ngoài scope (một file báo giá, hai dev-only previews).

## Findings

Không có.

## Unresolved questions

Không có.

Status: DONE
Summary: Sidebar Builder đáp ứng toàn bộ acceptance; responsive mount boundary, autosave/publish lock, selection-only Canvas và public contract đều an toàn; typecheck/tests/lint pass.
Concerns/Blockers: Không có trong scope review.
