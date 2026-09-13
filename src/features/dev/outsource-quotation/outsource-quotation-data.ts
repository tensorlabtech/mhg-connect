export type WorkPackage = {
  id: string
  title: string
  purpose: string
  price: number
  effort: string
  scope: string[]
  technologies: string[]
  deliverable: string
  acceptance: string
}

export const quotation = {
  meta: {
    number: "MHG-2026-08",
    issuedAt: "11/08/2026",
    validFor: "30 ngày",
    provider: "TensorLab",
    client: "MHG",
  },
  title: "MHG Connect",
  headline: "QR định danh và",
  headlineAccent: "hồ sơ số",
  summary: "Mỗi Sticker Nano Airpurity mang một mã QR định danh. Khi quét, người dùng mở hồ sơ số dành cho cá nhân hoặc doanh nghiệp.",
  metrics: [
    { value: "4", label: "Hạng mục" },
    { value: "170tr", label: "Chi phí phát triển" },
    { value: "~4", label: "Man-month" },
    { value: "1,5–2", label: "Tháng" },
  ],
  objective: {
    scale: "≈1.000",
    scaleLabel: "sticker được bán mỗi tháng",
    statement: "Mã QR định danh biến sản phẩm vật lý thành điểm chạm số.",
    supporting: "Một lần quét nối khách hàng với hồ sơ cá nhân, hồ sơ công việc và hệ thống quản trị tập trung.",
    journeySteps: ["Sticker MHG", "Quét QR", "Kích hoạt", "Hồ sơ số", "Quản trị"],
    principle: "Một mã định danh, nhiều trang đích. MHG kiểm soát vòng đời mã; người dùng kiểm soát nội dung hồ sơ.",
  },
  workPackages: [
    {
      id: "01",
      title: "Mã cá nhân, doanh nghiệp và kích hoạt",
      purpose: "Xây hạ tầng mã QR định danh và luồng kích hoạt hồ sơ.",
      price: 55_000_000,
      effort: "1,0–1,4 MM",
      scope: [
        "Sinh và quản lý lô mã cá nhân hoặc doanh nghiệp, chống trùng.",
        "Xuất file in PDF cho nhà in.",
        "Quét mã, xác thực OTP qua Email hoặc Zalo và gắn mã với tài khoản.",
        "Điều hướng tới trang đích đang hoạt động của từng mã.",
      ],
      technologies: ["UUIDv7", "Nano ID", "BullMQ", "node-qrcode", "Cloudflare Workers", "OTP"],
      deliverable: "API, cơ sở dữ liệu QR, dịch vụ điều hướng và kích hoạt OTP.",
      acceptance: "Sinh 10.000 mã không trùng; kích hoạt gắn đúng tài khoản; mỗi mã mở đúng trang đang hoạt động.",
    },
    {
      id: "02",
      title: "Trình dựng hồ sơ và nhiều trang đích",
      purpose: "Cho phép người dùng tự dựng, xuất bản và thay đổi hồ sơ số.",
      price: 55_000_000,
      effort: "1,2–1,6 MM",
      scope: [
        "Page builder cơ bản cho text, ảnh, link, nút gọi, Zalo và bản đồ.",
        "Template theo ngành nghề để tạo hồ sơ nhanh.",
        "Tạo nhiều trang đích và chọn trang đang hoạt động cho cùng một mã.",
        "Trang hồ sơ SSR tối ưu mobile, hỗ trợ vCard và chống XSS.",
      ],
      technologies: ["Next.js SSR", "React Hook Form", "Zod", "DOMPurify", "Sharp"],
      deliverable: "Page builder, bộ template, quản lý trang đích và trang hồ sơ công khai.",
      acceptance: "Dựng và xuất bản được hồ sơ; đổi trang hoạt động có hiệu lực khi quét; trang tải tốt trên mobile.",
    },
    {
      id: "03",
      title: "Cổng doanh nghiệp",
      purpose: "Giúp doanh nghiệp đặt lô mã và quản lý hồ sơ công việc của nhân sự.",
      price: 35_000_000,
      effort: "0,8–1,0 MM",
      scope: [
        "Hồ sơ công việc gồm nhận diện công ty và thông tin cá nhân của nhân viên.",
        "Doanh nghiệp chọn template, logo, màu và thông tin dùng chung.",
        "Đặt lô, gán mã cho nhân sự, thu hồi hoặc hủy mã khi cần.",
        "Dashboard theo dõi nhân sự, mã, lượt quét và trạng thái.",
      ],
      technologies: ["NestJS", "Prisma", "PostgreSQL"],
      deliverable: "Portal doanh nghiệp, quản lý lô mã, hồ sơ công việc và dashboard.",
      acceptance: "Đặt lô, gán nhân sự, xem lượt quét và thu hồi mã theo đúng quyền doanh nghiệp.",
    },
    {
      id: "04",
      title: "Master admin MHG",
      purpose: "Cung cấp trung tâm kiểm soát toàn bộ hệ thống cho MHG.",
      price: 25_000_000,
      effort: "0,5–0,7 MM",
      scope: [
        "Sổ QR tổng cho mã, lô và doanh nghiệp.",
        "Theo dõi trạng thái kích hoạt và khóa mã.",
        "Quản lý tài khoản và quyền admin.",
      ],
      technologies: ["shadcn/ui", "Tailwind CSS", "TanStack Table"],
      deliverable: "Trang quản trị tổng dành cho đội vận hành MHG.",
      acceptance: "Tra cứu và quản lý được mã, lô, doanh nghiệp, trạng thái và quyền admin.",
    },
  ] satisfies WorkPackage[],
  milestones: [
    { id: "01", title: "Khởi động", note: "Hạ tầng, mô hình dữ liệu và luồng QR", duration: "Tuần 1–2", payment: 40 },
    { id: "02", title: "Go-live lõi", note: "Mã, kích hoạt và hồ sơ chạy thật", duration: "Tuần 3–4", payment: 40 },
    { id: "03", title: "Hoàn thiện", note: "Cổng doanh nghiệp, admin và bàn giao", duration: "Tuần 5–8", payment: 20 },
  ],
  outOfScope: [
    "Hạ tầng vận hành, CDN, tên miền và chi phí máy chủ.",
    "Phí Zalo ZNS, email số lượng lớn và dịch vụ bên thứ ba.",
    "VAT và chi phí điều phối hoặc thương mại ngoài phạm vi phát triển.",
    "Ứng dụng mobile, quảng cáo trang trung gian và phân quyền doanh nghiệp nâng cao.",
  ],
  assumptions: [
    "Khách hàng cung cấp nội dung, nhận diện và đầu mối duyệt đúng lịch.",
    "Tài khoản dịch vụ bên thứ ba do khách hàng sở hữu và thanh toán.",
    "Yêu cầu mới ngoài work package được đánh giá lại về giá và thời gian trước khi thực hiện.",
  ],
  handover: [
    "Source code và hướng dẫn chạy hệ thống.",
    "Cấu trúc cơ sở dữ liệu, tài liệu API và tài khoản triển khai thuộc phạm vi.",
    "Bảo hành sửa lỗi 1–2 tháng sau nghiệm thu.",
  ],
}

export function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value)
}
