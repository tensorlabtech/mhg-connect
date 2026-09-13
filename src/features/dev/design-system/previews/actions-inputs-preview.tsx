import type { ReactNode } from "react"
import { ArrowDown, ArrowUp, Search, Star } from "lucide-react"
import { Button, IconButton } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxLabel, ComboboxList, ComboboxSeparator, ComboboxValue, useComboboxAnchor } from "@/components/ui/combobox"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { FileInput, Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Toggle } from "@/components/ui/toggle"
import { Questionnaire, QuestionnaireActions, QuestionnaireChoice, QuestionnaireChoices, QuestionnaireDescription, QuestionnaireItem, QuestionnaireNext, QuestionnaireProgress, QuestionnaireSubmit, QuestionnaireTitle } from "@/components/ui/questionnaire"

const frameworks = ["React", "Vue", "Svelte"]
const buttonVariants = ["default", "outline", "secondary", "ghost", "destructive", "link"] as const
const buttonSizes = ["xs", "sm", "default", "lg", "icon-xs", "icon-sm", "icon", "icon-lg"] as const

function ComboboxChipsDemo() {
  const anchor = useComboboxAnchor()

  return (
    <Combobox defaultValue={["React", "Vue"]} items={frameworks} multiple>
      <ComboboxChips ref={anchor}>
        <ComboboxValue>
          {(values: string[]) => values.map((value) => <ComboboxChip key={value}>{value}</ComboboxChip>)}
        </ComboboxValue>
        <ComboboxChipsInput aria-label="Chọn nhiều framework" placeholder="Thêm framework…" />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>Không có kết quả.</ComboboxEmpty>
        <ComboboxList>{frameworks.map((item) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>)}</ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

function QuestionnaireDemo() {
  const items = [{ name: "priority", required: true, prompt: "Ưu tiên chính là gì?", choices: [{ value: "clarity", label: "Rõ ràng" }, { value: "speed", label: "Nhanh" }] }]
  return (
    <Questionnaire items={items} onSubmit={(event) => event.preventDefault()}>
      <QuestionnaireProgress />
      <QuestionnaireItem name="priority" required>
        <QuestionnaireTitle>Ưu tiên chính là gì?</QuestionnaireTitle>
        <QuestionnaireDescription>Chọn một phương án để tiếp tục.</QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="clarity">Rõ ràng</QuestionnaireChoice>
          <QuestionnaireChoice value="speed">Nhanh</QuestionnaireChoice>
        </QuestionnaireChoices>
      </QuestionnaireItem>
      <QuestionnaireActions><QuestionnaireNext /><QuestionnaireSubmit>Gửi</QuestionnaireSubmit></QuestionnaireActions>
    </Questionnaire>
  )
}

const previews: Record<string, ReactNode> = {
  button: <div className="grid gap-3"><div className="flex flex-wrap gap-2">{buttonVariants.map((variant) => <Button key={variant} variant={variant}>{variant}</Button>)}</div><div className="flex flex-wrap items-center gap-2">{buttonSizes.map((size) => size.startsWith("icon") ? <IconButton key={size} size={size} tooltip={`Button ${size}`} variant="outline"><Star aria-hidden="true" /></IconButton> : <Button key={size} size={size} variant="outline">{size}</Button>)}</div></div>,
  "button-group": <div className="flex items-start gap-6"><ButtonGroup><Button variant="outline">Trước</Button><Button>Tiếp</Button></ButtonGroup><ButtonGroup aria-label="Sắp xếp thứ tự" orientation="vertical"><IconButton size="icon" tooltip="Di chuyển lên" variant="outline"><ArrowUp /></IconButton><IconButton size="icon" tooltip="Di chuyển xuống" variant="outline"><ArrowDown /></IconButton></ButtonGroup></div>,
  toggle: <div className="flex flex-wrap gap-2"><Toggle aria-label="Bật yêu thích"><Star /> Mặc định</Toggle><Toggle aria-label="Bật viền" variant="outline">Có viền</Toggle><Toggle aria-label="Cỡ nhỏ" size="sm">Nhỏ</Toggle><Toggle aria-label="Cỡ lớn" size="lg">Lớn</Toggle></div>,
  "toggle-group": <div className="grid gap-2"><ToggleGroup defaultValue="center" type="single"><ToggleGroupItem value="left">Trái</ToggleGroupItem><ToggleGroupItem value="center">Giữa</ToggleGroupItem><ToggleGroupItem value="right">Phải</ToggleGroupItem></ToggleGroup><ToggleGroup defaultValue={["bold"]} type="multiple" variant="outline"><ToggleGroupItem value="bold">Đậm</ToggleGroupItem><ToggleGroupItem value="italic">Nghiêng</ToggleGroupItem></ToggleGroup></div>,
  input: <div className="grid w-full gap-2 sm:grid-cols-2"><Input aria-label="Trường nhập cỡ nhỏ nhất" autoComplete="off" name="input-xs" placeholder="xs · 32px" size="xs" /><Input aria-label="Trường nhập cỡ nhỏ" autoComplete="off" name="input-sm" placeholder="sm · 36px" size="sm" /><Input aria-label="Trường nhập mặc định" autoComplete="off" name="input-default" placeholder="default · 40px" /><Input aria-label="Trường nhập cỡ lớn" autoComplete="off" name="input-lg" placeholder="lg · 44px" size="lg" /><Input aria-label="Trường nhập đã tắt" autoComplete="off" disabled name="input-disabled" placeholder="Đã tắt…" /><Input aria-label="Trường nhập không hợp lệ" aria-invalid="true" autoComplete="off" defaultValue="Dữ liệu lỗi" name="input-invalid" /><FileInput aria-label="Tải tệp lên" className="sm:col-span-2" name="input-file" /></div>,
  "input-group": <div className="grid w-full gap-2"><InputGroup><InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon><InputGroupInput aria-label="Tìm kiếm" autoComplete="off" name="input-group-search" placeholder="Tìm kiếm…" /></InputGroup><InputGroup><InputGroupInput aria-label="Tên miền" autoComplete="off" name="input-group-domain" placeholder="tên-miền…" /><InputGroupAddon align="inline-end"><InputGroupText>.com</InputGroupText></InputGroupAddon></InputGroup></div>,
  textarea: <div className="grid w-full gap-2"><Textarea aria-label="Nội dung mặc định" autoComplete="off" name="textarea-default" placeholder="Nhập nội dung…" /><Textarea aria-label="Nội dung đã tắt" autoComplete="off" disabled name="textarea-disabled" placeholder="Đã tắt…" /><Textarea aria-label="Nội dung không hợp lệ" aria-invalid="true" autoComplete="off" defaultValue="Nội dung lỗi" name="textarea-invalid" /></div>,
  "input-otp": <InputOTP aria-label="Mã xác thực gồm 6 chữ số" autoComplete="one-time-code" maxLength={6} name="input-otp"><InputOTPGroup>{[0, 1, 2].map((index) => <InputOTPSlot index={index} key={index} />)}</InputOTPGroup><InputOTPSeparator /><InputOTPGroup>{[3, 4, 5].map((index) => <InputOTPSlot index={index} key={index} />)}</InputOTPGroup></InputOTP>,
  checkbox: <div className="flex flex-wrap gap-5"><Label><Checkbox /> Chưa chọn</Label><Label><Checkbox defaultChecked /> Đã chọn</Label><Label><Checkbox disabled /> Đã tắt</Label></div>,
  "radio-group": <RadioGroup className="flex gap-4" defaultValue="one"><Label><RadioGroupItem value="one" /> Một</Label><Label><RadioGroupItem value="two" /> Hai</Label><Label><RadioGroupItem disabled value="three" /> Đã tắt</Label></RadioGroup>,
  switch: <div className="flex flex-wrap gap-5"><Label><Switch /> Tắt</Label><Label><Switch defaultChecked /> Bật</Label><Label><Switch disabled /> Khóa</Label></div>,
  slider: <div className="grid w-full gap-5"><Slider aria-label="Giá trị đơn" defaultValue={[45]} /><Slider aria-label="Khoảng giá trị" defaultValue={[25, 75]} /><Slider aria-label="Giá trị đã tắt" defaultValue={[60]} disabled /></div>,
  select: <div className="flex flex-wrap items-center gap-2"><Select><SelectTrigger aria-label="Chọn framework" size="xs"><SelectValue placeholder="xs · 32px" /></SelectTrigger><SelectContent><SelectGroup><SelectLabel>Framework</SelectLabel>{frameworks.map((item) => <SelectItem key={item} value={item.toLowerCase()}>{item}</SelectItem>)}</SelectGroup><SelectSeparator /><SelectItem disabled value="disabled">Không khả dụng</SelectItem></SelectContent></Select>{(["sm", "default", "lg"] as const).map((size) => <Select key={size}><SelectTrigger aria-label={`Select ${size}`} size={size}><SelectValue placeholder={`${size} · ${size === "sm" ? 36 : size === "lg" ? 44 : 40}px`} /></SelectTrigger><SelectContent><SelectItem value={size}>{size}</SelectItem></SelectContent></Select>)}</div>,
  "native-select": <div className="flex flex-wrap items-center gap-2">{(["xs", "sm", "default", "lg"] as const).map((size) => <NativeSelect aria-label={`Native select ${size}`} key={size} name={`native-${size}`} size={size}><NativeSelectOption>{size}</NativeSelectOption></NativeSelect>)}</div>,
  combobox: <div className="grid w-full gap-2 sm:grid-cols-2"><Combobox items={frameworks}><ComboboxInput aria-label="Chọn framework" placeholder="Chọn framework…" showClear /><ComboboxContent><ComboboxEmpty>Không có kết quả.</ComboboxEmpty><ComboboxList><ComboboxGroup><ComboboxLabel>Framework</ComboboxLabel>{frameworks.map((item) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>)}</ComboboxGroup><ComboboxSeparator /><ComboboxItem disabled value="disabled">Không khả dụng</ComboboxItem></ComboboxList></ComboboxContent></Combobox><Combobox items={[]}><ComboboxInput aria-label="Combobox trống" placeholder="Thử trạng thái trống…" size="lg" /><ComboboxContent><ComboboxEmpty>Không có kết quả.</ComboboxEmpty><ComboboxList /></ComboboxContent></Combobox><div className="sm:col-span-2"><ComboboxChipsDemo /></div></div>,
  calendar: <Calendar className="rounded-overlay bg-background" defaultMonth={new Date(2026, 8)} mode="single" selected={new Date(2026, 8, 9)} />,
  field: <Field className="w-full"><FieldLabel htmlFor="preview-email">Email</FieldLabel><Input autoComplete="email" id="preview-email" name="preview-email" placeholder="hello@example.com…" spellCheck={false} type="email" /><FieldDescription>Địa chỉ dùng để nhận thông báo.</FieldDescription></Field>,
  label: <div className="grid w-full max-w-64 gap-2"><Label htmlFor="label-demo">Tên dự án</Label><Input autoComplete="off" id="label-demo" name="project-name" /></div>,
  questionnaire: <QuestionnaireDemo />,
}

export function ActionsInputsPreview({ file }: { file: string }) { return previews[file] ?? null }
