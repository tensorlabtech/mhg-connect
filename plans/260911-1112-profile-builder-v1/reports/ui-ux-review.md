# Profile Builder V1 — UI/UX review

## Outcome

The accepted V1 uses a constrained professional-builder model rather than a long settings form: one shared Canvas, a contextual Inspector, and an Outline Sheet. It keeps the dark/white/gold system, uses whitespace for grouping, and avoids a permanent third column or nested-card shell.

## Locked decisions

- Exactly four blocks: Identity, Bio, Contact, Social.
- Identity is required and locked first; the other blocks can be hidden and reordered.
- The old implicit `Công việc` section is folded into Identity so outline and output order cannot disagree.
- Block selection works from Canvas and Outline; selected state uses a restrained gold hairline plus a text label.
- Outline supports vertical drag, 44px handles, explicit Up/Down controls, focus retention, and a polite Vietnamese position announcement.
- Desktop uses Canvas + Inspector; Outline is a Sheet. Mobile uses Preview/Edit modes and retains touch-accessible Undo/Redo.
- History covers document changes only. Autosave and published server metadata do not create undo entries.
- Empty hidden blocks remain discoverable as editor-only placeholders and disappear from public output.

## Acceptance evidence

- Desktop Builder inspected with toolbar, mobile/desktop preview, selectable Canvas and contextual Inspector.
- Outline drag and explicit reorder controls both changed the shared renderer order.
- 375px Builder exposed Preview/Edit modes, Outline Sheet, Undo/Redo, and no horizontal overflow.
- Public QR used the same renderer but omitted editor affordances and hidden blocks.

## Remaining future-builder boundaries

Add/Duplicate/Delete, repeatable blocks, nesting, free positioning, resize, custom CSS, rich text, media crop, and collaboration stay outside V1. They require stronger block identity, migration, validation, and conflict semantics before exposure.
