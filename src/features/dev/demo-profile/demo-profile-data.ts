import { Globe2, Link2, Mail, MessageCircle, Phone, Send } from "lucide-react"

export const profile = {
  name: "Nguyễn Minh Anh",
  role: "Nhà thiết kế sản phẩm",
  company: "Studio độc lập",
  bio: "Tôi thiết kế sản phẩm số, xây dựng trải nghiệm rõ ràng và biến ý tưởng thành những giải pháp có thể sử dụng trong thực tế.",
  location: "Việt Nam",
  phone: "+84 912 345 678",
  phoneHref: "tel:+84912345678",
  email: "hello@example.com",
  emailHref: "mailto:hello@example.com",
  website: "example.com/minh-anh",
  websiteHref: "https://example.com/minh-anh",
  image: "/images/demo-profile-nguyen-minh-anh.png",
  coverImage: "/images/demo-profile-qr-cover.png",
}

export const contactItems = [
  {
    icon: Phone,
    label: "Điện thoại",
    value: profile.phone,
    href: profile.phoneHref,
  },
  {
    icon: Mail,
    label: "Email",
    value: profile.email,
    href: profile.emailHref,
  },
  {
    icon: Globe2,
    label: "Website",
    value: profile.website,
    href: profile.websiteHref,
  },
]

export const socialItems = [
  {
    icon: MessageCircle,
    label: "Zalo",
    value: profile.phone,
    href: "https://zalo.me/84912345678",
  },
  {
    icon: Link2,
    label: "LinkedIn",
    value: "minhanh-profile",
    href: "https://www.linkedin.com/in/minhanh-profile",
  },
  {
    icon: Send,
    label: "Telegram",
    value: "@minhanh_profile",
    href: "https://t.me/minhanh_profile",
  },
]

const vCard = [
  "BEGIN:VCARD",
  "VERSION:3.0",
  "FN:Nguyễn Minh Anh",
  "ORG:Studio độc lập",
  "TITLE:Nhà thiết kế sản phẩm",
  "TEL;TYPE=CELL:+84912345678",
  "EMAIL:hello@example.com",
  "URL:https://example.com/minh-anh",
  "ADR:;;;;;;Việt Nam",
  "END:VCARD",
].join("\n")

export const vCardHref = `data:text/vcard;charset=utf-8,${encodeURIComponent(vCard)}`
