# Kịch bản demo khách hàng

Mục tiêu: hoàn thành trọn luồng trong 7–10 phút mà không cần DevTools hay chỉnh database thủ công.

## Chuẩn bị trước buổi demo

- Xác nhận production deploy và smoke checklist trong [deployment guide](./deployment-guide.md) đã pass.
- Chạy migration/seed bằng đúng production environment. Seed tạo/khôi phục `DEMO-NEW`, `DEMO-ACTIVE`, `DEMO-LOCKED` và profile mẫu; không xóa account/profile phát sinh ngoài bộ seed.
- Sinh lại ba ảnh QR từ domain HTTPS cuối cùng và quét thử bằng camera vật lý.
- Dùng hai session sạch: trình duyệt/điện thoại cho user, cửa sổ riêng cho admin.
- Chuẩn bị một email demo mới chưa dùng, admin credential qua kênh riêng, và ba fallback URL dạng `https://<domain>/q/<token>`.
- Giữ `ENABLE_DEV_ROUTES=false` trừ khi khách cần xem catalogue hoặc báo giá nội bộ có chủ đích.

## Kịch bản chính

1. Quét QR `DEMO-NEW` khi chưa login: giải thích đây là mã chưa có chủ sở hữu.
2. Chọn tạo tài khoản, nhập email/password và cho thấy hệ thống quay lại đúng QR.
3. Kích hoạt mã: QR thuộc account vừa tạo; với account mới, tiếp tục tới Builder hồ sơ.
4. Chọn block trực tiếp trên Canvas, nhập thông tin trong Inspector, mở Outline để ẩn/sắp xếp một block, chọn kiểu đầu trang `Bìa` hoặc `Tối giản`, rồi xuất bản.
5. Quét lại cùng QR trong session khách: public profile xuất hiện; thử contact action, share và tải vCard.
6. Quay lại dashboard: cho thấy một account quản lý được nhiều QR/profile và có scan count.
7. Chỉnh một field, thử quay lại để thấy confirm thay đổi chưa lưu. Chọn `Lưu`, refresh QR ở cửa sổ khách và cho thấy dữ liệu mới.
8. Mở admin ở session riêng: tìm QR, mở detail và khóa mã; refresh public route để thấy locked state.
9. Mở khóa để profile trở lại. Nếu muốn minh họa vòng đời đầy đủ, reset ở cuối và cho thấy QR quay về available trong khi profile cũ vẫn tồn tại.

Không reset QR đang dùng giữa kịch bản chính nếu chưa sẵn sàng claim lại hoặc reseed.

## Nhánh minh họa nhanh

- `DEMO-ACTIVE`: vào thẳng profile mẫu, phù hợp khi thời gian ngắn hoặc mạng/auth chậm.
- `DEMO-LOCKED`: cho thấy trạng thái tạm khóa mà không làm thay đổi QR chính.
- Token không tồn tại: cho thấy invalid state, không phải một QR status trong database.

## Fallback

- Camera không nhận QR: mở fallback URL đã chuẩn bị.
- Session/callback cũ: dùng private/incognito window, mở lại URL của đúng token.
- QR đã bị claim ngoài ý muốn: chuyển sang token khác hoặc chạy lại seed sau khi xác nhận đúng environment.
- Avatar upload lỗi: tiếp tục profile không avatar, sau buổi demo kiểm tra Blob token/log; không đổi credential ngay trên màn hình chia sẻ.
- Public state chưa đổi sau Lưu: hard refresh/private window trước, sau đó kiểm tra version conflict và runtime logs.

## Sau buổi demo

1. Ghi lại account/token nào khách đã thao tác.
2. Chạy lại seed nếu cần khôi phục ba QR demo cho lần sau; xác nhận đang dùng đúng environment trước khi chạy.
3. Xoay admin password nếu đã phải chia sẻ rộng hoặc xuất hiện trong recording.
4. Tắt `ENABLE_DEV_ROUTES`, xóa screenshot/log có credential và xác nhận production vẫn hoạt động.

## Acceptance còn mở

Tại thời điểm tài liệu này được viết, full flow đã pass local/browser ở 375 px và 1280 px. Production deploy, Blob upload thật, QR vật lý và rehearsal Safari/iPhone + Chrome/Android chưa có bằng chứng; phải hoàn tất trước khi gọi bản demo khách hàng là release-ready.
