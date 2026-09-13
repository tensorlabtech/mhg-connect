**MHG CONNECT V12\
TÀI LIỆU YÊU CẦU KỸ THUẬT & KẾ HOẠCH TRIỂN KHAI**

*TECHNICAL SPECIFICATION, DESTINATION AD DELIVERY ENGINE & ROADMAP\
Dành riêng cho Đội ngũ Phát triển Phần mềm & Quản trị Kỹ thuật (Dev / Tech Lead / QA / DevOps)*

| **Mã dự án:** MHG CONNECT V12 | **Phiên bản:** 12.0-DEV (Full Specs, UI & Ad Engine) |
|----|----|
| **Ngày lập:** 07/08/2026 | **Trạng thái:** BỔ SUNG CÔNG NGHỆ QUẢNG CÁO TRANG ĐÍCH |

> **💡 THÔNG TIN DÀNH CHO LẬP TRÌNH VIÊN (DEV EXPLANATION)**
>
> Tài liệu này trích xuất toàn bộ yêu cầu kỹ thuật, thuật toán, máy trạng thái, cơ sở dữ liệu, nhúng 30 hình ảnh UI/Sơ đồ luồng, và BỔ SUNG ĐẶC TẢ CÔNG NGHỆ QUẢNG CÁO TRÊN TRANG ĐÍCH (Destination Page Ad Delivery Engine) từ Chương 10 của tài liệu gốc BP-07_V12.
>
> Đặc tả này quy định chính xác cơ chế phân phối banner quảng cáo/tài trợ không gây phiền (Unobtrusive Ads), thuật toán đo lường lượt xem thực tế (Active Viewability Tracking) và bộ lọc chống bot/gian lận tương tác cho lập trình viên Backend và Frontend.

# I. TỔNG QUAN KIẾN TRÚC HỆ THỐNG & HÀNH TRÌNH TRẢI NGHIỆM

**1. Hành trình Sản phẩm từ Miếng dán Điện thoại đến Hồ sơ Số**

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image1.png" style="width:5.8in;height:3.26423in" />

*📷 Hình 1: Minh họa Hành trình quét QR trên miếng dán Nano Airpurity và mở Hồ sơ số*

**2. Mô hình Kiến trúc Phân rã 4 Lớp (4-Layer Modular Architecture)**

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ 1. LAYER VẬT LÝ (PHYSICAL LAYER)                                                   │
│ - Sticker Nano Airpurity có mã QR riêng biệt / Thẻ NFC                             │
└──────────────────────────────────────────┬─────────────────────────────────────────┘
                                           │ Quét QR (HTTPS Request)
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────┐
│ 2. LAYER TRẢI NGHIỆM (EXPERIENCE LAYER - WEB / PWA / MOBILE APP)                   │
│ - QR Resolver Router: Sub-millisecond URL Redirection (Edge CDN)                   │
│ - Profile Rendering Engine: Drag-and-Drop Block Rendering (Next.js / SSR)          │
│ - Destination Page Ad Delivery Engine: Non-intrusive Sponsored Block & Tracking    │
│ - Mobile App (iOS / Android): Profile Management & Scanner Experience              │
└──────────────────────────────────────────┬─────────────────────────────────────────┘
                                           │ REST / GraphQL / Webhook
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────┐
│ 3. LAYER QUẢN TRỊ & NHIỆM VỤ LÕI (CORE BACKEND & MANAGEMENT SERVICES)              │
│ - QR Registry Service (UUID v7, CSPRNG Token, Batch Generator)                     │
│ - Identity & Auth Service (OTP SMS/Zalo/Email, RBAC, Multi-tenancy)                │
│ - Ad Server & Campaign Manager (Frequency Cap, Audience Builder, CTR Tracking)     │
│ - Payment Orchestration Engine (CP-07: VNPay, MoMo, ZaloPay, Apple/Google Pay)     │
│ - ESG & Impact Point Engine (Non-monetary Ledger, 4 Linked Ledgers)                │
│ - Omnichannel Ticket Support Service (WebSocket, Zalo ZNS/OA, Messenger)           │
└──────────────────────────────────────────┬─────────────────────────────────────────┘
                                           │ Async Queue / Transaction Logs
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────┐
│ 4. LAYER DỮ LIỆU & LƯU TRỮ (DATA & INFRASTRUCTURE LAYER)                           │
│ - Primary DB: PostgreSQL (Giao dịch, Profile, User, Enterprise Tenancy)            │
│ - Cache & Rate Limit: Redis (Session, Rate Limiting, Frequency Capping)            │
│ - Scan & Ad Impression Event Store: Append-Only TimeSeries DB / Kafka / Redpanda   │
│ - Storage & CDN: Cloudflare R2 / S3 + Cloudflare Edge CDN (Media / Assets)         │
└────────────────────────────────────────────────────────────────────────────────────┘
```

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image2.png" style="width:5.8in;height:3.26423in" />

*📷 Hình 2: Giao diện Bảng điều khiển Vận hành Tổng quan Hệ thống MHG Connect*

# II. TRUNG TÂM QUẢN LÝ MÃ QR & QUY TRÌNH XÁC THỰC

**1. Sơ đồ Luồng Tạo mã QR, Kích hoạt OTP và Ghi nhận Lượt quét**

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image3.png" style="width:5.8in;height:3.26423in" />

*📷 Hình 3: Sơ đồ Luồng Thống nhất từ Tạo lô mã QR, Quét kích hoạt OTP đến Ghi nhận Lượt quét*

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image4.png" style="width:5.8in;height:3.26423in" />

*📷 Hình 4: Quy trình Kích hoạt Hồ sơ của Chủ sở hữu*

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image5.png" style="width:5.8in;height:3.26423in" />

*📷 Hình 5: Luồng Trải nghiệm của Người quét và Tạo kết nối*

**2. Giao diện Trung tâm Quản lý mã QR của MHG (Master QR Registry)**

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image6.png" style="width:5.8in;height:3.26423in" />

*📷 Hình 6: Giao diện Màn hình Quản trị Trung tâm Mã QR của MHG*

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image7.png" style="width:5.8in;height:3.26423in" />

*📷 Hình 7: Hệ thống Sản xuất Miếng dán Cá nhân hóa theo Lô*

# III. TRÌNH DỰNG HỒ SƠ & CÔNG NGHỆ QUẢNG CÁO TRÊN TRANG ĐÍCH

**1. Trình dựng Hồ sơ theo Khối (Block-Based Profile Builder)**

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image8.png" style="width:5.8in;height:3.86667in" />

*📷 Hình 8: Giao diện Trình dựng Hồ sơ theo Khối kéo-thả*

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image9.png" style="width:5.8in;height:3.26423in" />

*📷 Hình 9: Cổng Điều khiển & Chỉnh sửa của Chủ Hồ sơ*

**2. CÔNG NGHỆ PHÂN PHỐI QUẢNG CÁO TRÊN TRANG ĐÍCH (DESTINATION PAGE AD ENGINE)**

Theo thiết kế chuẩn tại Chương 10 tài liệu gốc, khi người quét mã QR chuyển hướng thành công đến trang đích (Destination Profile / Enterprise Page / Event Page), hệ thống MHG Connect hỗ trợ phân phối Khối Quảng cáo / Tài trợ (Sponsored Block) ngay trên trang đích nhưng tuân thủ nghiêm ngặt nguyên tắc KHÔNG GÂY PHIỀN (Unobtrusive Ads).\
\
Cơ chế Kỹ thuật Phân phối & Đo lường Quảng cáo bao gồm 5 quy tắc chuẩn:

- Nguyên tắc Hiển thị Không Che Hồ sơ (Non-Intrusive Banner Placement): Quảng cáo KHÔNG ĐƯỢC thiết kế dạng Pop-up, Interstitial hay Overlay che khuất thông tin liên hệ chính. Banner quảng cáo xuất hiện dưới dạng một Khối Khảo sát / Tài trợ có Nhãn (Sponsored Card Block) nằm ở cuối hồ sơ hoặc sau các hành động chính (Lưu danh bạ, Bấm gọi).

- Thuật toán Đo lường Lượt xem Thực tế (Active Viewability Tracking): Hệ thống KHÔNG tính tiền/ghi nhận 1 lượt tải trang tự động là 1 lượt xem quảng cáo có giá trị. Một Impression hợp lệ chỉ được ghi nhận khi: (1) Khối banner xuất hiện ít nhất 50% diện tích trên màn hình hiển thị; (2) Thời gian duy trì xem chủ động (Active View Duration) ≥ 1.0 giây; (3) Không phải bot/máy tự động.

- Bộ lọc Tần suất & Giới hạn Tần suất (Frequency Capping): Hệ thống dùng Redis Token Bucket / Fingerprint Hash để giới hạn tần suất hiển thị quảng cáo: Tối đa 1-2 lần hiển thị cùng một chiến dịch cho cùng 1 thiết bị/IP trong khoảng thời gian 24 giờ, tránh làm phiền trải nghiệm quét.

- Cấu trúc JSON Schema cho Khối Tài trợ (Sponsored Block Schema):\
  \`\`\`json\
  {\
  "block_type": "SPONSORED_CARD",\
  "campaign_id": "CAMP-2026-ESG-01",\
  "sponsor_name": "Nhà tài trợ Vinamilk / Eco Partner",\
  "banner_url": "https://cdn.mhg.vn/ads/banner_eco_01.webp",\
  "target_url": "https://c.mhg.vn/redirect/campaign/CAMP-2026-ESG-01",\
  "impression_pixel": "https://api.mhg.vn/v1/analytics/ad-impression",\
  "tracking_meta": { "view_duration_ms": 1000, "is_opt_in_lead": true }\
  }\
  \`\`\`

- An toàn Thương hiệu & Kiểm duyệt Domain (Brand Safety & Redirect Reputation): Mọi URL đích của quảng cáo phải trải qua bộ lọc Allowlist / Domain Reputation Check trước khi xuất bản, ngăn chặn tuyệt đối đường dẫn lừa đảo, chứa mã độc hoặc chuyển hướng trái phép.

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image10.png" style="width:5.8in;height:3.26423in" />

*📷 Hình 10: Giao diện Bảng Phân tích Chiến dịch Quảng cáo, Lượt quét, Lượt xem Hợp lệ & Chuyển đổi trên Trang đích*

**3. Quản trị Doanh nghiệp B2B (Enterprise B2B Management Portal)**

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image11.png" style="width:5.8in;height:3.44932in" />

*📷 Hình 11: Giao diện Quản trị Doanh nghiệp trên Máy tính & Điện thoại (Desktop & Mobile view)*

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image12.png" style="width:5.8in;height:3.26423in" />

*📷 Hình 12: Trang Doanh nghiệp Công khai & Trình dựng Nội dung*

**4. Giao diện Thương mại & Cộng tác viên (Affiliate Marketing)**

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image13.png" style="width:5.8in;height:3.86667in" />

*📷 Hình 13: Bảng Điều khiển Trang chủ Cộng tác viên*

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image14.png" style="width:5.8in;height:3.26423in" />

*📷 Hình 14: Giao diện Chọn & Chỉnh sửa Sản phẩm Giới thiệu trên Hồ sơ*

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image15.png" style="width:5.8in;height:3.26423in" />

*📷 Hình 15: Trải nghiệm Người quét khi Xem Sản phẩm Giới thiệu*

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image16.png" style="width:5.8in;height:3.86667in" />

*📷 Hình 16: Giao diện Mã Giới thiệu, Đối soát Hoa hồng & Yêu cầu Rút tiền*

# IV. PAYMENT ORCHESTRATION & DỊCH VỤ MOBILE (CP-07)

**1. Kiến trúc Điều phối Thanh toán (Payment Orchestration Architecture)**

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image17.png" style="width:5.8in;height:3.2625in" />

*📷 Hình 17: Kiến trúc Sơ đồ Điều phối Thanh toán Đa kênh Payment Orchestration Engine*

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image18.png" style="width:5.8in;height:3.2625in" />

*📷 Hình 18: Giao diện Trung tâm Kiểm soát Thanh toán Payment Control Center*

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image19.png" style="width:5.8in;height:3.2625in" />

*📷 Hình 19: Wireframe Hành trình Mobile App & Controlled Checkout Flow*

**2. Năm Lớp Phòng vệ Pháp lý & Tuân thủ**

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image20.png" style="width:5.8in;height:3.2625in" />

*📷 Hình 20: Khung Kiểm soát 5 Lớp Phòng vệ Pháp lý & Compliance*

# V. ESG TRANSPARENCY LEDGERS & OMNICHANNEL SUPPORT TICKET

**1. Khung 4 Sổ Minh bạch ESG & Tác động**

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image21.png" style="width:5.8in;height:3.38333in" />

*📷 Hình 21: Kiến trúc Sơ đồ 4 Sổ Minh bạch Liên kết (4 Linked Transparency Ledgers)*

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image22.png" style="width:5.8in;height:3.26423in" />

*📷 Hình 22: Giao diện Bảng Tác động ESG của Cá nhân & Doanh nghiệp*

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image23.png" style="width:5.8in;height:3.38333in" />

*📷 Hình 23: Hành trình Tích hợp giữa Card visit, Mã QR và Kênh Tác động*

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image24.png" style="width:5.8in;height:3.38333in" />

*📷 Hình 24: Sơ đồ Lộ trình Partner-First trong Triển khai Dự án ESG*

**2. Hệ thống Hỗ trợ Khách hàng Omnichannel Support Ticket**

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image25.png" style="width:5.8in;height:3.26423in" />

*📷 Hình 25: Giao diện Trung tâm Hỗ trợ & Quản lý Ticket Hợp nhất*

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image26.png" style="width:5.8in;height:3.26423in" />

*📷 Hình 26: Giao diện Trợ lý AI Soạn nháp & Chuyên viên Duyệt phản hồi (Human-in-the-loop)*

**3. Danh mục các Kế hoạch Kinh doanh Con trong Hệ thống BP-07**

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image27.png" style="width:5.8in;height:3.2625in" />

*📷 Hình 27: Cấu trúc Sáu Kế hoạch Kinh doanh Con trong BP-07*

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image28.png" style="width:5.8in;height:3.2625in" />

*📷 Hình 28: Cấu trúc Bổ sung Bảy Kế hoạch Kinh doanh Con (Bao gồm CP-07 Mobile & Payment)*

<img src="./assets/20260807140700-mhg-connect-v12-tech-spec/image29.png" style="width:5.8in;height:3.2625in" />

*📷 Hình 29: Lộ trình Danh mục có Cổng Kiểm soát (Gated Portfolio Roadmap)*

# VI. PHÂN RÃ CÔNG VIỆC THEO MÔ HÌNH JIRA (ENGINEERING ROADMAP)

*Bảng Phân rã Chi tiết 6 Epics Triển khai cho Đội ngũ Dev, QA, DevOps (Bổ sung Task Quảng cáo Trang đích DEV-205 & DEV-206):*

| Task ID | Tên Task / Hạng mục Kỹ thuật | Phụ trách | Acceptance Criteria (AC / Tiêu chí) |
|---|---|---|---|
| **EPIC 1: QR REGISTRY, BATCH ENGINE & SẢN XUẤT (SPRINT 1 - 2)** | | | |
| **DEV-101** | Thiết kế Database Schemas (qr_codes, qr_state_logs, batches) | Backend | Chạy Migration sạch, có Index public_token. |
| **DEV-102** | Viết Worker Sinh mã QR hàng loạt (Batch) bằng UUIDv7 & CSPRNG Token Base62 | Backend | Sinh 10,000 QR/job có Idempotency, không trùng. |
| **DEV-103** | Module Xuất File PDF/SVG Manifest cho Nhà in với pdf-lib & sharp | Backend | Tệp in khớp Checksum, có HMAC signature. |
| **DEV-104** | Tool Quét QA Kiểm tra Lô in bằng Python (segno, pyzbar) | QA / Dev | Tự động đọc QA đạt > 99.9% độ chính xác. |
| **EPIC 2: QR RESOLVER, OTP ACTIVATION, PROFILE & AD ENGINE (SPRINT 2 - 3)** | | | |
| **DEV-201** | Xây dựng Resolver Routing Engine tại Edge (c.mhg.vn/q/{public_token}) | Backend | Latency < 50ms, async scan logging vào Redis. |
| **DEV-202** | Module Xác thực OTP Kích hoạt (SMS, Zalo ZNS, Email) | Backend | Rate limit 5 lần thử, hash OTP, Atomic DB Transaction. |
| **DEV-203** | Trình dựng Hồ sơ Kéo-thả Khối (Block Profile Builder: Text, Image, Link, ESG) | Frontend | Render đúng 12 loại block, Không cho HTML/Iframe thô. |
| **DEV-204** | Trang Hiển thị Hồ sơ Số Trang Đích (SSR Profile Render Page) | Frontend | Tối ưu Mobile Web, Tải trang < 1.2s. |
| **DEV-205** | Module Server Quảng cáo & Khối Tài trợ trên Trang đích (Destination Ad Engine) | Backend | Phân phối SPONSORED_CARD JSON, Frequency Capping. |
| **DEV-206** | Ad Impression, Viewability & Click Tracking Engine | Fullstack | Ghi nhận Lượt xem Hợp lệ (View duration >= 1s), Chống bot. |
| **EPIC 3: PORTAL DOANH NGHIỆP & PHÂN QUYỀN RBAC (SPRINT 3 - 4)** | | | |
| **DEV-301** | Multi-tenant Architecture & Portal B2B Admin | Backend | Phân tách Tenant isolation theo enterprise_id. |
| **DEV-302** | Quản lý QR thuộc Doanh nghiệp (Bulk Assignment, Remote Profile Lock) | Backend | Doanh nghiệp chỉnh sửa hồ sơ công việc từ xa. |
| **DEV-303** | Dashboard B2B trên Máy tính & Mobile | Frontend | Bảng Nhân sự, Lượt quét, ESG, Campaign Analytics. |
| **EPIC 4: PAYMENT ORCHESTRATION & MOBILE APP (CP-07) (SPRINT 5 - 6)** | | | |
| **DEV-401** | Payment Gateway Adapters (VNPay, MoMo, ZaloPay, Apple/Google Pay) | Backend | Xử lý Webhook Idempotent, Xác minh Chữ ký HMAC. |
| **DEV-402** | Sổ Kế toán Kép Đối soát D+1 (Dual-entry Reconciliation Engine) | Backend | Tự động phát hiện sai lệch tiền Ngân hàng/PSP. |
| **DEV-403** | Mobile App Card Holder (React Native / Flutter) | Mobile | Ghép nối Sticker, Quản lý Profile, Nhận Điểm. |
| **EPIC 5: ESG IMPACT ENGINE & 4 SỔ MINH BẠCH (SPRINT 6 - 7)** | | | |
| **DEV-501** | Engine Điểm Tác động Phi tiền tệ (impact_points) | Backend | Ràng buộc Pool tài trợ, Không rút tiền, Không hứa Carbon. |
| **DEV-502** | Khởi tạo 4 Sổ Minh bạch (Ledger Projects, Cashflow, Points, Evidence) | Backend | Append-only DB, Snapshot Hash hằng ngày. |
| **DEV-503** | Dashboard Minh bạch Công khai | Frontend | Khảo sát Tác động, Bản đồ Cây/Lô trồng, Bằng chứng. |
| **EPIC 6: OMNICHANNEL SUPPORT TICKET & OPERATIONS (SPRINT 7 - 8)** | | | |
| **DEV-601** | Unified Support Ticket Service | Backend | Đồng bộ Web Chat (WS/SSE), Zalo OA, FB Messenger. |
| **DEV-602** | AI Assistant Support Bot (Human-in-the-Loop Approval) | Backend | AI tạo bản nháp, Bắt buộc Chuyên viên duyệt trả lời. |
| **DEV-603** | MHG Master Control Center (Super Admin) | Frontend | Quản trị Sổ QR, Cảnh báo Gian lận, Audit Log. |

# VII. TIÊU CHÍ HOÀN THÀNH KỸ THUẬT (DEFINITION OF DONE - DoD)

- Code Complete & Review: 100% Code được Review qua Pull Request (PR), đáp ứng tiêu chuẩn LINT & Static Analysis (SonarQube/ESLint).

- Unit Test & Integration Test: Unit Test Coverage \> 80% đối với Backend API, Ad Delivery Engine, Payment Adapters và Máy Trạng thái QR.

- Security Audit (VAPT): Không có lỗ hổng bảo mật mức High/Critical (XSS, SQL Injection, CSRF, Unauthenticated Webhooks, Insecure Direct Object References).

- Performance Benchmark:\
  • QR Resolver & Ad Server: Trả về kết quả Redirect & Sponsored Block JSON trong \< 50ms dưới mức tải 5,000 requests/giây.\
  • Profile Render & Ad Impression: Tải trang Web Mobile & Khối tài trợ \< 1.2s (First Contentful Paint).

- Data & Financial Integrity: Đối soát D+1 thành công giữa PSP/Ngân hàng/Ad Impression Logs và Ledger nội bộ với tỷ lệ sai lệch 0%.

*--- TÀI LIỆU KỸ THUẬT ĐẦY ĐỦ BỔ SUNG CÔNG NGHỆ QUẢNG CÁO TRÊN TRANG ĐÍCH (MHG CONNECT V12) ---*
