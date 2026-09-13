# MHG Connect UX refinement

Status: Complete

## Outcome

Make the current demo coherent enough for a customer walkthrough: QR activation includes authentication in context, profile editing is result-first and stable, demo media choices are explicit, and admin access never looks like a broken route.

## Constraints

- Preserve the existing dark / white / gold design language and shared UI components.
- Keep email/password authentication and Vercel-compatible infrastructure.
- Reuse `PublicProfile` for preview and public output.
- Do not introduce a page-builder data model in this pass.

## Non-goals

- Inline content editing on the public profile.
- Arbitrary cover upload, crop tools, block ordering, or drag-and-drop.
- Production deployment or provisioning external services.

## Phases

1. Auth and activation: tabbed login/register, password visibility, stronger activation composition, safe admin return.
2. Profile editor: result-first layout, grouped editing, shared controls, placeholders, stable preview.
3. Demo media and templates: selectable local presets, persisted cover, meaningful Cover/Minimal layouts.
4. Verification: migration, tests, build, desktop/mobile interaction QA on real routes.

## Acceptance criteria

- Anonymous `/q/DEMO-NEW` exposes Login/Register tabs without leaving QR context.
- Password and confirmation fields support visibility toggle and placeholders.
- Profile preview remains legible in its container on desktop and mobile.
- No visible native checkbox/radio remains in the touched flows.
- Avatar destination and demo-only cover behavior are explained in-product.
- Cover and Minimal templates are visibly distinct.
- Regular user visiting `/admin` sees a permission explanation; admin login returns to `/admin`.
- Local migration, focused tests, typecheck, lint, build, and visual QA pass.

## Rollback

Schema change is additive (`cover_url` nullable). UI files can be reverted independently; existing profiles continue using the default cover.

## Verification

- Spec compliance: all nine requested issue groups implemented without introducing a page-builder schema.
- Edge-case review: hidden-tab validation, Blob orphan cleanup, and stale file/preset conflicts found and fixed.
- Code review: no Critical or Important findings remain.
- Unit: 5/5 passed. Integration: 5/5 passed.
- Typecheck and production build passed. Lint has 0 errors and 3 unrelated existing warnings.
- Browser QA covered anonymous auth tabs, password visibility controls, result-first editor, media dialog, both templates, regular-user admin denial, and real admin return flow.
