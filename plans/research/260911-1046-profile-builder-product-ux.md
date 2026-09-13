---
type: researcher
date: 2026-09-11
status: completed
---

# Research: Profile editor tiến tới page builder

## Summary

MHG Connect nên đi theo **structured profile composer**, không làm free-form page builder ngay. User chỉnh một hồ sơ có cấu trúc bằng canvas thật và inspector theo ngữ cảnh. Hệ thống kiểm soát loại block, dữ liệu, thứ tự, khả năng ẩn/hiện và theme; không cho kéo tự do, resize pixel hoặc nhập CSS.

Editor hiện tại đã có nền đúng: public profile và preview dùng chung renderer, QR tách khỏi profile, một profile dùng được cho nhiều QR. Phần cần đổi tiếp là nghiệp vụ draft/publish, cách nhóm form và hợp đồng block để tránh phải viết lại khi thêm page builder.

Khoảng trống nghiệp vụ lớn nhất hiện nay: nút `Lưu bản nháp` ghi `profiles.status = draft` ngay trên cùng row đang public. Route QR chỉ render profile có status `published`, nên lưu nháp trên hồ sơ đang hoạt động có thể làm toàn bộ QR liên kết chuyển sang `Hồ sơ chưa sẵn sàng`. Cần tách draft snapshot khỏi published snapshot trước khi thêm autosave.

## Research methodology

- Thời điểm: 2026-09-11.
- Nguồn: tài liệu chính thức Shopify, WordPress, Webflow, Linktree; nghiên cứu UX của Nielsen Norman Group; source và tài liệu MHG hiện tại.
- Tiêu chí: dễ dùng lần đầu, preview trung thực, không mất dữ liệu, mở rộng theo block, mobile-first, accessibility, giữ hệ UI dark/white/gold.
- Không nghiên cứu: trình thiết kế tự do kiểu Figma, custom CSS/HTML, cộng tác thời gian thực, marketplace plugin.

## Key findings

### 1. Pattern chung của editor trưởng thành

Shopify chia trang thành section và block có schema, chọn item trong sidebar để mở đúng settings trong preview, cho reorder nhưng từ chối vị trí/type không tương thích. Preview phải giống storefront thật và một số setting cập nhật live mà không reload toàn trang.

WordPress dùng ba vùng: toolbar, content canvas và settings sidebar. Settings thay đổi theo block đang chọn. List View chỉ xuất hiện để hiểu cấu trúc, chọn, reorder, duplicate, hide hoặc delete block; autosave là revision riêng và không ghi đè nội dung đang public.

Linktree giữ customization đơn giản: theme preset trước, custom controls sau. Desktop hiển thị live preview bên phải; mobile đặt preview phía trên editor. Các kiểu header như Classic, Hero hoặc Banner là layout variant, không phải các form dữ liệu khác nhau.

Webflow nhấn mạnh component có mục đích rõ, shared language và property/slot được định nghĩa trước. Đây là ranh giới quan trọng: content editor chỉ chỉnh những gì product cho phép, không biến thành designer tùy ý.

Nielsen Norman Group khuyến nghị progressive disclosure: hiển thị thao tác cốt lõi trước, đưa tùy chọn hiếm/khó vào khu vực thứ cấp. Form nên bắt đầu từ thông tin quen thuộc, quan trọng và đơn giản trước.

### 2. Kết luận cho MHG

MHG là công cụ tạo danh thiếp/hồ sơ số, không phải công cụ thiết kế website tổng quát. Giá trị chính là nhập thông tin nhanh, nhìn đúng kết quả, publish an toàn và cập nhật dễ sau khi QR đã phát hành.

Do đó:

- Canvas là nguồn định hướng chính; inspector chỉ chỉnh block đang chọn.
- Block catalogue nhỏ và có chủ đích.
- Theme kiểm soát bằng token/variant; không mở font, màu, spacing tự do ở giai đoạn đầu.
- Draft và published phải là hai trạng thái nội dung khác nhau.
- Mobile là bề mặt xuất bản chính; editor mobile là hai mode Preview/Edit, không ép canvas và inspector cạnh nhau.

### 3. Audit editor hiện tại

| Hiện trạng                                   | Đánh giá             | Hướng xử lý                                 |
| -------------------------------------------- | -------------------- | ------------------------------------------- |
| Public và preview dùng chung `PublicProfile` | Đúng, phải giữ       | Mọi block mới đi qua cùng registry/renderer |
| QR và profile tách entity                    | Đúng, phải giữ       | Publish cảnh báo số QR bị ảnh hưởng         |
| Bốn tab Content/Media/Visibility/Appearance  | Hơi phân mảnh        | Gộp còn Cơ bản/Liên hệ/Giao diện            |
| Visibility ở tab riêng                       | Tăng tải ghi nhớ     | Đặt cạnh field/block liên quan              |
| Hai nút Lưu nháp/Xuất bản cùng cấp           | Mental model chưa rõ | Autosave draft + một CTA Publish            |
| Một row vừa là draft vừa là public           | Rủi ro nghiệp vụ     | Tách draftVersion và publishedVersion       |
| `Bìa/Tối giản` gọi là template               | Dễ kỳ vọng sai       | Đổi thành layout/header variant             |
| Canvas chưa chọn trực tiếp block             | Chấp nhận cho demo   | Phase A thêm selection → inspector          |

## Recommended product workflow

### Tạo hồ sơ lần đầu

1. Chọn điểm bắt đầu: `Bìa` hoặc `Tối giản`.
2. Nhập tối thiểu: tên, vai trò/công ty, một kênh liên hệ.
3. Preview cập nhật ngay trên cùng renderer public.
4. Draft tự lưu; hệ thống hiển thị `Đang lưu` rồi `Đã lưu`.
5. User chọn `Xuất bản` để cập nhật bản công khai.
6. Nếu đi từ QR chưa có profile, publish xong liên kết QR và mở trang công khai.

Tên là lỗi bắt buộc. Thiếu kênh liên hệ chỉ nên cảnh báo, không chặn publish. Người dùng có thể cần hồ sơ chỉ để giới thiệu hoặc dẫn tới social.

### Cập nhật hồ sơ đã public

1. Mở editor từ Dashboard hoặc toolbar chủ sở hữu trên public profile.
2. Chỉnh sửa được autosave vào draft, public profile vẫn giữ published snapshot.
3. Toolbar hiển thị `Có thay đổi chưa xuất bản`.
4. `Xem bản đang public` mở đúng `/q/{token}`; `Xuất bản thay đổi` đẩy snapshot mới ra tất cả QR đang dùng profile.
5. Có thể bỏ draft hoặc khôi phục bản public gần nhất.

Điểm này quan trọng vì một profile có thể gắn nhiều QR. Một lần sửa sai không được tự động làm thay đổi mọi tem đang lưu hành.

### Liên kết QR

- Profile và QR tiếp tục là hai entity độc lập.
- Một profile có thể được nhiều QR cùng owner sử dụng.
- Editor cần luôn hiển thị `Đang dùng bởi N mã` và cảnh báo phạm vi ảnh hưởng trước publish.
- Per-QR content override chưa nên làm. Nếu cần nội dung khác, tạo profile khác để giữ mental model đơn giản.

## Recommended page structure

### Desktop

```text
┌──────────────────────────────────────────────────────────────────────┐
│ ← Hồ sơ       Đã lưu · Có thay đổi      Xem public      Xuất bản   │
├──────────────────────────────────────────┬───────────────────────────┤
│                                          │ Hồ sơ / block đang chọn   │
│                CANVAS                    │                           │
│     render đúng public profile thật      │ [Cơ bản]                  │
│                                          │ [Liên hệ]                 │
│     click section để chỉnh section đó    │ [Giao diện]               │
│                                          │                           │
│       Mobile · Desktop preview           │ field + visibility gần nhau│
└──────────────────────────────────────────┴───────────────────────────┘
```

- Canvas chiếm khoảng 60-65%; inspector 35-40%, rộng khoảng 360-420px.
- Toolbar duy nhất chứa navigation, save state, preview/public và primary publish action.
- Không có hai CTA ngang cấp `Lưu bản nháp` và `Xuất bản`; autosave xử lý draft, publish là CTA chính.
- Click block trên canvas: gold hairline/focus ring nhẹ, scroll inspector tới đúng nhóm.
- Hover chỉ lộ action của block đang tương tác; không rải icon/button thường trực.
- Device switch là `Mobile` và `Desktop`; mặc định Mobile vì khách chủ yếu mở từ QR trên điện thoại.

### Inspector đơn giản giai đoạn đầu

Thay bốn tab `Nội dung / Ảnh / Hiển thị / Giao diện` bằng ba nhóm:

1. **Cơ bản**: avatar, cover, tên, chức danh, công ty, địa điểm, giới thiệu.
2. **Liên hệ**: điện thoại, email, website, Zalo, LinkedIn, Telegram.
3. **Giao diện**: kiểu đầu trang, theme và các lựa chọn token đã cho phép.

Visibility nằm cạnh field/block liên quan, không tách thành danh sách thứ hai. Việc tách `Hiển thị` khiến người dùng phải nhớ tên field và chuyển tab để thao tác cùng một đối tượng.

`Bìa / Tối giản` nên đổi tên nghiệp vụ thành **Kiểu đầu trang** hoặc **Bố cục hồ sơ**. Hai lựa chọn này hiện là layout variant, không phải hai template nội dung độc lập.

### Mobile

- Top bar: Back, trạng thái save, Publish.
- Segmented control: `Xem trước / Chỉnh sửa`.
- Preview là full-width và mở đầu trang.
- Edit dùng accordion Cơ bản/Liên hệ/Giao diện hoặc một màn riêng; không dùng sidebar thu nhỏ.
- Khi có reorder, dùng danh sách block với handle và nút Lên/Xuống; không bắt kéo trực tiếp trên canvas.

## Initial block catalogue

| Block           | Số lượng | Bắt buộc | Dữ liệu chính                                 | Phase |
| --------------- | -------: | -------- | --------------------------------------------- | ----- |
| Identity/Header |        1 | Có       | avatar, cover, name, title, company, location | Ngay  |
| Bio             |     0..1 | Không    | rich text giới hạn, không HTML tùy ý          | Ngay  |
| Contact list    |     0..1 | Không    | phone, email, website                         | Ngay  |
| Social links    |     0..1 | Không    | Zalo, LinkedIn, Telegram                      | Ngay  |
| CTA link        |     0..3 | Không    | label, URL, icon từ catalogue                 | Sau   |
| Gallery         |     0..1 | Không    | ảnh, caption, order                           | Sau   |
| Custom text     |     0..3 | Không    | heading, body                                 | Sau   |

Giai đoạn đầu giữ bốn block cố định, chỉ cho ẩn/hiện. Khi nghiệp vụ ổn định mới bật Add, reorder và duplicate cho block phù hợp.

## Data contract and architecture seam

Không cần migrate toàn bộ schema ngay. Tạo một `ProfileDocument` trung gian để UI và renderer không tiếp tục phụ thuộc vào danh sách cột phẳng:

```text
ProfileDocument
├── schemaVersion
├── theme
│   ├── headerLayout
│   └── themeId
└── blocks[]
    ├── id
    ├── type
    ├── visible
    ├── order
    └── data
```

Trong phase đầu, adapter map schema phẳng hiện tại sang bốn block. Khi cần add/reorder block thật, chuyển content sang `profile_versions.document jsonb` hoặc bảng `profile_blocks` mà không đổi renderer/editor contract.

Nên bổ sung theo thứ tự:

1. `profile_versions`: document, schemaVersion, createdAt, createdBy.
2. `profiles.publishedVersionId` và `profiles.draftVersionId`.
3. `media_assets`: owner, URL, MIME, size, crop/focal point, reference count/status.
4. Revision/history sau khi autosave và publish ổn định.

Ưu tiên snapshot JSONB có version cho giai đoạn builder đầu. Tách từng block thành row chỉ khi cần query/permission/collaboration theo block; làm sớm sẽ tăng transaction và migration complexity không cần thiết.

## State model

```text
new → draft → published
              │
              ├─ edit → published_with_changes → publish → published
              └─ edit → published_with_changes → discard → published
```

UI labels:

- `Đang lưu...`
- `Đã lưu lúc 10:42`
- `Có thay đổi chưa xuất bản`
- `Đang công khai`
- `Lỗi lưu. Thử lại`

Save state phải là text + icon, không dựa vào màu. Khi lỗi autosave, giữ local draft và cho retry; không được để user nghĩ thay đổi đã lưu.

## Validation and safety

- Validate theo block; lỗi xuất hiện ngay dưới field và focus block đầu tiên lỗi khi publish.
- URL/phone/social được normalize server-side nhưng không sửa im lặng thành destination khác.
- Mọi media có owner; chỉ xóa blob khi không còn revision/profile tham chiếu.
- Sanitize rich text bằng allowlist; MVP chỉ cần plain text + xuống dòng.
- Reorder hỗ trợ keyboard/nút Lên-Xuống, không chỉ drag-and-drop.
- Publish dùng optimistic concurrency/version để không ghi đè tab editor cũ.
- Public renderer không render component/editor controls từ document tùy ý; block type map qua registry allowlist.

## Phased recommendation

### Phase A: Simple composer

- Giữ bốn block cố định.
- Canvas click chọn nhóm inspector.
- Gộp Media vào Cơ bản; visibility đặt cạnh field/block.
- Đổi template thành `Bố cục hồ sơ`.
- Autosave draft, publish snapshot riêng, save-state rõ.
- Mobile/desktop preview switch.

Không có add block, reorder, duplicate, undo history hoặc rich text.

### Phase B: Structured builder

- Add block từ catalogue nhỏ.
- Outline mở theo nhu cầu, không giữ cột thứ ba thường trực.
- Reorder, hide, duplicate, delete có undo.
- Block settings theo selection.
- CTA link, custom text và gallery.

Không nesting tự do; Identity luôn khóa ở đầu.

### Phase C: Product-grade builder

- Revision history và restore.
- Template/pattern dùng lại được.
- Schema migration/versioning.
- Crop/focal point cho media.
- Theme token có giới hạn, accessibility validation.
- Preview theo device và warning phạm vi QR bị ảnh hưởng.

### Phase D: Chỉ khi có nhu cầu thật

- Multi-language.
- Scheduled publishing.
- Approval workflow/team roles.
- Per-QR campaign variant.
- Synced block giữa nhiều profile.

## What not to build now

- Canvas kéo thả theo tọa độ hoặc resize pixel.
- `contentEditable` cho toàn trang.
- CSS/HTML tùy ý.
- Nested block nhiều cấp.
- Ba cột cố định trên desktop ngay từ MVP.
- Theme store hàng chục mẫu trước khi có dữ liệu sử dụng.
- Autosave trực tiếp vào bản public.
- Per-QR override khi profile dùng chung đã giải quyết được phần lớn nhu cầu.

## Acceptance criteria for Phase A

- User mới tạo và publish hồ sơ cơ bản trong dưới 3 phút.
- Mọi thay đổi preview bằng đúng public renderer.
- Draft không làm thay đổi public profile trước khi publish.
- Đóng tab hoặc mất mạng ngắn không làm mất phần đã autosave.
- Publish cho biết bao nhiêu QR bị ảnh hưởng.
- Một field chỉ có một nơi chỉnh content và visibility.
- Desktop không quá hai cột; mobile không có horizontal scroll.
- Keyboard truy cập được mọi field, block và publish action.
- Không có control nhỏ hơn 44px ở mobile.

## Recommendations

1. Chốt Phase A làm iteration tiếp theo; chưa triển khai block persistence ngay.
2. Thiết kế `ProfileDocument` + adapter trước khi đổi editor UI.
3. Tách draft/published snapshot trước khi bật autosave.
4. Sau đó đổi inspector và thêm canvas selection.
5. Chỉ mở Phase B khi có nhu cầu thêm/reorder block từ người dùng hoặc khách hàng thật.

## References

- [Shopify: Sections and blocks](https://help.shopify.com/en/manual/online-store/themes/theme-structure/sections-and-blocks)
- [Shopify: Theme editor and live preview](https://shopify.dev/docs/storefronts/themes/tools/online-editor)
- [WordPress: Block editor workspace](https://wordpress.org/documentation/article/wordpress-block-editor/)
- [WordPress: List View](https://wordpress.org/documentation/article/list-view/)
- [WordPress: Revisions and autosaves](https://wordpress.org/documentation/article/revisions/)
- [Webflow: Component design-system guidance](https://webflow.com/webflow-way/design-systems/components)
- [Linktree: Themes and live preview](https://linktr.ee/help/en/articles/5434137-choose-a-theme-for-your-linktree)
- [Linktree: Profile image and header layouts](https://linktr.ee/help/en/articles/9036585-add-or-change-your-linktree-profile-image)
- [NN/G: Progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/)
- [NN/G: Reducing cognitive load in forms](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/)

## Unresolved questions

- Khi một profile gắn nhiều QR, publish có luôn áp dụng toàn bộ hay cần tạo bản sao nhanh?
- MHG có cần người duyệt nội dung trước publish khi chuyển sang khách hàng doanh nghiệp?
- Người dùng có thực sự cần nhiều template hay chỉ cần 2-3 layout variant + theme token?
- Có cần lưu lịch sử đầy đủ ngay Phase A, hay chỉ giữ published snapshot và một autosave draft?
