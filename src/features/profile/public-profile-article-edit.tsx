"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  ImagePlus,
  LoaderCircle,
  Plus,
  Trash2,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { getArticleBlock } from "@/features/profile/profile-article";
import { articleLimits } from "@/features/profile/profile-document-schema";
import type {
  ArticleImage,
  ArticleLinkKind,
  ArticleSection,
  ProfileDocument,
  ProfileLocale,
} from "@/features/profile/profile-document-types";
import { profileText } from "@/features/profile/profile-i18n";
import {
  AddButton,
  EditableRichBody,
  EditableRichInline,
  EditableText,
  EditTools,
  ToolButton,
  useInlineEdit,
} from "@/features/profile/profile-inline-edit";

const linkKinds: { id: ArticleLinkKind; label: string }[] = [
  { id: "news", label: "Báo" },
  { id: "article", label: "Bài viết" },
  { id: "video", label: "Video" },
  { id: "website", label: "Trang web" },
];

/** Hộp thông tin sửa tại chỗ: tên dòng, nội dung, xoá dòng, thêm dòng gợi ý. */
export function EditableFactsList({
  className,
  document,
}: {
  className: string;
  document: ProfileDocument;
}) {
  const api = useInlineEdit();
  const article = getArticleBlock(document);
  if (!article) return null;
  const facts = article.data.facts;
  const used = new Set(facts.map((fact) => fact.label.trim().toLowerCase()));
  return (
    <>
      {facts.length ? (
        <dl className={className} data-editing-facts>
          {facts.map((fact, index) => (
            <div className="contents" key={fact.id}>
              <EditableText
                as="dt"
                k={`fact.${fact.id}.label`}
                label={`Tên dòng ${index + 1}`}
                maxLength={60}
                placeholder="Tên dòng"
                readOnly={api.translating && !fact.label}
              />
              <dd className="profile-edit-fact-value">
                <EditableRichInline
                  k={`fact.${fact.id}.value`}
                  label={`Nội dung ${fact.label || `dòng ${index + 1}`}`}
                  placeholder={api.factHint(fact.label)}
                  referenceCount={article.data.references.length}
                />
                {api.translating ? null : (
                  <ToolButton
                    danger
                    icon={Trash2}
                    label={`Xoá dòng ${fact.label || index + 1}`}
                    onClick={() => api.removeFact(fact.id)}
                  />
                )}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {api.translating ? null : (
        <AddButton
          chips={api.suggestedFacts
            .filter((label) => !used.has(label.toLowerCase()))
            .slice(0, 3)
            .map((label) => ({ label, onClick: () => api.addFact(label) }))}
          disabled={facts.length >= articleLimits.facts}
          label="Thêm dòng"
          onClick={() => api.addFact()}
        />
      )}
    </>
  );
}

/** Bài viết kiểu Wikipedia sửa ngay trên trang, giữ đúng giao diện đang dùng. */
export function EditableArticleBlockView({
  document,
  isWikipedia,
  locale,
}: {
  document: ProfileDocument;
  isWikipedia: boolean;
  locale: ProfileLocale;
}) {
  const api = useInlineEdit();
  const block = getArticleBlock(document);
  if (!block) return null;
  if (!block.visible)
    return (
      <HiddenBlockBar
        label="Bài viết"
        onShow={() => api.setBlockVisible("article", true)}
      />
    );
  const { references, sections } = block.data;
  const links = block.data.links ?? [];
  const referenceCount = references.length;
  const usedHeadings = new Set(
    sections.map((section) => section.heading.trim()),
  );

  return (
    <div className="profile-article" data-profile-section="article">
      {!isWikipedia ? (
        <section
          className="profile-section"
          data-profile-section="facts"
          id="profile-facts"
        >
          <h2>{profileText(locale, "facts")}</h2>
          <Card className="profile-section-card profile-facts-card">
            <EditableFactsList
              className="profile-facts-list"
              document={document}
            />
          </Card>
        </section>
      ) : null}

      {sections.length >= 3 ? (
        <nav
          aria-label={profileText(locale, "contents")}
          className="profile-article-toc"
        >
          <strong>{profileText(locale, "contents")}</strong>
          <ol>
            {sections.map((section, index) => (
              <li key={section.id}>
                <span>
                  <span className="profile-article-toc-number">
                    {index + 1}
                  </span>
                  {api.read(`section.${section.id}.heading`).value ||
                    section.heading ||
                    "Mục chưa đặt tên"}
                </span>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      {sections.map((section, index) => (
        <EditableSection
          index={index}
          key={section.id}
          length={sections.length}
          referenceCount={referenceCount}
          section={section}
        />
      ))}

      {api.translating ? null : (
        <AddButton
          chips={api.suggestedSections
            .filter((heading) => !usedHeadings.has(heading))
            .slice(0, 4)
            .map((heading) => ({
              label: heading,
              onClick: () => api.addSection(null, heading),
            }))}
          disabled={sections.length >= articleLimits.sections}
          label="Thêm mục"
          onClick={() => api.addSection(null)}
        />
      )}

      <section
        className="profile-section profile-article-section"
        data-profile-section="references"
        id="profile-references"
      >
        <h2>{profileText(locale, "references")}</h2>
        {references.length ? (
          <ol className="profile-references">
            {references.map((reference, index) => (
              <li
                className="profile-edit-row"
                id={`profile-ref-${index + 1}`}
                key={reference.id}
              >
                <EditableText
                  className="profile-reference-title"
                  k={`ref.${reference.id}.title`}
                  label={`Tiêu đề nguồn ${index + 1}`}
                  placeholder="Tiêu đề bài báo, trang web"
                />
                {". "}
                <EditableText
                  as="em"
                  k={`ref.${reference.id}.source`}
                  label={`Tên báo ${index + 1}`}
                  maxLength={120}
                  placeholder="Tên báo"
                />
                {". "}
                <EditableText
                  k={`ref.${reference.id}.date`}
                  label={`Ngày ${index + 1}`}
                  maxLength={40}
                  placeholder="Ngày"
                  readOnly={api.translating}
                />
                <span className="profile-edit-url">
                  <EditableText
                    k={`ref.${reference.id}.url`}
                    label={`Đường dẫn nguồn ${index + 1}`}
                    maxLength={600}
                    placeholder="https://… (đường dẫn bài)"
                    readOnly={api.translating}
                  />
                </span>
                {api.translating ? null : (
                  <EditTools className="is-inline" label={`Nguồn ${index + 1}`}>
                    <ToolButton
                      danger
                      icon={Trash2}
                      label={`Xoá nguồn ${index + 1}`}
                      onClick={() => api.removeReference(reference.id)}
                    />
                  </EditTools>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="profile-edit-note">
            Bài báo, trang web làm dẫn chứng. Gõ [1], [2]… trong nội dung để trỏ
            tới nguồn.
          </p>
        )}
        {api.translating ? null : (
          <AddButton
            disabled={references.length >= articleLimits.references}
            label="Thêm nguồn"
            onClick={api.addReference}
          />
        )}
      </section>

      <section
        className="profile-section profile-article-section"
        data-profile-section="external-links"
        id="profile-external-links"
      >
        <h2>{profileText(locale, "externalLinks")}</h2>
        {links.length ? (
          <ul className="profile-external-links">
            {links.map((link, index) => (
              <li className="profile-edit-row" key={link.id}>
                <button
                  className="profile-external-kind profile-edit-kind"
                  disabled={api.translating || api.disabled}
                  onClick={(event) => {
                    event.stopPropagation();
                    const next =
                      linkKinds[
                        (linkKinds.findIndex((kind) => kind.id === link.kind) +
                          1) %
                          linkKinds.length
                      ];
                    api.setLinkKind(link.id, next.id);
                  }}
                  title="Bấm để đổi loại: Báo, Bài viết, Video, Trang web"
                  type="button"
                >
                  {linkKinds.find((kind) => kind.id === link.kind)?.label}
                </button>
                <span className="min-w-0">
                  <EditableText
                    className="profile-rich-link"
                    k={`link.${link.id}.title`}
                    label={`Tiêu đề liên kết ${index + 1}`}
                    placeholder="Tiêu đề bài báo hoặc video"
                  />
                  {" — "}
                  <EditableText
                    as="em"
                    k={`link.${link.id}.source`}
                    label={`Nguồn liên kết ${index + 1}`}
                    maxLength={120}
                    placeholder="Tên báo, kênh"
                  />
                  <span className="profile-edit-url">
                    <EditableText
                      k={`link.${link.id}.url`}
                      label={`Đường dẫn liên kết ${index + 1}`}
                      maxLength={600}
                      placeholder="https://… (link YouTube sẽ phát ngay trên trang)"
                      readOnly={api.translating}
                    />
                  </span>
                </span>
                {api.translating ? null : (
                  <EditTools
                    className="is-inline"
                    label={`Liên kết ${index + 1}`}
                  >
                    <ToolButton
                      danger
                      icon={Trash2}
                      label={`Xoá liên kết ${index + 1}`}
                      onClick={() => api.removeLink(link.id)}
                    />
                  </EditTools>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="profile-edit-note">
            Báo, bài viết, video nói về bạn. Link YouTube sẽ phát ngay trên
            trang.
          </p>
        )}
        {api.translating ? null : (
          <AddButton
            chips={[{ label: "Video", onClick: () => api.addLink("video") }]}
            disabled={links.length >= articleLimits.links}
            label="Thêm liên kết"
            onClick={() => api.addLink("news")}
          />
        )}
      </section>
    </div>
  );
}

function EditableSection({
  index,
  length,
  referenceCount,
  section,
}: {
  index: number;
  length: number;
  referenceCount: number;
  section: ArticleSection;
}) {
  const api = useInlineEdit();
  const sideImages = section.images.filter((image) => image.align !== "center");
  const centerImages = section.images.filter(
    (image) => image.align === "center",
  );
  const filled = Boolean(section.body.trim() || section.images.length);
  return (
    <section
      className="profile-section profile-article-section profile-edit-item"
      data-empty={!filled || undefined}
      data-profile-section="article-section"
      id={`profile-section-${section.id}`}
    >
      {api.translating ? null : (
        <EditTools label={`Công cụ mục ${index + 1}`}>
          <ToolButton
            disabled={index === 0}
            icon={ArrowUp}
            label="Đưa mục lên"
            onClick={() => api.moveSection(section.id, -1)}
          />
          <ToolButton
            disabled={index === length - 1}
            icon={ArrowDown}
            label="Đưa mục xuống"
            onClick={() => api.moveSection(section.id, 1)}
          />
          <ToolButton
            disabled={section.images.length >= articleLimits.imagesPerSection}
            icon={ImagePlus}
            label="Thêm ảnh vào mục"
            onClick={() => api.addImage(section.id)}
          />
          <ToolButton
            disabled={length >= articleLimits.sections}
            icon={Plus}
            label="Thêm mục bên dưới"
            onClick={() => api.addSection(section.id)}
          />
          <ToolButton
            disabled={length >= articleLimits.sections}
            icon={Copy}
            label="Nhân bản mục"
            onClick={() => api.duplicateSection(section.id)}
          />
          <ToolButton
            danger
            icon={Trash2}
            label="Xoá mục (bấm Hoàn tác nếu xoá nhầm)"
            onClick={() => api.removeSection(section.id)}
          />
        </EditTools>
      )}
      <EditableText
        as="h2"
        k={`section.${section.id}.heading`}
        label={`Tiêu đề mục ${index + 1}`}
        maxLength={120}
        placeholder="Tiêu đề mục"
      />
      <div className="profile-article-body">
        {sideImages.map((image) => (
          <EditableFigure image={image} key={image.id} sectionId={section.id} />
        ))}
        <EditableRichBody
          k={`section.${section.id}.body`}
          placeholder={api.sectionHint(section.heading)}
          referenceCount={referenceCount}
        />
        {centerImages.map((image) => (
          <EditableFigure image={image} key={image.id} sectionId={section.id} />
        ))}
        {api.uploadingSectionId === section.id ? (
          <p className="profile-edit-note">
            <LoaderCircle
              aria-hidden="true"
              className="inline size-4 animate-spin"
            />{" "}
            Đang tải ảnh lên…
          </p>
        ) : null}
      </div>
      {!filled ? (
        <p className="profile-edit-note">
          Mục chưa có nội dung nên khách chưa thấy.
        </p>
      ) : null}
    </section>
  );
}

function EditableFigure({
  image,
  sectionId,
}: {
  image: ArticleImage;
  sectionId: string;
}) {
  const api = useInlineEdit();
  return (
    <figure
      className="profile-article-figure profile-edit-item"
      data-align={image.align}
    >
      {api.translating ? null : (
        <EditTools label="Công cụ ảnh">
          <ToolButton
            icon={AlignLeft}
            label="Ảnh bên trái"
            onClick={() => api.setImageAlign(sectionId, image.id, "left")}
            pressed={image.align === "left"}
          />
          <ToolButton
            icon={AlignCenter}
            label="Ảnh ở giữa"
            onClick={() => api.setImageAlign(sectionId, image.id, "center")}
            pressed={image.align === "center"}
          />
          <ToolButton
            icon={AlignRight}
            label="Ảnh bên phải"
            onClick={() => api.setImageAlign(sectionId, image.id, "right")}
            pressed={image.align === "right"}
          />
          <ToolButton
            danger
            icon={Trash2}
            label="Xoá ảnh"
            onClick={() => api.removeImage(sectionId, image.id)}
          />
        </EditTools>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={image.caption ?? ""} decoding="async" src={image.url} />
      <EditableText
        as="figcaption"
        className="profile-edit-caption"
        k={`image.${image.id}.caption`}
        label="Chú thích ảnh"
        placeholder="Thêm chú thích ảnh"
      />
    </figure>
  );
}

/** Phần đang ẩn: hiện một dải mờ để bật lại, khách không thấy. */
export function HiddenBlockBar({
  label,
  onShow,
}: {
  label: string;
  onShow: () => void;
}) {
  const api = useInlineEdit();
  return (
    <div
      className="profile-edit-hidden"
      onClick={(event) => event.stopPropagation()}
    >
      <EyeOff aria-hidden="true" />
      <span>{label} đang ẩn với khách</span>
      <button disabled={api.disabled} onClick={onShow} type="button">
        <Eye aria-hidden="true" /> Hiện lại
      </button>
    </div>
  );
}

const blockLabels = {
  article: "Bài viết",
  bio: "Giới thiệu",
  contact: "Liên hệ",
  social: "Mạng xã hội",
} as const;

/** Dải "đang ẩn" cho một phần bất kỳ, tự lấy thao tác từ trình sửa. */
export function HiddenBlockBarFor({
  type,
}: {
  type: "article" | "bio" | "contact" | "social";
}) {
  const api = useInlineEdit();
  return (
    <HiddenBlockBar
      label={blockLabels[type]}
      onShow={() => api.setBlockVisible(type, true)}
    />
  );
}

/** Nút ẩn một phần (giới thiệu, liên hệ, mạng xã hội) đặt ở góc phần đó. */
export function BlockVisibilityTools({
  label,
  type,
}: {
  label: string;
  type: "article" | "bio" | "contact" | "social";
}) {
  const api = useInlineEdit();
  if (api.translating) return null;
  return (
    <EditTools label={`Công cụ ${label}`}>
      <ToolButton
        icon={EyeOff}
        label={`Ẩn ${label} với khách`}
        onClick={() => api.setBlockVisible(type, false)}
      />
    </EditTools>
  );
}
