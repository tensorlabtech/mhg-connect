(function () {
    "use strict";

    var concepts = {
        edgeSecurity: {
            kind: "Cloudflare",
            definition: "Lớp bảo vệ ở biên mạng gồm chống DDoS, WAF và rate limiting trước khi request chạm vào code ứng dụng.",
            role: "Giảm request độc hại vào route QR và các public endpoint, đặc biệt khi một mã bị bot quét hàng loạt.",
            flow: "Người dùng → Cloudflare Edge Security → CDN cache → Next.js origin khi cache miss.",
            talk: "Đây là lớp cửa ngõ, không thay thế authorization và validation trong NestJS."
        },
        edgeCache: {
            kind: "Cloudflare Cache",
            definition: "Bộ nhớ đệm phân tán tại các điểm edge, gần người quét hơn server ứng dụng.",
            role: "Giữ HTML hồ sơ active tại /q/{publicToken} để đa số lượt quét không cần gọi origin.",
            flow: "Cache HIT → trả HTML ngay tại edge. Cache MISS → gọi Next.js → chỉ lưu response active. Khi publish/khóa mã → purge URL hoặc Cache-Tag.",
            talk: "Chỉ cache dữ liệu public; tuyệt đối không cache OTP, draft, admin hay response phụ thuộc session."
        },
        bullmq: {
            kind: "Node.js · Redis",
            definition: "BullMQ là thư viện hàng đợi job nền cho Node.js, dùng Redis để lưu trạng thái và phân phối công việc.",
            role: "Tách việc nặng hoặc cần retry như sinh lô QR, xử lý media và gọi lại Cache Purge khỏi request của Admin.",
            flow: "API tạo job → Redis queue → BullMQ Worker nhận job → xử lý → ghi kết quả hoặc retry với backoff.",
            talk: "Queue giúp giao diện không phải chờ, nhưng Redis không trở thành nguồn dữ liệu nghiệp vụ chuẩn."
        },
        redis: {
            kind: "Data runtime",
            definition: "Kho key-value trong bộ nhớ, phù hợp dữ liệu sống ngắn và truy cập rất nhanh.",
            role: "Giữ OTP có TTL, rate-limit counters, cache mapping QR và dữ liệu hàng đợi BullMQ.",
            flow: "API đọc Redis trước cho dữ liệu tạm; thiếu hoặc cần xác nhận chuẩn thì đọc PostgreSQL rồi cập nhật cache.",
            talk: "Có thể mất cache và dựng lại; dữ liệu sở hữu QR và hồ sơ chuẩn vẫn phải nằm ở PostgreSQL."
        },
        postgres: {
            kind: "Database chuẩn",
            definition: "Cơ sở dữ liệu quan hệ lưu trạng thái nghiệp vụ có transaction và ràng buộc nhất quán.",
            role: "Lưu QR, tài khoản, ownership, hồ sơ, published snapshot và audit log của hệ thống.",
            flow: "NestJS/Prisma mở transaction → kiểm tra điều kiện → ghi thay đổi atomically → cập nhật cache hoặc phát job sau commit.",
            talk: "PostgreSQL là source of truth; cache chỉ là lớp tăng tốc và phải được invalidation sau write."
        },
        otpProvider: {
            kind: "Dịch vụ bên thứ ba",
            definition: "Kênh gửi mã xác minh một lần tới email hoặc Zalo ZNS của người dùng.",
            role: "Chứng minh người kích hoạt kiểm soát kênh liên hệ trước khi hệ thống cho phép claim QR.",
            flow: "API tạo OTP hash + TTL → provider gửi mã → người dùng nhập mã → API verify và consume OTP một lần.",
            talk: "MVP ưu tiên email; Zalo ZNS chỉ bật khi MHG hoàn tất tài khoản và mẫu gửi."
        },
        dnsTls: {
            kind: "Cloudflare",
            definition: "DNS đưa domain về Cloudflare; TLS kết thúc kết nối HTTPS và mã hóa đường truyền từ browser.",
            role: "Tạo cửa vào thống nhất cho /q, /p và API public, đồng thời che origin khỏi phần lớn lưu lượng trực tiếp.",
            flow: "Browser tra DNS → kết nối HTTPS với Cloudflare → Cloudflare kiểm tra security và trả cache hoặc chuyển tới origin.",
            talk: "Nên dùng Full (strict) để cả đoạn Cloudflare → origin cũng được xác thực bằng certificate hợp lệ."
        },
        turnstile: {
            kind: "Cloudflare",
            definition: "Cơ chế xác minh người dùng tương tự CAPTCHA nhưng giảm thao tác gây phiền.",
            role: "Bảo vệ các form dễ bị abuse như yêu cầu OTP, đăng nhập hoặc thao tác public nhạy cảm.",
            flow: "Browser nhận Turnstile token → gửi kèm request → NestJS gọi Siteverify → chỉ xử lý khi kết quả hợp lệ.",
            talk: "Không được tin token ở frontend; bước Siteverify tại server mới là kiểm tra có giá trị."
        },
        edgeObservability: {
            kind: "Cloudflare",
            definition: "Analytics và log về traffic, cache, WAF và lỗi phục vụ tại Cloudflare edge.",
            role: "Theo dõi cache hit/miss, HTTP status, latency và lưu lượng bất thường của route QR.",
            flow: "Cloudflare edge phát event/metric → dashboard hoặc log stream → đội vận hành điều tra và cảnh báo.",
            talk: "Observability là kênh quan sát song song, không phải một bước mà request phải đi qua."
        },
        systemObservability: {
            kind: "Operations",
            definition: "Tập hợp log, metric, trace và alert từ edge, web, API, worker nền và queue.",
            role: "Cho biết lỗi nằm ở Cloudflare, ứng dụng, database hay job nền thay vì suy đoán từ phản ánh người dùng.",
            flow: "Mỗi lớp phát telemetry → gom về dashboard → rule cảnh báo → đội vận hành tra log theo request/job ID.",
            talk: "MVP cần bộ chỉ số tối thiểu: error rate, latency, queue backlog, cache hit và purge failure."
        },
        originData: {
            kind: "Ranh giới sở hữu",
            definition: "Redis và PostgreSQL là hạ tầng dữ liệu của ứng dụng, không phải dữ liệu nằm trong Cloudflare Cache.",
            role: "Giữ trạng thái chuẩn và dữ liệu runtime khi edge không có cache hoặc cần xử lý nghiệp vụ.",
            flow: "Cloudflare chỉ gọi origin khi cache miss hoặc request cần write; origin trả kết quả public để edge cache lại nếu phù hợp.",
            talk: "Tách rõ edge và origin giúp tư vấn đúng trách nhiệm, chi phí và phương án backup."
        },
        purgeWorker: {
            kind: "BullMQ Worker",
            definition: "Tiến trình nền chịu trách nhiệm thử lại yêu cầu xóa cache khi lần gọi Cloudflare Purge API chưa thành công.",
            role: "Ngăn edge tiếp tục trả trạng thái QR hoặc hồ sơ cũ sau publish, khóa, mở khóa hay vô hiệu mã.",
            flow: "Write commit → gọi purge → nếu lỗi thì enqueue → worker retry với backoff → ghi log/alert nếu hết lượt.",
            talk: "Purge là hệ quả sau commit; không rollback dữ liệu chuẩn chỉ vì Cloudflare tạm thời lỗi."
        },
        businessApi: {
            kind: "NestJS · Prisma",
            definition: "Backend thực thi luật nghiệp vụ, authorization và transaction của hệ thống.",
            role: "Xử lý activation, profile, publish, admin QR và các thao tác cần đọc/ghi dữ liệu chuẩn.",
            flow: "Client/Next.js → NestJS guards + validation → service/Prisma transaction → PostgreSQL → cập nhật Redis/purge sau commit.",
            talk: "Cloudflare tăng tốc request public; API mới là nơi quyết định quyền và tính hợp lệ của thao tác write."
        },
        profileWeb: {
            kind: "Next.js · SSR",
            definition: "Ứng dụng web render hồ sơ công khai thành HTML đầy đủ thay vì chỉ trả JSON cho browser.",
            role: "Phục vụ một route /q/{publicToken}: ActivationView khi chưa active, hồ sơ public khi active và trang trạng thái khi bị khóa/lỗi.",
            flow: "Cache miss → Next.js gọi API lấy status/snapshot → render HTML → chỉ response active được Cloudflare cache.",
            talk: "Public page chỉ đọc bản đã publish, không đọc draft đang chỉnh sửa."
        },
        validation: {
            kind: "Zod · DOMPurify",
            definition: "Zod kiểm tra cấu trúc dữ liệu; DOMPurify làm sạch nội dung HTML/URL có thể gây XSS.",
            role: "Ngăn block JSON sai schema hoặc nội dung độc hại được lưu và phát tán qua trang hồ sơ public.",
            flow: "Profile Builder gửi draft → API validate + sanitize → lưu draft hợp lệ → publish snapshot khi người dùng xác nhận.",
            talk: "Frontend validation giúp UX; server validation mới là ranh giới bảo mật bắt buộc."
        },
        mediaPolicy: {
            kind: "Sharp · Storage",
            definition: "Luồng kiểm tra MIME/kích thước và chuẩn hóa ảnh trước khi lưu trữ công khai.",
            role: "Giảm file quá lớn, định dạng không hợp lệ và chi phí băng thông cho ảnh đại diện/gallery.",
            flow: "Upload → kiểm tra MIME/size → Sharp resize/nén → object storage → trả URL media đã tối ưu.",
            talk: "Không chỉ tin extension file; cần kiểm tra nội dung và đặt giới hạn dung lượng tại server."
        },
        publishedSnapshot: {
            kind: "Mô hình dữ liệu",
            definition: "Bản chụp nội dung công khai tại thời điểm publish, tách khỏi draft đang chỉnh sửa.",
            role: "Giữ trang public ổn định và cho phép người dùng chỉnh draft mà khách quét chưa thấy thay đổi dở dang.",
            flow: "Sửa draft → validate → tạo snapshot/version → set active → purge cache → edge phục vụ bản mới.",
            talk: "Tách draft/published làm cache và rollback rõ ràng hơn cho MVP."
        },
        objectStorage: {
            kind: "S3-compatible · R2",
            definition: "Kho object dành cho ảnh, PDF và file xuất; khác database quan hệ.",
            role: "Lưu media hồ sơ và file QR theo lô với URL tải hoặc URL public phù hợp.",
            flow: "API/worker upload object → lưu key/metadata trong PostgreSQL → CDN hoặc signed URL phục vụ file.",
            talk: "Có thể chọn Cloudflare R2 hoặc dịch vụ S3-compatible; đây là quyết định triển khai, không khóa cứng logic ứng dụng."
        },
        otpChallenge: {
            kind: "Redis · Security",
            definition: "Bản ghi tạm gồm OTP hash, TTL, số lần thử và trạng thái đã sử dụng.",
            role: "Giới hạn cửa sổ xác minh và ngăn cùng một OTP bị dùng lại để claim nhiều lần.",
            flow: "Tạo challenge → gửi OTP → verify hash + attempts + TTL → consume → mới cho phép transaction claim QR.",
            talk: "Không lưu OTP dạng rõ; hết TTL hoặc vượt số lần thử thì buộc tạo challenge mới."
        },
        scanEvent: {
            kind: "Analytics tại edge",
            definition: "Sự kiện frontend gửi khi route /q/{publicToken} được mở trong browser.",
            role: "Ước lượng số lượt quét, kể cả khi QR chưa active; dữ liệu có thể thiếu do ad blocker hoặc browser đóng sớm.",
            flow: "HTML /q hiển thị → sendBeacon gửi scan_event tới API → backend ghi hoặc gom batch bất đồng bộ.",
            talk: "Không để việc đếm traffic chặn render; coi đây là analytics gần đúng, không phải số liệu thanh toán."
        },
        profileView: {
            kind: "Browser analytics",
            definition: "Tín hiệu frontend gửi sau khi trang hồ sơ được mở hoặc đủ điều kiện tính một lượt xem.",
            role: "Đo trải nghiệm trang đích, tách khỏi số request vào URL QR.",
            flow: "Browser render /p → gửi beacon/request nền → API ghi nhận hoặc gom batch.",
            talk: "Có thể thiếu do ad blocker hoặc bị gửi lặp; không đồng nhất profile_view với scan_event."
        },
        auditLog: {
            kind: "Traceability",
            definition: "Nhật ký bất biến mô tả ai làm gì, với đối tượng nào và vào thời điểm nào.",
            role: "Tra soát activation, publish, khóa/mở khóa và vô hiệu QR khi có khiếu nại vận hành.",
            flow: "API xác thực actor → transaction nghiệp vụ → ghi audit record cùng correlation ID hoặc metadata cần thiết.",
            talk: "Audit log khác application log: nó phục vụ lịch sử nghiệp vụ và không nên bị người dùng sửa."
        },
        identity: {
            kind: "Authentication",
            definition: "Lớp xác minh email OTP, tạo session và duy trì danh tính người đang thao tác.",
            role: "Bảo đảm người dùng đã đăng nhập trước khi sửa hồ sơ hoặc claim QR.",
            flow: "OTP hợp lệ → tạo/khôi phục user → cấp session cookie an toàn → guards dùng session cho request sau.",
            talk: "Đăng nhập chứng minh danh tính; ownership check vẫn phải chạy riêng cho từng hồ sơ/QR."
        },
        policyApi: {
            kind: "NestJS Guards",
            definition: "Lớp kiểm soát quyền dựa trên session, ownership và role Admin MHG.",
            role: "Ngăn người đã đăng nhập sửa hồ sơ của người khác hoặc dùng API quản trị không đúng quyền.",
            flow: "Request → authenticate session → load resource → ownership/RBAC check → mới gọi service nghiệp vụ.",
            talk: "publicToken chỉ dùng định tuyến; nó không phải access token và không cấp quyền chỉnh sửa."
        },
        sanitizer: {
            kind: "Application security",
            definition: "Bộ quy tắc làm sạch block JSON, HTML và URL trước khi lưu hoặc render.",
            role: "Giảm stored XSS từ nội dung hồ sơ do người dùng nhập.",
            flow: "Input → schema validation → allowlist URL/content → sanitize → lưu → encode/render an toàn ở frontend.",
            talk: "Cần kết hợp validation, sanitization và output encoding; một lớp riêng lẻ không đủ."
        },
        edgeGateway: {
            kind: "Cloudflare edge",
            definition: "Cụm cửa vào public gồm DNS, TLS, WAF, rate limiting và CDN cache.",
            role: "Bảo vệ và tăng tốc /q và /p trước khi request cần quay về hệ thống ứng dụng.",
            flow: "Internet → Cloudflare gateway → CDN cache → Next.js origin khi cache miss.",
            talk: "Edge là lớp managed; đội dự án vẫn phải cấu hình DNS, WAF, Cache Rules và purge policy."
        },
        workerRuntime: {
            kind: "Background processing",
            definition: "Tiến trình Node.js chạy job BullMQ độc lập với web/API request.",
            role: "Xử lý sinh QR hàng loạt, media và cache purge retry mà không làm timeout request người dùng.",
            flow: "API enqueue → worker consume → cập nhật tiến độ/kết quả → Admin polling hoặc nhận trạng thái hoàn tất.",
            talk: "Cần monitor queue backlog, failed jobs và cơ chế retry/idempotency."
        },
        dataServices: {
            kind: "PostgreSQL · Redis",
            definition: "Hai lớp dữ liệu với vai trò khác nhau: PostgreSQL giữ dữ liệu chuẩn, Redis giữ dữ liệu nhanh và tạm.",
            role: "Đáp ứng transaction nghiệp vụ đồng thời hỗ trợ OTP, cache và queue cho MVP.",
            flow: "API ghi PostgreSQL trước → sau commit cập nhật/invalidate Redis → worker và edge nhận trạng thái mới.",
            talk: "Không coi Redis là bản sao chuẩn; thiết kế phải chịu được việc cache bị xóa."
        },
        backup: {
            kind: "Operations",
            definition: "Bản sao định kỳ của dữ liệu PostgreSQL kèm thời gian lưu giữ và quy trình phục hồi.",
            role: "Giảm rủi ro mất ownership, hồ sơ và lịch sử quản trị khi có sự cố dữ liệu.",
            flow: "Database → scheduled backup → lưu ngoài instance chính → định kỳ restore thử sang môi trường kiểm tra.",
            talk: "Có backup chưa đủ; chỉ lần restore thử thành công mới chứng minh khả năng phục hồi."
        },
        adminBatchWorker: {
            kind: "BullMQ · node-qrcode",
            definition: "Worker nền tạo publicToken, render QR và đóng gói file theo lô cho nhà in.",
            role: "Cho phép Admin tạo hàng nghìn mã mà không giữ một HTTP request quá lâu.",
            flow: "Admin tạo lô → API enqueue → worker sinh token/QR → upload file → cập nhật trạng thái lô → Admin tải.",
            talk: "Job phải idempotent để retry không sinh trùng token hoặc tạo lô sai trạng thái."
        }
    };

    window.MHGLearningContent = {
        concepts: concepts,
        byFile: {
            "mhg-phase-1-system-architecture.html": {
                edgeSecurity: "edgeSecurity", edgeCache: "edgeCache", publicWeb: "profileWeb",
                jobs: "bullmq", redis: "redis", postgres: "postgres", otpProvider: "otpProvider"
            },
            "mhg-phase-1-cloudflare-responsibilities.html": {
                dnsTls: "dnsTls", edgeSecurity: "edgeSecurity", edgeCache: "edgeCache",
                turnstile: "turnstile", observability: "edgeObservability", nextWeb: "profileWeb",
                dataOrigin: "originData", purgeWorker: "purgeWorker"
            },
            "mhg-phase-1-activation.html": {
                api: "businessApi", otp: "otpProvider", redis: "otpChallenge",
                db: "postgres", edgeCache: "edgeCache"
            },
            "mhg-phase-1-public-scan.html": {
                edgeCache: "edgeCache", redis: "redis", db: "postgres", web: "profileWeb"
            },
            "mhg-phase-1-profile-publishing.html": {
                validation: "validation", mediaPolicy: "mediaPolicy", published: "publishedSnapshot",
                storage: "objectStorage", ssr: "profileWeb"
            },
            "mhg-phase-1-domain-model.html": {
                otpChallenge: "otpChallenge", publishedSnapshot: "publishedSnapshot",
                scanEvent: "scanEvent", profileView: "profileView", auditLog: "auditLog"
            },
            "mhg-phase-1-access-security.html": {
                edgeSecurity: "edgeSecurity", edgeCache: "edgeCache", publicProfile: "profileWeb", identity: "identity",
                policyApi: "policyApi", sanitizer: "sanitizer", auditLog: "auditLog"
            },
            "mhg-phase-1-deployment-operations.html": {
                edgeGateway: "edgeGateway", edgeCache: "edgeCache", workerRuntime: "workerRuntime",
                dataServices: "dataServices", objectStorage: "objectStorage", backup: "backup",
                observability: "systemObservability"
            },
            "mhg-phase-1-admin-qr-batch.html": {
                queue: "bullmq", worker: "adminBatchWorker", storage: "objectStorage", edgeCache: "edgeCache"
            }
        }
    };
})();
