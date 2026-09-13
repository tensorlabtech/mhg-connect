# Code review: Profile Builder minimalism

## Verdict

**PASS.** Không còn P0/P1 trong ba finding được yêu cầu re-review.

## Verified fixes

- **Publish recovery:** `src/features/profile/profile-builder.tsx:135-185` bao toàn bộ autosave flush và publish action trong `try/catch/finally`; action rejection hiển thị lỗi và `publishing` luôn được trả về `false`.
- **Field validation focus and ARIA:** `src/features/profile/profile-builder.tsx:151-166`, `273-300` định tuyến lỗi name/contact email tới đúng block và input. `src/features/profile/public-profile.tsx:172-192`, `531-584` áp dụng `aria-invalid` và `aria-describedby` tới alert.
- **Hidden email contract:** `src/features/profile/profile-builder-server-validation.ts:38-45` chỉ validate email khi cả Contact block và Email field được công khai. Vì vậy field ẩn không chặn publish và mọi lỗi `contactEmail` còn lại đều có input được render để focus. Regression test tại `src/features/profile/profile-builder-server-validation.test.ts:53-70` xác nhận email công khai bị reject và cùng dữ liệu được chấp nhận sau khi ẩn field.
- **44px mobile targets:** Outline switch có wrapper `size-11` (`src/features/profile/profile-builder-outline.tsx:268-282`); mobile menu items có `min-h-11` (`src/features/profile/profile-builder-toolbar.tsx:158-190`); Sheet close dùng `icon-lg` (`src/components/ui/sheet.tsx:76-87`).

## Validation

- `npm test -- --run src/features/profile/profile-builder-server-validation.test.ts` — 1 file, 3 tests passed.
- Lượt re-review trước đã xác nhận `npm run typecheck` và toàn bộ 13 tests pass sau hai fix còn lại.

## Findings

Không có.

## Unresolved questions

Không có.

Status: DONE
Summary: Cả ba P1 trước đó đã được đóng bằng source evidence; hidden-email regression có test focused và verdict hiện là PASS.
Concerns/Blockers: Không có trong phạm vi re-review.
