# MHG Connect Project Instructions

## Thư mục original-docs

### Thư mục này để làm gì

Đây là thư mục chứa các tài liệu, cuộc trao đổi nguyên mẫu với khách hàng, chưa qua chỉnh sửa. Khi có những thứ gì bạn nghĩ ngờ, cần hard confirm hãy đối chiếu trong thư mục này.

### Bối cảnh dự án

Công ty HMG có công nghệ Sticker kháng khuẩn Nano Airpurity và giờ họ đang muốn khai thác công nghệ này. Trong đó Quang Minh (kém tuổi tôi) là cầu nối trung gian để tôi làm việc cùng. Những tài liệu trong này đến từ Quang Minh và những cái chat up to date cũng vậy.

### Quy tắc chung

Trừ file chat-up-to-date.md ra, Mọi file để được đánh tiền tố theo thời gian: YYYYMMDDHHmmss vì vậy khi có những thay đổi, bạn cần kiểm tra thời gian để biết file nào là mới nhất, khi có những xung đột hãy ưu tiên tài liệu mới hơn

- chat-up-to-date.md - File chat giữa khách hàng (Quang Minh) và Tôi (Lê Huy Thái) có các mốc thời gian và người gửi YYYYMMDDHHmmss - {Người gửi}
- 20260807140700-mhg-connect-v12-tech-spec.md - Đây là file Proposal mà Quang Minh brainstorm thử cho tôi, để tôi có thể làm một cái Proposal chi tiết, chất lượng hơn cho bên MHG. Lưu ý: Đây không phải là yêu cẩu của bên MHG, việc của tôi và Quang Minh là tạo ra một Proposal gửi họ và nếu họ duyệt chúng tôi có thể dành được dự án này
- 20260808161500-meeting.md - Tóm tắt meeting ngày 8-8 để nói về ý tưởng, proposal, nhưng có vẻ chưa có gì là chốt hẳn, Minh cũng nói về tầm nhìn, quan điểm (có vẻ từng bàn với bên MHG rồi)

## UI/UX và design system

### Nguồn chuẩn trong dự án

- Catalogue component: `/_dev/design-system`.
- Demo hồ sơ cá nhân: `/_dev/demo-profile`.
- Demo đề xuất và báo giá: `/_dev/demo-outsource-quotation`.
- UI component dùng chung nằm tại `src/components/ui`; token toàn cục nằm tại `src/app/globals.css`.
- Các file đã mang vào MHG là bản do dự án này sở hữu. Không tự động đồng bộ lại từ repository `boiler-plate`; khi cần cập nhật phải so sánh và port có chủ đích.

### Nguyên tắc triển khai

- Khi người dùng nói “bàn luận”, “tư vấn”, “chưa code” hoặc tương đương: chỉ phân tích và đưa phương án, không sửa code.
- Trước khi tạo component mới, kiểm tra `src/components/ui` và catalogue hiện có.
- Token, màu, font, radius, control height và interaction state trong code là nguồn sự thật; không hard-code lại các giá trị này ở page.
- Nếu một thay đổi có ý nghĩa dùng chung, cập nhật component hoặc token sở hữu hành vi; chỉ custom tại page khi yêu cầu thật sự chỉ thuộc page đó.
- Tôn trọng variant, kích thước control và pattern đã có. Chỉ mở rộng khi yêu cầu thật sự không được hệ thống hiện tại bao phủ.
- Thay đổi phạm vi nội dung không đồng nghĩa với được phép thiết kế lại toàn bộ giao diện.
- Nếu một visual pass bị từ chối, khôi phục hướng đã được chấp nhận trước khi thử phương án khác.
- Không tự thêm header, footer, sidebar hoặc application chrome vào public page, profile, tài liệu hay demo độc lập nếu ngữ cảnh không cần điều hướng đó.
- Nếu một quyết định có thể đổi đáng kể hướng thiết kế mà yêu cầu chưa rõ, trao đổi trước khi triển khai.
- Với Next.js App Router, ưu tiên Server Component; chỉ dùng Client Component cho phần thực sự có state, effect hoặc tương tác trình duyệt.
- Không copy router, bootstrap hoặc cấu hình Vite cũ vào ứng dụng Next.js.

### Định hướng hình ảnh

- Bảng màu cố định: nền tối gần đen `#0a0a0a`, neutral/white và gold `#e5c16b`.
- Phong cách tối giản, phẳng, nhiều whitespace, ít border, không dùng shadow mặc định.
- Whitespace và typography là công cụ phân nhóm chính; không bọc mọi thứ trong card.
- Card chỉ dùng khi có containment thực sự: nhóm dữ liệu, trạng thái hoặc hành động cùng một đơn vị.
- Nếu bỏ card mà nội dung vẫn rõ quan hệ thì ưu tiên bỏ card.
- Các card cùng cấp phải tách bằng khoảng cách rõ; không ghép thành segmented block nếu không phải một control group/cấu trúc liên tục.
- Tránh card lồng card và nhiều lớp surface. Surface mặc định trung tính, không phủ gold nhẹ chỉ để tạo điểm nhấn.

### Border, gold và typography

- Border phải có lý do: phân tách control, trạng thái hoặc ranh giới nội dung quan trọng. Tránh border lồng nhiều lớp.
- Không dùng đồng thời outer border, divider và ring nếu một tín hiệu đã đủ; không để `overflow: hidden` cắt focus ring, menu, popover hay active indicator.
- Gold là accent có kiểm soát cho CTA, trạng thái nổi bật hoặc điểm nhấn; không rải gold trang trí khắp màn hình.
- Gold không thay cho success, warning, error hoặc information; CTA chính vẫn dùng variant đã định nghĩa thay vì mặc định đổi sang gold.
- Dùng Be Vietnam Pro cho UI/body và Playfair Display cho display/serif theo token hiện có.
- Font editorial chỉ dùng cho page heading, section heading hoặc điểm nhấn; không dùng cho control, label hoặc vùng dữ liệu dày.
- Không phóng metric, phần trăm hoặc giá tiền chỉ để lấp khoảng trống; kiểm soát line length và tránh ngắt dòng làm sai nghĩa.
- Giữ control scale thống nhất: `xs` 32px, `sm` 36px, mặc định 40px, `lg` 44px.
- Mật độ, padding, chiều cao phải đồng bộ giữa button, input, select, menu, modal và các bề mặt xuất hiện khi tương tác.

### Layout, danh sách và responsive

- Các item lặp lại phải đồng nhất về spacing, alignment, trạng thái và vùng click.
- Các list tương đương dùng cùng grid/cột; item `label`–`value` giữ cùng cấu trúc. Icon chỉ hỗ trợ nhận diện và không lấn át dữ liệu.
- Timeline/quy trình phải chịu được số bước thay đổi; trên màn hình hẹp ưu tiên cấu trúc dọc.
- Ưu tiên layout đọc được bằng hierarchy và khoảng trắng trước khi thêm đường kẻ hoặc container.
- Khoảng cách trong một nhóm phải nhỏ hơn khoảng cách giữa các nhóm. Không tạo fixed card height chỉ để các card bằng nhau.
- Thiết kế với dữ liệu thật dài/ngắn, trạng thái rỗng, lỗi, loading và disabled; không chỉ tối ưu cho happy path.
- Kiểm tra desktop và mobile. Không chấp nhận overflow ngang, control quá nhỏ hoặc hành động bị che.

### Interaction và accessibility

- Mọi action phải có trạng thái hover, focus-visible, disabled và loading phù hợp.
- Hạn chế floating/sticky action cluster; icon-only action phải có accessible label và tooltip đã đóng gói.
- Trang mới bắt đầu ở đầu trang trừ khi URL có anchor hoặc hành vi phục hồi scroll được yêu cầu rõ.
- Dùng semantic HTML, label rõ ràng, keyboard navigation và vùng bấm đủ lớn.
- Menu, tooltip, dialog, popover và toast phải được kiểm tra ở trạng thái mở, không chỉ nhìn trigger.
- Animation phải phục vụ phản hồi/hierarchy, tôn trọng reduced motion và không che nội dung.

### Visualization

- Chỉ dùng visualization khi nó giúp hiểu quan hệ, tiến độ, phân bổ hoặc trình tự nhanh hơn prose; không thêm chart chỉ để lấp khoảng trống.
- Mỗi màu hoặc segment phải có mapping rõ bằng label, legend hoặc vị trí; không bắt người xem tự đoán.
- Visualization phải dùng palette và hierarchy hiện có, không tạo một hệ màu riêng cho từng page.

### Visual QA bắt buộc

- Build, lint hoặc typecheck chỉ là quality gate kỹ thuật, không phải bằng chứng giao diện đã đạt.
- Mở đúng route thật ở desktop và mobile, cuộn toàn trang, kiểm tra overflow, typography, asset, spacing và các interaction chính.
- Kiểm tra nội dung dài hơn fixture nếu component nhận dữ liệu động; kiểm tra hover, active, disabled, focus và popup liên quan.
- Khi có reference/screenshot được duyệt, so sánh trực tiếp với reference đó; không tự thay đổi ngôn ngữ hình ảnh ngoài phạm vi.
- Với thay đổi ở component dùng chung, kiểm tra cả catalogue và ít nhất một page tiêu thụ thực tế.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
