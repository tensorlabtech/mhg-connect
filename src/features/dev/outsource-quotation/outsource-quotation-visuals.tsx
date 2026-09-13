import {
  IdCard,
  LayoutDashboard,
  QrCode,
  ScanLine,
  ShieldCheck,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import {
  formatVnd,
  type WorkPackage,
} from "@/features/dev/outsource-quotation/outsource-quotation-data"


const journeyIcons = [QrCode, ScanLine, ShieldCheck, IdCard, LayoutDashboard]

export function QuotationJourney({ steps }: { steps: string[] }) {
  return (
    <figure aria-label="Luồng từ sticker MHG đến hệ thống quản trị">
      <div className="quotation-journey-grid">
        {steps.map((step, index) => {
          const Icon = journeyIcons[index] ?? ShieldCheck

          return (
            <div className="quotation-journey-step" key={step}>
              <span className="quotation-journey-icon">
                <Icon aria-hidden="true" />
              </span>
              <span>{step}</span>
            </div>
          )
        })}
      </div>
      <figcaption className="sr-only">
        Sticker MHG được quét, kích hoạt, mở hồ sơ số và đi vào hệ thống quản
        trị.
      </figcaption>
    </figure>
  )
}

type Milestone = {
  id: string
  title: string
  note: string
  duration: string
  payment: number
}

export function QuotationTimeline({
  milestones,
}: {
  milestones: Milestone[]
}) {
  return (
    <figure aria-label="Kế hoạch triển khai theo từng giai đoạn">
      <div className="quotation-timeline-list">
        {milestones.map((milestone) => (
          <Card className="quotation-milestone quotation-print-avoid" key={milestone.id}>
            <div className="quotation-milestone-main">
              <div className="quotation-milestone-meta">
                <span>{milestone.id}</span>
                <p>{milestone.duration}</p>
              </div>
              <h3>{milestone.title}</h3>
              <p>{milestone.note}</p>
            </div>
            <div className="quotation-milestone-payment">
              <p>{milestone.payment}%</p>
              <span>Thanh toán theo mốc</span>
            </div>
          </Card>
        ))}
      </div>
      <figcaption className="sr-only">
        Ba giai đoạn nối tiếp từ tuần một đến tuần tám, thanh toán theo tỷ lệ 40,
        40 và 20 phần trăm.
      </figcaption>
    </figure>
  )
}

export function QuotationCostBreakdown({
  packages,
  total,
}: {
  packages: WorkPackage[]
  total: number
}) {
  return (
    <div className="quotation-cost-breakdown">
      <div>
        <p className="quotation-label">Phân bổ chi phí</p>
        <div
          aria-label="Tỷ trọng chi phí của bốn work package"
          className="quotation-allocation-bar"
          role="img"
        >
          {packages.map((item) => (
            <span
              className={`quotation-allocation-segment quotation-allocation-segment-${item.id}`}
              key={item.id}
            />
          ))}
        </div>
      </div>

      <div className="quotation-cost-list">
        {packages.map((item) => {
          const percentage = Math.round((item.price / total) * 100)

          return (
            <div
              className="quotation-cost-row"
              data-package={item.id}
              key={item.id}
            >
              <div className="quotation-cost-index">
                <span aria-hidden="true" className="quotation-cost-swatch" />
                {item.id}
              </div>
              <div className="quotation-cost-name">
                <p>{item.title}</p>
                <span>{item.effort}</span>
              </div>
              <p className="quotation-cost-percentage">{percentage}%</p>
              <p className="quotation-cost-price">{formatVnd(item.price)}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
