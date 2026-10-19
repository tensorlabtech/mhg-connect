"use client";

import {
  ArrowUpRight,
  Download,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Share2,
} from "lucide-react";
import { motion, MotionConfig, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { LiquidGlass } from "simple-liquid-glass";
import { LiquidGlassInteractive } from "simple-liquid-glass/interactive";
import { useState } from "react";

import styles from "./liquid-glass-profile-prototype.module.css";

export type LiquidProfilePrototypeVariant = "full" | "no-media" | "sparse";

type SocialItem = {
  href: string;
  iconPath: string;
  label: string;
  value: string;
};

export type LiquidProfilePrototypeData = {
  avatarUrl: string | null;
  bio: string | null;
  company: string | null;
  contactEmail: string | null;
  coverUrl: string | null;
  location: string | null;
  name: string;
  phone: string | null;
  socials: SocialItem[];
  title: string | null;
  website: string | null;
};

const glassProps = {
  aberrationIntensity: 0.06,
  autodetectquality: true,
  backdropSelector: "#liquid-profile-backdrop",
  border: 0.08,
  borderColor: "rgba(255, 255, 255, 0.48)",
  glassColor: "rgba(248, 250, 255, 0.18)",
  lensProfile: "material" as const,
  material: "clear" as const,
  mirror: true,
  mirrorScale: 18,
  radius: 999,
  refraction: "lens" as const,
  saturation: 112,
};

export function LiquidGlassProfilePrototype({
  data,
  variant,
}: {
  data: LiquidProfilePrototypeData;
  variant: LiquidProfilePrototypeVariant;
}) {
  const { scrollY } = useScroll();
  const compactOpacity = useTransform(scrollY, [160, 280], [0, 1]);
  const compactY = useTransform(scrollY, [160, 280], [-24, 0]);
  const [shareStatus, setShareStatus] = useState("");
  const contactItems = [
    data.phone
      ? {
          href: `tel:${data.phone.replace(/\s/g, "")}`,
          icon: Phone,
          label: "Điện thoại",
          value: data.phone,
        }
      : null,
    data.contactEmail
      ? {
          href: `mailto:${data.contactEmail}`,
          icon: Mail,
          label: "Email",
          value: data.contactEmail,
        }
      : null,
    data.website
      ? {
          href: data.website,
          icon: Globe2,
          label: "Website",
          value: data.website.replace(/^https?:\/\//, ""),
        }
      : null,
  ].filter(Boolean) as Array<{
    href: string;
    icon: typeof Phone;
    label: string;
    value: string;
  }>;

  async function shareProfile() {
    try {
      if (navigator.share) {
        await navigator.share({ title: data.name, url: window.location.href });
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      setShareStatus("Đã sao chép liên kết");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareStatus("Chưa thể chia sẻ liên kết");
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className={styles.page}>
        <div
          aria-hidden="true"
          className={styles.backdrop}
          id="liquid-profile-backdrop"
        >
          {data.coverUrl ? (
            <Image
              alt=""
              className={styles.backdropImage}
              fill
              priority
              sizes="100vw"
              src={data.coverUrl}
            />
          ) : null}
          <span className={styles.lightField} />
        </div>

        <nav
          aria-label="Chế độ dữ liệu prototype"
          className={styles.variantNav}
        >
          {(["full", "sparse", "no-media"] as const).map((item) => (
            <Link
              aria-current={variant === item ? "page" : undefined}
              className={styles.variantLink}
              href={`/_dev/liquid-glass-profile?variant=${item}`}
              key={item}
            >
              {item === "full"
                ? "Đầy đủ"
                : item === "sparse"
                  ? "Ít dữ liệu"
                  : "Không ảnh"}
            </Link>
          ))}
        </nav>

        <motion.div
          aria-hidden="true"
          className={styles.compactHeader}
          style={{ opacity: compactOpacity, y: compactY }}
        >
          <LiquidGlass {...glassProps} className={styles.compactGlass}>
            <div className={styles.compactContent}>
              <Avatar data={data} small />
              <span>{data.name}</span>
              <Share2 aria-hidden="true" />
            </div>
          </LiquidGlass>
        </motion.div>

        <main className={styles.shell}>
          <header className={styles.hero}>
            <div className={styles.identity}>
              <Avatar data={data} />
              <div className={styles.identityCopy}>
                <h1>{data.name}</h1>
                {data.title || data.company ? (
                  <p className={styles.byline}>
                    {data.title ? <span>{data.title}</span> : null}
                    {data.title && data.company ? (
                      <span aria-hidden="true">·</span>
                    ) : null}
                    {data.company ? <strong>{data.company}</strong> : null}
                  </p>
                ) : null}
                {data.location ? (
                  <p className={styles.location}>
                    <MapPin aria-hidden="true" /> {data.location}
                  </p>
                ) : null}
              </div>
            </div>
            <ProfileActions
              data={data}
              onShare={shareProfile}
              shareStatus={shareStatus}
            />
          </header>

          <div className={styles.content}>
            {data.bio ? (
              <section className={styles.bioSection}>
                <h2>Giới thiệu</h2>
                <p>{data.bio}</p>
              </section>
            ) : null}

            {contactItems.length ? (
              <section className={styles.directorySection}>
                <h2>Thông tin liên hệ</h2>
                <div className={styles.directoryList}>
                  {contactItems.map(({ href, icon: Icon, label, value }) => (
                    <a className={styles.directoryItem} href={href} key={label}>
                      <Icon aria-hidden="true" />
                      <span>{label}</span>
                      <strong>{value}</strong>
                      <ArrowUpRight aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

            {data.socials.length ? (
              <section className={styles.directorySection}>
                <h2>Mạng xã hội</h2>
                <div className={styles.socialGrid}>
                  {data.socials.map((item) => (
                    <a
                      className={styles.socialItem}
                      href={item.href}
                      key={item.label}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <span
                        aria-hidden="true"
                        className={styles.socialIcon}
                        style={{
                          WebkitMaskImage: `url(${item.iconPath})`,
                          maskImage: `url(${item.iconPath})`,
                        }}
                      />
                      <span>
                        <small>{item.label}</small>
                        <strong>{item.value}</strong>
                      </span>
                      <ArrowUpRight aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </main>
      </div>
    </MotionConfig>
  );
}

function Avatar({
  data,
  small = false,
}: {
  data: LiquidProfilePrototypeData;
  small?: boolean;
}) {
  return (
    <div className={small ? styles.avatarSmall : styles.avatar}>
      {data.avatarUrl ? (
        <Image
          alt={`Chân dung ${data.name}`}
          fill
          priority={!small}
          sizes={small ? "40px" : "(max-width: 640px) 112px, 144px"}
          src={data.avatarUrl}
        />
      ) : (
        <span>{initials(data.name)}</span>
      )}
    </div>
  );
}

function ProfileActions({
  data,
  onShare,
  shareStatus,
}: {
  data: LiquidProfilePrototypeData;
  onShare: () => void;
  shareStatus: string;
}) {
  const vCard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${data.name}`,
    data.company ? `ORG:${data.company}` : null,
    data.title ? `TITLE:${data.title}` : null,
    data.phone ? `TEL;TYPE=CELL:${data.phone.replace(/\s/g, "")}` : null,
    data.contactEmail ? `EMAIL:${data.contactEmail}` : null,
    data.website ? `URL:${data.website}` : null,
    data.location ? `ADR:;;;;;;${data.location}` : null,
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\n");
  const vCardHref = `data:text/vcard;charset=utf-8,${encodeURIComponent(vCard)}`;

  return (
    <div className={styles.actions}>
      <LiquidAction label="Lưu liên hệ">
        <a download={`${data.name}.vcf`} href={vCardHref}>
          <Download aria-hidden="true" />
          <span>Lưu liên hệ</span>
        </a>
      </LiquidAction>
      {data.phone ? (
        <LiquidAction label="Gọi">
          <a href={`tel:${data.phone.replace(/\s/g, "")}`}>
            <Phone aria-hidden="true" />
            <span>Gọi</span>
          </a>
        </LiquidAction>
      ) : null}
      <LiquidAction label="Chia sẻ">
        <button onClick={onShare} type="button">
          <Share2 aria-hidden="true" />
          <span>Chia sẻ</span>
        </button>
      </LiquidAction>
      <span aria-live="polite" className={styles.srOnly}>
        {shareStatus}
      </span>
    </div>
  );
}

function LiquidAction({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <LiquidGlassInteractive
      {...glassProps}
      aria-label={label}
      className={styles.actionGlass}
      clickRipple="ripple"
      elasticity={0.08}
      followPointer
      liquid="flow"
      liquidTrigger="hover"
      maxShift={4}
      specular
    >
      {children}
    </LiquidGlassInteractive>
  );
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
