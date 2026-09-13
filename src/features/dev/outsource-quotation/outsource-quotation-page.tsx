import { Check, Download } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  formatVnd,
  quotation,
  type WorkPackage,
} from "@/features/dev/outsource-quotation/outsource-quotation-data"
import {
  QuotationCostBreakdown,
  QuotationJourney,
  QuotationTimeline,
} from "@/features/dev/outsource-quotation/outsource-quotation-visuals"


const pdfPath = "/api/internal/quotation-pdf"

export default function OutsourceQuotationPage() {
  return (
    <div className="quotation-page min-h-dvh">
      <main className="quotation-shell">
        <ProposalHero />

        <Section id="objective" index="01" title="Bối cảnh và mục tiêu">
          <div className="quotation-objective-intro">
            <div className="quotation-scale-block">
              <p className="quotation-label">Quy mô hiện tại</p>
              <p className="quotation-scale-value">{quotation.objective.scale}</p>
              <p className="quotation-muted">{quotation.objective.scaleLabel}</p>
            </div>
            <div>
              <p className="quotation-lead">{quotation.objective.statement}</p>
              <p className="quotation-copy mt-6">{quotation.objective.supporting}</p>
            </div>
          </div>

          <Card className="quotation-journey-card quotation-print-avoid">
            <div className="quotation-journey-heading">
              <p className="quotation-label">Hành trình chính</p>
              <p className="quotation-journey-summary">
                Từ sản phẩm vật lý đến một hồ sơ số có thể quản trị.
              </p>
            </div>
            <QuotationJourney steps={quotation.objective.journeySteps} />
          </Card>

          <blockquote className="quotation-principle">
            <span>Nguyên tắc giải pháp</span>
            <p>{quotation.objective.principle}</p>
          </blockquote>
        </Section>

        <Section id="scope" index="02" title="Phạm vi và bàn giao">
          <div className="space-y-6">
            {quotation.workPackages.map((item) => (
              <WorkPackageBlock item={item} key={item.id} />
            ))}
          </div>
        </Section>

        <Section id="timeline" index="03" title="Kế hoạch triển khai">
          <QuotationTimeline milestones={quotation.milestones} />
        </Section>

        <Section id="pricing" index="04" title="Báo giá và thanh toán">
          <Card className="quotation-pricing-card quotation-print-avoid">
            <div className="quotation-pricing-summary">
              <div>
                <p className="quotation-label">Tổng chi phí phát triển</p>
                <p className="quotation-muted mt-3">Chưa gồm VAT</p>
              </div>
              <p className="quotation-total-price">{formatVnd(170_000_000)}</p>
              <p className="quotation-copy">
                Bốn work package độc lập, gắn trực tiếp với phạm vi và tiêu chí
                nghiệm thu.
              </p>
            </div>
            <QuotationCostBreakdown
              packages={quotation.workPackages}
              total={170_000_000}
            />
          </Card>
        </Section>

        <Section id="boundaries" index="05" title="Ranh giới thực hiện">
          <div className="quotation-paired-grid">
            <InfoList items={quotation.outOfScope} title="Không thuộc báo giá" />
            <InfoList items={quotation.assumptions} title="Giả định và phụ thuộc" />
          </div>
        </Section>

        <Section id="handover" index="06" title="Nghiệm thu và bàn giao">
          <div className="quotation-paired-grid">
            <InfoList items={quotation.handover} title="Hồ sơ bàn giao" />
            <InfoList
              items={[
                "Yêu cầu ngoài phạm vi được ghi nhận bằng văn bản.",
                "Tác động tới chi phí và timeline được đánh giá trước khi triển khai.",
                "Thay đổi chỉ được thực hiện sau khi hai bên thống nhất.",
              ]}
              title="Quản lý thay đổi"
            />
          </div>
        </Section>

        <ProposalFooter />
      </main>
    </div>
  )
}

function ProposalHero() {
  return (
    <header className="quotation-hero quotation-print-break-after">
      <div className="quotation-document-bar">
        <div>
          <Badge variant="gold">Đề xuất kỹ thuật và báo giá</Badge>
          <p className="quotation-document-meta">
            {quotation.meta.number} · Lập ngày {quotation.meta.issuedAt}
          </p>
        </div>
        <Button
          asChild
          className="quotation-hero-pdf-button quotation-print-hidden"
          size="lg"
        >
          <a download href={pdfPath}>
            <Download aria-hidden="true" />
            <span className="quotation-pdf-label">
              <span>Xuất </span>PDF
            </span>
          </a>
        </Button>
      </div>

      <div className="quotation-hero-copy">
        <h1>
          <span>{quotation.title}</span>
          <span>
            {quotation.headline} <em>{quotation.headlineAccent}</em>
          </span>
        </h1>
        <p>{quotation.summary}</p>
      </div>

      <dl className="quotation-metrics-grid">
        {quotation.metrics.map((metric) => (
          <Card className="quotation-metric" key={metric.label}>
            <dd>{metric.value}</dd>
            <dt>{metric.label}</dt>
          </Card>
        ))}
      </dl>
    </header>
  )
}

function Section({
  children,
  id,
  index,
  title,
}: {
  children: React.ReactNode
  id: string
  index: string
  title: string
}) {
  return (
    <section className="quotation-section quotation-print-break-after" id={id}>
      <div className="quotation-section-heading quotation-print-avoid">
        <span>{index}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  )
}

function WorkPackageBlock({ item }: { item: WorkPackage }) {
  return (
    <Card className="quotation-package quotation-print-avoid">
      <div className="quotation-package-header">
        <div>
          <p className="quotation-package-index">Package {item.id}</p>
          <h3>{item.title}</h3>
          <p className="quotation-copy mt-3">{item.purpose}</p>
        </div>
        <div className="quotation-package-price">
          <p>{formatVnd(item.price)}</p>
          <span>{item.effort}</span>
        </div>
      </div>

      <div className="quotation-package-body">
        <div>
          <p className="quotation-label">Phạm vi</p>
          <ul className="quotation-check-list">
            {item.scope.map((scope) => (
              <li key={scope}>
                <Check aria-hidden="true" />
                <span>{scope}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="quotation-package-definitions">
          <Definition label="Bàn giao" value={item.deliverable} />
          <Definition label="Nghiệm thu" value={item.acceptance} />
          <div>
            <p className="quotation-label">Công nghệ</p>
            <div className="quotation-tech-list">
              {item.technologies.map((technology) => (
                <Badge key={technology} variant="secondary">
                  {technology}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

function Definition({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="quotation-label">{label}</p>
      <p className="quotation-copy mt-2">{value}</p>
    </div>
  )
}

function InfoList({ items, title }: { items: string[]; title: string }) {
  return (
    <Card className="quotation-info-card quotation-print-avoid">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <span aria-hidden="true" />
            <p>{item}</p>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function ProposalFooter() {
  return (
    <footer className="quotation-footer quotation-print-avoid">
      <div>
        <p className="quotation-label">Bước tiếp theo</p>
        <h2>Sẵn sàng bắt đầu dự án.</h2>
        <p className="quotation-copy">
          Phạm vi chính thức được xác nhận trong buổi khởi động. Báo giá có hiệu
          lực trong {quotation.meta.validFor}.
        </p>
      </div>
      <div className="quotation-footer-action">
        <Button asChild className="quotation-print-hidden" size="lg">
          <a download href={pdfPath}>
            <Download aria-hidden="true" />
            Tải báo giá PDF
          </a>
        </Button>
        <p>{quotation.meta.number}</p>
      </div>
    </footer>
  )
}
