import type { ReactNode } from "react"
import { ChevronDown, Inbox, Settings } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button, IconButton } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DirectionProvider } from "@/components/ui/direction"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const itemVariants = ["default", "outline", "muted"] as const
const previews: Record<string, ReactNode> = {
  accordion: <Accordion className="w-full" collapsible defaultValue="item-1" type="single"><AccordionItem value="item-1"><AccordionTrigger>Có hỗ trợ truy cập không?</AccordionTrigger><AccordionContent>Có. Điều hướng bàn phím và trình đọc màn hình được tích hợp.</AccordionContent></AccordionItem><AccordionItem value="item-2"><AccordionTrigger>Có chuyển động không?</AccordionTrigger><AccordionContent>Trạng thái mở và đóng có phản hồi trực quan.</AccordionContent></AccordionItem></Accordion>,
  "aspect-ratio": <div className="grid w-full grid-cols-3 gap-3"><AspectRatio className="grid place-items-center rounded-overlay bg-muted text-xs" ratio={1}>1:1</AspectRatio><AspectRatio className="grid place-items-center rounded-overlay bg-muted text-xs" ratio={4 / 3}>4:3</AspectRatio><AspectRatio className="grid place-items-center rounded-overlay bg-muted text-xs" ratio={16 / 9}>16:9</AspectRatio></div>,
  card: <div className="grid w-full gap-3 sm:grid-cols-2"><Card><CardHeader><CardTitle>Thẻ mặc định</CardTitle><CardDescription>Cấu trúc đầy đủ</CardDescription><CardAction><IconButton size="icon-sm" tooltip="Cài đặt thẻ" variant="ghost"><Settings /></IconButton></CardAction></CardHeader><CardContent>Nội dung thẻ</CardContent><CardFooter>Chân thẻ</CardFooter></Card><Card size="sm"><CardHeader><CardTitle>Thẻ nhỏ</CardTitle><CardDescription>Mật độ gọn</CardDescription></CardHeader><CardContent>Nội dung thẻ</CardContent></Card></div>,
  item: <div className="grid w-full gap-2">{itemVariants.map((variant) => <Item key={variant} variant={variant}><ItemMedia variant="icon"><Settings /></ItemMedia><ItemContent><ItemTitle>{variant}</ItemTitle><ItemDescription>Nội dung danh sách tái sử dụng</ItemDescription></ItemContent></Item>)}</div>,
  separator: <div className="flex h-12 items-center gap-4"><span>Trái</span><Separator orientation="vertical" /><span>Giữa</span><Separator orientation="vertical" /><span>Phải</span></div>,
  resizable: <ResizablePanelGroup className="h-32 w-full overflow-hidden rounded-overlay bg-background" orientation="horizontal"><ResizablePanel className="grid place-items-center" defaultSize={40}>Một</ResizablePanel><ResizableHandle withHandle /><ResizablePanel className="grid place-items-center" defaultSize={60}>Hai</ResizablePanel></ResizablePanelGroup>,
  "scroll-area": <ScrollArea className="h-32 w-full rounded-overlay bg-background"><div className="w-[640px] space-y-2 p-4">{Array.from({ length: 8 }, (_, index) => <p key={index}>Hàng cuộn {index + 1}, nội dung ngang và dọc.</p>)}</div><ScrollBar orientation="horizontal" /></ScrollArea>,
  collapsible: <Collapsible className="w-full" defaultOpen><div className="flex items-center justify-between"><strong>Ba mục đã lưu</strong><Tooltip><TooltipTrigger asChild><CollapsibleTrigger asChild><Button aria-label="Đóng hoặc mở danh sách" size="icon-sm" variant="ghost"><ChevronDown aria-hidden="true" /></Button></CollapsibleTrigger></TooltipTrigger><TooltipContent>Đóng hoặc mở danh sách</TooltipContent></Tooltip></div><CollapsibleContent className="mt-3 rounded-overlay bg-muted/50 p-3 text-sm text-muted-foreground">Nội dung có thể thu gọn hoặc mở rộng.</CollapsibleContent></Collapsible>,
  empty: <Empty className="min-h-44 bg-muted/30"><EmptyHeader><EmptyMedia variant="icon"><Inbox /></EmptyMedia><EmptyTitle>Chưa có dự án</EmptyTitle><EmptyDescription>Tạo dự án để bắt đầu sắp xếp công việc.</EmptyDescription></EmptyHeader><EmptyContent><Button size="sm">Tạo dự án</Button></EmptyContent></Empty>,
  skeleton: <div className="flex w-full items-center gap-4"><Skeleton className="size-12 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /></div></div>,
  spinner: <div className="flex items-center gap-5"><Spinner className="size-4" /><Spinner className="size-6 text-primary" /><Button disabled><Spinner /> Đang tải</Button></div>,
  direction: <div className="grid w-full grid-cols-2 gap-3"><DirectionProvider dir="ltr"><div className="rounded-overlay bg-muted/50 p-3 text-sm">LTR: trái sang phải</div></DirectionProvider><DirectionProvider dir="rtl"><div className="rounded-overlay bg-muted/50 p-3 text-sm">RTL: phải sang trái</div></DirectionProvider></div>,
}
export function LayoutContentPreview({ file }: { file: string }) { return previews[file] ?? null }
