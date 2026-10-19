# Project instructions

Read README.md, docs/README.md and relevant source before changes.

- Keep changes scoped; preserve unrelated work. Do not commit, push or deploy without explicit user authorization.
- Never commit credentials, environment files, database backups, customer documents, quotations or private drafts. .env.example contains names and placeholders only.
- Public source has a fresh history. Do not merge or push branches from the old private repository.
- Run focused tests, then typecheck, lint and build for shared contracts. UI changes require desktop/mobile browser verification and relevant interactions; report limits honestly.
- Use src/components/ui and src/app/globals.css as component/token authority. Catalogue: /_dev/design-system. Avoid needless abstractions.
- Preserve near-black, neutral and gold palette; shared controls, spacing, focus states and reduced-motion behavior. Use Be Vietnam Pro for UI/body and Playfair Display for display headings.
- Prefer Server Components. Read applicable installed Next.js documentation before changing framework behavior.
- Database migrations are separate from build. Integration tests use a dedicated test database; never seed production as verification.
- Update docs for durable behavior, setup, configuration or architecture changes.
