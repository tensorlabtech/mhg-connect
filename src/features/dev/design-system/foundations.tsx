const stack = [
  ["Thiết kế", "shadcn Nova"],
  ["Primitive", "Radix UI"],
  ["Styling", "Tailwind CSS v4"],
  ["Nội dung", "Be Vietnam Pro"],
  ["Tiêu đề", "Playfair Display"],
  ["Biểu tượng", "Lucide"],
  ["Chuyển động", "Motion"],
  ["Vector động", "Lottie"],
]

const colors = [
  ["Nền", "bg-background"],
  ["Bề mặt", "bg-card"],
  ["Tương tác", "bg-muted"],
  ["Chính · trắng", "bg-primary"],
  ["Điểm nhấn · gold", "bg-gold"],
  ["Thành công", "bg-success"],
  ["Thông tin", "bg-info"],
  ["Cảnh báo", "bg-warning"],
  ["Nguy hiểm", "bg-destructive"],
]

export function Foundations() {
  return (
    <section aria-labelledby="foundations-title" className="scroll-mt-24 pb-24 pt-16 lg:pb-32">
      <div className="grid gap-16 xl:grid-cols-[1.15fr_.85fr] xl:gap-24">
        <div>
          <h2 id="foundations-title" className="scroll-mt-24 font-heading text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Nền tảng</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
            Nền đen cố định, chữ trắng và bề mặt xám trung tính. Gold nguyên sắc chỉ xuất hiện khoảng 10% tần suất, dành cho focus và điểm nhấn quan trọng.
          </p>
          <dl className="mt-12 grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3">
            {stack.map(([term, value]) => (
              <div key={term}>
                <dt className="text-xs text-muted-foreground">{term}</dt>
                <dd className="mt-2 text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="grid content-start gap-16">
          <div>
            <h3 className="text-base font-medium">Màu ngữ nghĩa</h3>
            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3">
              {colors.map(([name, className]) => (
                <div key={name}>
                  <div className={`h-12 rounded-xl ${className}`} />
                  <p className="mt-2 text-xs text-muted-foreground">{name}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-base font-medium">Kiểu chữ</h3>
            <p className="mt-6 font-heading text-3xl font-semibold tracking-tight">Playfair Display cho tiêu đề</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Be Vietnam Pro cho nội dung, điều khiển và nhập liệu tiếng Việt.</p>
            <p className="mt-6 font-heading text-2xl italic text-gold">Điểm nhấn nghiêng có chủ đích</p>
          </div>
        </div>
      </div>
      <div className="mt-20 grid gap-x-12 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
        <TokenSpec title="Khoảng cách" values={["4", "8", "12", "16", "24", "32", "48", "64", "96"]} />
        <TokenSpec title="Control" values={["xs 32", "sm 36", "default 40", "lg 44"]} />
        <TokenSpec title="Bo góc" values={["control full", "overlay 20", "surface 24"]} />
        <TokenSpec title="Chuyển động" values={["100 ms", "200 ms", "300 ms"]} />
      </div>
    </section>
  )
}

function TokenSpec({ title, values }: { title: string; values: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="mt-3 text-xs leading-6 text-muted-foreground">{values.join(" · ")}</p>
    </div>
  )
}
