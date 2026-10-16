# MHG Connect

## Register
product

## Users
Chủ sở hữu QR quản lý hồ sơ số và thiết kế thẻ; quản trị MHG quản lý QR và quyền nhận diện doanh nghiệp.

## Product Purpose
Kết nối sản phẩm mang QR định danh với hồ sơ số cá nhân. Thiết kế thẻ được dùng thống nhất trong màn hình quản lý, xem trước, tải ảnh và bản in.

## Brand Personality
Tối giản, rõ ràng, đáng tin cậy. Giữ giao diện hiện có theo AGENTS.md; người dùng xác nhận ngày 2026-10-16 rằng chỉ mở rộng logo doanh nghiệp và bố cục thẻ, không thiết kế lại sản phẩm.

## Anti-references
Không mang bản mẫu Vite vào Next.js. Không thêm lớp thẻ lồng nhau, đổ bóng trang trí hoặc vàng phủ bề mặt. Không để QR chồng lên chữ.

## Design Principles
- Nội dung và QR có vùng riêng, đọc được với tên dài.
- Quyền dùng logo được cấp theo doanh nghiệp, áp dụng cho nhân sự được gán rõ ràng.
- Giữ nguyên các hồ sơ, tài sản và lựa chọn đã lưu; không tự phát hành nội dung mới.
- Dùng component và token hiện có làm nguồn chuẩn.

## Accessibility & Inclusion
Theo AGENTS.md: nhãn rõ ràng, điều khiển bằng bàn phím, trạng thái focus/loading/disabled, không tràn ngang ở mobile, tiếng Việt có dấu và tôn trọng reduced motion.

## Scoped Card Presentation
Ngày 2026-10-16, người dùng yêu cầu đưa hiệu ứng shiny và tilt của danh thiếp prototype vào sản phẩm chính. Đây là ngoại lệ có chủ đích cho phần trình bày danh thiếp, không phải thay đổi phong cách toàn ứng dụng. QR/chữ luôn có vùng riêng; hiệu ứng không được đổi độ tương phản QR. Trên thiết bị cảm ứng, khi giảm chuyển động, lúc tải ảnh hoặc in, thẻ giữ phẳng. Hồ sơ TS. Nguyễn Văn Thanh chỉ là nháp local theo lựa chọn của người dùng, chưa có tài khoản thật hoặc phát hành công khai.

## Direct Card Editing
Ngày 2026-10-16, người dùng không chấp nhận các format QR/sticker cũ và chọn danh thiếp chú Thanh làm hướng chuẩn cho dashboard và các mẫu thẻ. Dùng ảnh đại diện, tên, chức danh, đơn vị và liên hệ trong một bố cục danh thiếp; QR có vùng trắng riêng. Logo MHG Airpurity không có nền trắng và luôn cố định. Người dùng xác nhận giữ cả logo MHG và logo doanh nghiệp bổ sung; quyền logo vẫn theo doanh nghiệp và toàn bộ nhân sự được gán.

Chỉnh ngay trên thẻ bằng các vùng bấm chữ, ảnh, nền và + Logo. Không dùng bảng sửa bên phải làm lối vào bắt buộc. Thay đổi chỉ thuộc thiết kế thẻ, không tự cập nhật hồ sơ công khai. Có Lưu thẻ, Hủy thay đổi, cảnh báo chưa lưu và kiểm tra xung đột phiên bản. Công cụ thử dùng chung renderer/editor thật nhưng không ghi dữ liệu khách hàng.

## Shared Profile Avatar
Ngày 2026-10-16, người dùng xác nhận ảnh đại diện trên danh thiếp và hồ sơ phải là cùng một ảnh gốc. Thẻ luôn đọc ảnh từ hồ sơ đang gắn, không nhận ảnh tải riêng hoặc dùng lại ảnh ghi đè cũ của thẻ. Trên mỗi mẫu chỉ lưu vị trí căn và độ phóng trong khung tròn, có kéo bằng chuột/cảm ứng, điều khiển bàn phím và đặt lại. Đổi ảnh gốc thực hiện trong hồ sơ; không ghi hoặc xóa ảnh hồ sơ khi căn khung thẻ.

## Clear Foreground and Fixed Brand Line
Ngày 2026-10-16, người dùng yêu cầu toàn bộ chữ, ảnh và logo trên thẻ phải rõ nét, không chỉ logo MHG. Nội dung thật giữ độ đậm đầy đủ, tăng độ đọc của chữ phụ, không để hiệu ứng nền làm nhạt nội dung. Dòng “Bảo vệ khỏi virus, vi khuẩn và nấm” là nội dung bắt buộc, luôn hiển thị, không được sửa, thay thế hoặc tắt trong các mẫu thẻ, bản xuất hay qua thao tác lưu cũ. Dùng bản logo trong suốt rõ nét hơn riêng cho thẻ, giữ nguyên tài sản gốc.

## Protected Brand and Clearable Personal Content
Ngày 2026-10-17, người dùng yêu cầu nền nhỏ sau logo và câu bảo vệ để rõ trên mọi ảnh nền; biểu tượng khiên chỉ hỗ trợ nhận diện, không sửa nội dung câu bảo vệ. Cho phép xóa từng mục hoặc toàn bộ phần cá nhân khỏi thẻ, không xóa dữ liệu hồ sơ hay ảnh gốc. Vị trí trống có dấu cộng rõ ràng để thêm lại trong trình sửa, nhưng không có trên bản xuất. Tải riêng QR là lựa chọn PNG độc lập, không vô hiệu hóa nhận diện bắt buộc trên danh thiếp. Giữ mẫu hiện tại và cơ chế lưu chủ động.
