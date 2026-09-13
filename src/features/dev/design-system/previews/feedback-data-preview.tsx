import type { ReactNode } from "react"
import { AlertCircle, Check, Info } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const badgeVariants = ["default", "gold", "secondary", "destructive", "outline", "ghost", "link"] as const
const chartData = [{ month: "T5", total: 120 }, { month: "T6", total: 186 }, { month: "T7", total: 145 }, { month: "T8", total: 220 }]
const chartConfig = { total: { label: "Tổng", color: "var(--chart-1)" } }
const currencyFormatter = new Intl.NumberFormat("vi-VN", { currency: "VND", style: "currency" })

function showLoadingToast() {
  const toastId = toast.loading("Đang xử lý…")
  window.setTimeout(() => toast.dismiss(toastId), 3000)
}

const previews: Record<string, ReactNode> = {
  alert: <div className="grid w-full gap-3"><Alert><Info /><AlertTitle>Lưu ý</AlertTitle><AlertDescription>Thư viện component đã được cập nhật.</AlertDescription><AlertAction><Button size="xs" variant="secondary">Xem</Button></AlertAction></Alert><Alert variant="destructive"><AlertCircle /><AlertTitle>Có lỗi xảy ra</AlertTitle><AlertDescription>Kiểm tra lại dữ liệu đã nhập.</AlertDescription></Alert></div>,
  badge: <div className="flex flex-wrap gap-2">{badgeVariants.map((variant) => <Badge key={variant} variant={variant}>{variant}</Badge>)}</div>,
  avatar: <div className="flex flex-wrap items-center gap-5"><Avatar size="sm"><AvatarImage alt="Biểu trưng ứng dụng" src="/favicon.svg" /><AvatarFallback>SM</AvatarFallback></Avatar><Avatar><AvatarFallback>AV</AvatarFallback><AvatarBadge><Check /></AvatarBadge></Avatar><Avatar size="lg"><AvatarFallback>LG</AvatarFallback></Avatar><AvatarGroup><Avatar><AvatarFallback>A</AvatarFallback></Avatar><Avatar><AvatarFallback>B</AvatarFallback></Avatar><AvatarGroupCount>+3</AvatarGroupCount></AvatarGroup></div>,
  progress: <div className="grid w-full gap-4"><Progress aria-label="Tiến độ 0%" value={0} /><Progress aria-label="Tiến độ 48%" value={48} /><Progress aria-label="Tiến độ 100%" value={100} /></div>,
  table: <Table><TableCaption>Hóa đơn gần đây</TableCaption><TableHeader><TableRow><TableHead>Mã</TableHead><TableHead>Trạng thái</TableHead><TableHead className="text-right tabular-nums">Giá trị</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>HD-001</TableCell><TableCell>Đã trả</TableCell><TableCell className="text-right tabular-nums">{currencyFormatter.format(250000)}</TableCell></TableRow><TableRow data-state="selected"><TableCell>HD-002</TableCell><TableCell>Chờ xử lý</TableCell><TableCell className="text-right tabular-nums">{currencyFormatter.format(150000)}</TableCell></TableRow></TableBody><TableFooter><TableRow><TableCell colSpan={2}>Tổng</TableCell><TableCell className="text-right tabular-nums">{currencyFormatter.format(400000)}</TableCell></TableRow></TableFooter></Table>,
  chart: <ChartContainer className="max-h-52 w-full" config={chartConfig}><BarChart accessibilityLayer data={chartData}><CartesianGrid vertical={false} /><XAxis axisLine={false} dataKey="month" tickLine={false} /><ChartTooltip content={<ChartTooltipContent indicator="dot" />} /><ChartLegend content={<ChartLegendContent />} /><Bar dataKey="total" fill="var(--color-total)" radius={4} /></BarChart></ChartContainer>,
  sonner: <div className="flex flex-wrap gap-2"><Button onClick={() => toast("Thông báo mặc định")} size="sm" variant="secondary">Mặc định</Button><Button onClick={() => toast.success("Đã lưu")} size="sm" variant="secondary">Thành công</Button><Button onClick={() => toast.info("Có bản cập nhật")} size="sm" variant="secondary">Thông tin</Button><Button onClick={() => toast.warning("Sắp đầy dung lượng")} size="sm" variant="secondary">Cảnh báo</Button><Button onClick={() => toast.error("Không thể lưu. Kiểm tra kết nối và thử lại.")} size="sm" variant="secondary">Lỗi</Button><Button onClick={showLoadingToast} size="sm" variant="secondary">Đang tải</Button></div>,
}
export function FeedbackDataPreview({ file }: { file: string }) { return previews[file] ?? null }
