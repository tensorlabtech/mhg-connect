import { useRef, type KeyboardEvent, type ReactNode } from "react"
import { Settings, Trash2 } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command"
import { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const sides = ["top", "right", "bottom", "left"] as const
const command = <Command><CommandInput aria-label="Tìm lệnh" placeholder="Nhập lệnh…" /><CommandList><CommandEmpty>Không có kết quả.</CommandEmpty><CommandGroup heading="Gợi ý"><CommandItem data-checked="true">Lịch</CommandItem><CommandItem>Tìm tệp <CommandShortcut>⌘F</CommandShortcut></CommandItem><CommandItem disabled>Tác vụ đã tắt</CommandItem></CommandGroup><CommandSeparator /><CommandGroup heading="Cài đặt"><CommandItem>Hồ sơ</CommandItem></CommandGroup></CommandList></Command>

function ContextMenuKeyboardPreview() {
  const triggerRef = useRef<HTMLDivElement>(null)

  const openFromKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!(event.key === "ContextMenu" || (event.shiftKey && event.key === "F10"))) return

    event.preventDefault()
    const rect = triggerRef.current?.getBoundingClientRect()
    triggerRef.current?.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        button: 2,
        clientX: rect ? rect.left + rect.width / 2 : 0,
        clientY: rect ? rect.top + rect.height / 2 : 0,
      })
    )
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger
        ref={triggerRef}
        className="grid h-28 w-full cursor-pointer place-items-center rounded-overlay bg-muted text-sm text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        onKeyDown={openFromKeyboard}
        tabIndex={0}
      >
        Nhấp chuột phải hoặc nhấn Shift+F10
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Quay lại <ContextMenuShortcut>⌘[</ContextMenuShortcut></ContextMenuItem>
        <ContextMenuCheckboxItem checked>Hiện dấu trang</ContextMenuCheckboxItem>
        <ContextMenuRadioGroup value="comfortable">
          <ContextMenuRadioItem value="compact">Gọn</ContextMenuRadioItem>
          <ContextMenuRadioItem value="comfortable">Thoải mái</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Thêm công cụ</ContextMenuSubTrigger>
          <ContextMenuSubContent><ContextMenuItem>Ghim vào thanh bên</ContextMenuItem></ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuItem disabled>Không khả dụng</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">Xóa</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

const previews: Record<string, ReactNode> = {
  dialog: <Dialog><DialogTrigger asChild><Button variant="outline">Mở dialog</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Sửa hồ sơ</DialogTitle><DialogDescription>Cập nhật thông tin công khai.</DialogDescription></DialogHeader><div className="rounded-overlay bg-muted p-8 text-center text-sm">Nội dung dialog</div><DialogFooter><Button>Lưu</Button></DialogFooter></DialogContent></Dialog>,
  "alert-dialog": <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive"><Trash2 />Xóa dự án</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Xóa dự án này?</AlertDialogTitle><AlertDialogDescription>Thao tác này không thể hoàn tác.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Hủy</AlertDialogCancel><AlertDialogAction>Tiếp tục</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>,
  drawer: <div className="flex flex-wrap gap-2">{sides.map((direction) => <Drawer direction={direction} key={direction}><DrawerTrigger asChild><Button size="sm" variant="outline">{direction}</Button></DrawerTrigger><DrawerContent><DrawerHeader><DrawerTitle>Drawer {direction}</DrawerTitle><DrawerDescription>Mở từ cạnh {direction}.</DrawerDescription></DrawerHeader><DrawerFooter><DrawerClose asChild><Button variant="outline">Đóng</Button></DrawerClose></DrawerFooter></DrawerContent></Drawer>)}</div>,
  sheet: <div className="flex flex-wrap gap-2">{sides.map((side) => <Sheet key={side}><SheetTrigger asChild><Button size="sm" variant="outline">{side}</Button></SheetTrigger><SheetContent side={side}><SheetHeader><SheetTitle>Sheet {side}</SheetTitle><SheetDescription>Nội dung gắn vào cạnh {side}.</SheetDescription></SheetHeader></SheetContent></Sheet>)}</div>,
  popover: <Popover><PopoverTrigger asChild><Button variant="outline">Mở popover</Button></PopoverTrigger><PopoverContent align="start"><PopoverHeader><PopoverTitle>Kích thước</PopoverTitle><PopoverDescription>Đặt kích thước cho lớp.</PopoverDescription></PopoverHeader></PopoverContent></Popover>,
  "hover-card": <HoverCard><HoverCardTrigger asChild><Button variant="link">@shadcn</Button></HoverCardTrigger><HoverCardContent><strong>shadcn/ui</strong><p className="mt-1 text-sm text-muted-foreground">Component có thể sao chép và sở hữu.</p></HoverCardContent></HoverCard>,
  tooltip: <div className="flex flex-wrap gap-2">{sides.map((side) => <Tooltip key={side}><TooltipTrigger asChild><Button size="sm" variant="outline">{side}</Button></TooltipTrigger><TooltipContent side={side}>Tooltip {side}</TooltipContent></Tooltip>)}</div>,
  "dropdown-menu": <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline"><Settings />Mở menu</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuLabel>Không gian làm việc</DropdownMenuLabel><DropdownMenuItem>Hồ sơ <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut></DropdownMenuItem><DropdownMenuCheckboxItem checked>Thông báo</DropdownMenuCheckboxItem><DropdownMenuRadioGroup value="comfortable"><DropdownMenuRadioItem value="compact">Gọn</DropdownMenuRadioItem><DropdownMenuRadioItem value="comfortable">Thoải mái</DropdownMenuRadioItem></DropdownMenuRadioGroup><DropdownMenuSub><DropdownMenuSubTrigger>Thêm công cụ</DropdownMenuSubTrigger><DropdownMenuSubContent><DropdownMenuItem>Ghim vào thanh bên</DropdownMenuItem></DropdownMenuSubContent></DropdownMenuSub><DropdownMenuItem disabled>Không khả dụng</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive">Xóa</DropdownMenuItem></DropdownMenuContent></DropdownMenu>,
  "context-menu": <ContextMenuKeyboardPreview />,
  command: <div className="w-full">{command}</div>,
}
export function OverlaysMenusPreview({ file }: { file: string }) { return previews[file] ?? null }
