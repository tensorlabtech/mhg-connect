import { ArrowUpRight } from "lucide-react"

import { Card } from "@/components/ui/card"
import {
  contactItems,
  profile,
  socialItems,
} from "@/features/dev/demo-profile/demo-profile-data"

export function ProfileWorkCard() {
  return (
    <section className="profile-section">
      <h2>Công việc</h2>
      <Card className="profile-section-card profile-work-card">
        <div className="profile-work-feature">
          <div>
            <p>{profile.role}</p>
            <strong>{profile.company}</strong>
          </div>
          <dl>
            <div>
              <dt>Địa điểm</dt>
              <dd>{profile.location}</dd>
            </div>
          </dl>
        </div>
      </Card>
    </section>
  )
}

export function ProfileContactCard() {
  return (
    <section className="profile-section">
      <h2>Thông tin liên hệ</h2>
      <Card className="profile-section-card profile-contact-card">
        <div className="profile-directory-list">
          {contactItems.map(({ icon: Icon, label, value, href }) => (
            <a
              className="profile-directory-item"
              href={href}
              key={label}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              target={href.startsWith("http") ? "_blank" : undefined}
            >
              <Icon aria-hidden="true" className="profile-directory-leading-icon" />
              <span>{label}</span>
              <strong>{value}</strong>
              <ArrowUpRight aria-hidden="true" className="profile-directory-arrow" />
            </a>
          ))}
        </div>
      </Card>
    </section>
  )
}

export function ProfileSocialSection() {
  return (
    <section className="profile-section profile-social-section">
      <h2>Mạng xã hội</h2>
      <Card className="profile-section-card profile-social-card">
        <div className="profile-directory-list">
          {socialItems.map(({ icon: Icon, label, value, href }) => (
            <a
              className="profile-directory-item"
              href={href}
              key={label}
              rel="noreferrer"
              target="_blank"
            >
              <Icon aria-hidden="true" className="profile-directory-leading-icon" />
              <span>{label}</span>
              <strong>{value}</strong>
              <ArrowUpRight aria-hidden="true" className="profile-directory-arrow" />
            </a>
          ))}
        </div>
      </Card>
    </section>
  )
}
