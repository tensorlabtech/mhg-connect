export type CatalogueComponent = {
  name: string
  file: string
  variants: string[]
}

export type CatalogueGroup = {
  id: string
  label: string
  description: string
  components: CatalogueComponent[]
}

export const componentGroups: CatalogueGroup[] = [
  {
    id: "actions-inputs",
    label: "Thao tác và nhập liệu",
    description: "Điều khiển, biểu mẫu và luồng thu thập dữ liệu có cấu trúc.",
    components: [
      { name: "Button", file: "button", variants: ["variant: default, outline, secondary, ghost, destructive, link", "size: xs 32, sm 36, default 40, lg 44", "icon: xs 32, sm 36, default 40, lg 44"] },
      { name: "Button Group", file: "button-group", variants: ["orientation: horizontal, vertical", "separator, text"] },
      { name: "Toggle", file: "toggle", variants: ["variant: default, outline", "size: default, sm, lg"] },
      { name: "Toggle Group", file: "toggle-group", variants: ["variant: default, outline", "size: default, sm, lg", "type: single, multiple", "orientation: horizontal, vertical"] },
      { name: "Input", file: "input", variants: ["size: xs 32, sm 36, default 40, lg 44", "default, disabled, invalid, file"] },
      { name: "Input Group", file: "input-group", variants: ["size: xs 32, sm 36, default 40, lg 44", "addon: inline-start, inline-end, block-start, block-end", "button: xs, sm, icon-xs, icon-sm", "input, textarea"] },
      { name: "Textarea", file: "textarea", variants: ["default, disabled, invalid"] },
      { name: "Input OTP", file: "input-otp", variants: ["group, slot, separator"] },
      { name: "Checkbox", file: "checkbox", variants: ["unchecked, checked, disabled, invalid"] },
      { name: "Radio Group", file: "radio-group", variants: ["unchecked, checked, disabled, invalid"] },
      { name: "Switch", file: "switch", variants: ["size: default, sm", "off, on, disabled"] },
      { name: "Slider", file: "slider", variants: ["single, range, disabled", "orientation: horizontal, vertical"] },
      { name: "Select", file: "select", variants: ["size: xs 32, sm 36, default 40, lg 44", "group, label, separator, scroll buttons"] },
      { name: "Native Select", file: "native-select", variants: ["size: xs 32, sm 36, default 40, lg 44", "option, optgroup, disabled"] },
      { name: "Combobox", file: "combobox", variants: ["input size: xs 32, sm 36, default 40, lg 44", "single, multiple with chips", "group, empty, separator, clear"] },
      { name: "Calendar", file: "calendar", variants: ["mode: single, multiple, range", "buttonVariant: ghost, outline"] },
      { name: "Field", file: "field", variants: ["orientation: vertical, horizontal, responsive", "legend: legend, label", "description, error, separator"] },
      { name: "Label", file: "label", variants: ["default, disabled peer"] },
      { name: "Questionnaire", file: "questionnaire", variants: ["choice: radio, checkbox", "input, progress, error", "previous, skip, next, submit"] },
    ],
  },
  {
    id: "layout-content",
    label: "Bố cục và nội dung",
    description: "Khối cấu trúc để nhóm, định cỡ và sắp xếp nội dung.",
    components: [
      { name: "Accordion", file: "accordion", variants: ["type: single, multiple", "collapsible, disabled"] },
      { name: "Aspect Ratio", file: "aspect-ratio", variants: ["1:1, 4:3, 16:9"] },
      { name: "Card", file: "card", variants: ["size: default, sm", "header, action, content, footer"] },
      { name: "Item", file: "item", variants: ["variant: default, outline, muted", "size: default, sm, xs", "media: default, icon, image"] },
      { name: "Separator", file: "separator", variants: ["orientation: horizontal, vertical", "decorative: true, false"] },
      { name: "Resizable", file: "resizable", variants: ["orientation: horizontal, vertical", "handle, handle with grip"] },
      { name: "Scroll Area", file: "scroll-area", variants: ["scrollbar: vertical, horizontal"] },
      { name: "Collapsible", file: "collapsible", variants: ["closed, open, disabled"] },
      { name: "Empty", file: "empty", variants: ["media: default, icon", "with action, without action"] },
      { name: "Skeleton", file: "skeleton", variants: ["text, avatar, card"] },
      { name: "Spinner", file: "spinner", variants: ["inherits size and color"] },
      { name: "Direction", file: "direction", variants: ["dir: ltr, rtl"] },
    ],
  },
  {
    id: "navigation",
    label: "Điều hướng",
    description: "Mẫu tìm đường, phân trang và điều hướng không gian làm việc.",
    components: [
      { name: "Breadcrumb", file: "breadcrumb", variants: ["link, page, separator, ellipsis"] },
      { name: "Tabs", file: "tabs", variants: ["variant: default, line", "orientation: horizontal, vertical"] },
      { name: "Navigation Menu", file: "navigation-menu", variants: ["trigger, content, link, indicator, viewport"] },
      { name: "Menubar", file: "menubar", variants: ["item: default, destructive", "checkbox, radio, sub menu, shortcut"] },
      { name: "Pagination", file: "pagination", variants: ["previous, page, active, ellipsis, next", "link size: default, xs, sm, lg, icon, icon-xs, icon-sm, icon-lg"] },
      { name: "Sidebar", file: "sidebar", variants: ["side: left, right", "variant: sidebar, floating, inset", "collapsible: offcanvas, icon, none", "menu button: default, outline; size: default, sm, lg", "sub button size: md, sm"] },
      { name: "Carousel", file: "carousel", variants: ["orientation: horizontal, vertical", "previous, next"] },
    ],
  },
  {
    id: "overlays-menus",
    label: "Lớp nổi và menu",
    description: "Tương tác phân lớp, menu và vùng tập trung theo ngữ cảnh.",
    components: [
      { name: "Dialog", file: "dialog", variants: ["closed, open", "header, footer, close"] },
      { name: "Alert Dialog", file: "alert-dialog", variants: ["content size: default, sm", "closed, open", "cancel, action: all button variants and sizes"] },
      { name: "Drawer", file: "drawer", variants: ["direction: top, right, bottom, left"] },
      { name: "Sheet", file: "sheet", variants: ["side: top, right, bottom, left"] },
      { name: "Popover", file: "popover", variants: ["side, align, anchor", "header, title, description"] },
      { name: "Hover Card", file: "hover-card", variants: ["open delay, close delay", "side, align"] },
      { name: "Tooltip", file: "tooltip", variants: ["side: top, right, bottom, left"] },
      { name: "Dropdown Menu", file: "dropdown-menu", variants: ["item, checkbox, radio, sub menu, destructive, shortcut"] },
      { name: "Context Menu", file: "context-menu", variants: ["item, checkbox, radio, sub menu, destructive, shortcut"] },
      { name: "Command", file: "command", variants: ["inline, dialog", "group, item, empty, separator, shortcut"] },
    ],
  },
  {
    id: "feedback-data",
    label: "Phản hồi và dữ liệu",
    description: "Trạng thái hệ thống, trực quan dữ liệu và nội dung dạng bảng.",
    components: [
      { name: "Alert", file: "alert", variants: ["variant: default, destructive", "action, icon"] },
      { name: "Badge", file: "badge", variants: ["default, gold, secondary, destructive, outline, ghost, link"] },
      { name: "Avatar", file: "avatar", variants: ["size: sm, default, lg", "image, fallback, badge, group, group count"] },
      { name: "Progress", file: "progress", variants: ["0%, determinate, complete"] },
      { name: "Table", file: "table", variants: ["header, body, footer, caption", "selected row"] },
      { name: "Chart", file: "chart", variants: ["tooltip: label; indicator: dot, line, dashed", "legend, style"] },
      { name: "Sonner", file: "sonner", variants: ["default, success, info, warning, error, loading"] },
    ],
  },
  {
    id: "messaging-files",
    label: "Tin nhắn và tệp",
    description: "Khối hội thoại, phản hồi AI và tệp đính kèm.",
    components: [
      { name: "Attachment", file: "attachment", variants: ["size: default, sm, xs", "orientation: horizontal, vertical", "state: idle, uploading, processing, done, error", "media: icon, image"] },
      { name: "Bubble", file: "bubble", variants: ["default, secondary, muted, tinted, outline, ghost, destructive", "align: start, end", "reactions: top, bottom; start, end"] },
      { name: "Message", file: "message", variants: ["align: start, end", "avatar, header, content, footer"] },
      { name: "Message Scroller", file: "message-scroller", variants: ["button direction: start, end", "autoscroll, scroll anchor"] },
      { name: "Marker", file: "marker", variants: ["default, separator, border", "icon, content"] },
      { name: "Kbd", file: "kbd", variants: ["single, group"] },
    ],
  },
  {
    id: "utilities",
    label: "Tiện ích",
    description: "Hook hạ tầng phục vụ hành vi responsive của component.",
    components: [
      { name: "Use Mobile", file: "use-mobile", variants: ["hook: useIsMobile", "breakpoint: dưới 768px"] },
    ],
  },
]

export const componentCount = componentGroups
  .filter((group) => group.id !== "utilities")
  .reduce((total, group) => total + group.components.length,
  0
)

export const utilityCount = 1
