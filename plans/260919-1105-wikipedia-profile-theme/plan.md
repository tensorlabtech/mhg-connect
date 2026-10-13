---
title: "Bách khoa Profile Theme"
description: "Use Vietnamese Wikipedia only as an editorial layout reference for an MHG Connect-owned profile theme."
status: complete
priority: P1
effort: "small"
tags: [feature, frontend, ui-ux, profile]
blockedBy: []
blocks: []
created: 2026-09-19
---

# Bách khoa Profile Theme

## Outcome

Convert the pending `archive-editorial` theme into an MHG Connect theme named **Bách khoa**. Use the supplied Vietnamese Wikipedia screenshot and [Tô Lâm reference page](https://vi.wikipedia.org/wiki/T%C3%B4_L%C3%A2m) only for visual structure: white article canvas, editorial typography, blue links, article title/tool strip, lead copy, right infobox, ruled sections and compact key–value rows. Remove both reference sidebars and do not reproduce Wikipedia branding or unsupported controls.

## Constraints

- Use the current structured profile only. No invented biography, dates, offices, citations, badges, statistics or links.
- All visible theme naming is `Bách khoa`; retain the internal `wikipedia` style id only as an implementation detail to avoid another persisted-value migration.
- Keep real profile actions: `Lưu liên hệ`, conditional `Gọi`, `Chia sẻ`. Do not render fake search, account, donation, language or edit controls.
- Preserve block visibility/order, Builder preview/edit behavior, real link targets, keyboard focus, and the shared public-profile renderer.
- Bách khoa styling is theme-scoped. Do not change global MHG tokens or redesign other themes.

## Non-goals

- Recreating Wikipedia branding, search, account links, language controls, editing, citations or article data.
- Adding new profile fields, changing the document schema beyond the theme-id rename/compatibility alias, or changing QR/auth flows.
- Keeping archive/editorial ornamentation that conflicts with the screenshot.

## Exact Layout Mapping

| Reference region           | Existing profile data / behavior                                                                                                                                                                                                          |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Top structure              | Start with the compact profile shortcut row and the person's article title. No platform masthead, Wikipedia wordmark, search, account or language controls.                                                                               |
| Article title + lower rule | `identity.name` as the single `h1`; compact `Hồ sơ` tab/label.                                                                                                                                                                            |
| Lead/byline                | Visible `identity.title` and `identity.company`; show separator only when both exist.                                                                                                                                                     |
| Lead article copy          | Visible `bio.text` as normal readable prose below the title band. Omit the whole lead section when absent.                                                                                                                                |
| Right infobox              | Derived title/company heading, `avatarUrl` image (derived initials fallback only when useful), visible `location`, then visible contact fields (`phone`, `contactEmail`, `website`) as compact labeled rows. No empty row or media frame. |
| Article sections           | Preserve visible block order after identity. Contact fields already placed in the infobox are not duplicated. Social data becomes a `Liên kết ngoài` section using the existing platform labels and real URLs.                            |
| Link language              | Existing actionable URLs use Wikipedia blue, underline on hover/focus, and keep current external-link behavior. Plain values remain plain text.                                                                                           |
| Attribution                | A quiet `Powered by MHG Connect` line at the page footer, outside the profile's primary hierarchy.                                                                                                                                        |

## Responsive Contract

- **Desktop ≥1024px:** centered article shell; main prose column plus a fixed-but-bounded ~18rem infobox; no left/right sidebar columns.
- **Tablet 768–1023px:** retain two columns with a narrower infobox only while prose remains readable; masthead/actions wrap without overlap.
- **Mobile <768px and Builder preview container:** single column; title first, infobox next, then bio/remaining sections. Actions wrap to full-width rows; long email/URL/social values wrap; no horizontal scroll.
- Complete and sparse profiles must remain balanced. Missing avatar, bio, title, company, location, contact or social data removes its region, row, divider and gap cleanly.

## Implementation Surface

- Rename/refactor `src/features/profile/public-profile-archive-chrome.tsx` and `src/features/profile/public-profile-archive-style.css` to Wikipedia-owned equivalents.
- Update theme registration/import/render selectors in `src/app/layout.tsx`, `src/features/profile/profile-document-types.ts`, `src/features/profile/profile-style-packs.ts`, and `src/features/profile/public-profile.tsx`.
- Rename/update `public/images/profile-style-thumbnails/archive-editorial.svg` to show the approved Wikipedia structure.
- Update focused assertions in `src/features/profile/public-profile.test.tsx` and `src/features/profile/profile-builder-inspector.test.tsx`.

## Phase

| Phase                                                                                   | Status   |
| --------------------------------------------------------------------------------------- | -------- |
| [Implement and visually verify the Bách khoa theme](./phase-01-implement-and-verify.md) | Complete |

## Acceptance Evidence

- Focused render tests prove theme id/name, visible-field omission, real links, action presence, and no duplicated contact content.
- Typecheck/lint and focused profile tests pass without weakening existing assertions.
- Desktop, tablet, mobile and constrained Builder-preview screenshots use a complete profile and at least two sparse variants.
- Side-by-side comparison against the supplied screenshot verifies masthead proportions, title/tool rule, type hierarchy, blue links, prose/infobox relationship, row density and borders.
- Full-page interaction pass verifies hover/focus, action wrapping, external links, long values, no clipped focus ring and no horizontal overflow.

## Unresolved Questions

None.

<!-- slug: wikipedia-profile-theme -->
