# AGENTS.md

## Project expectations

- Build a polished, desktop-first, top-down 2D educational game in TypeScript.
- Prioritize playability, readability, and maintainability.
- Keep the French content natural, grammatical, and B1-appropriate.
- Avoid quiz-like UX; embed language inside action and mission flow.
- Do not create giant monolithic files.
- Separate engine code from pedagogical content.

## Engineering rules

- Prefer Vite + TypeScript + Phaser 3 unless a clearly better alternative is justified in PLAN.md.
- Keep content in dedicated files under `src/content/`.
- Use reusable systems for missions, interactions, dialogue choices, objectives, and save state.
- Run lint, typecheck, and tests before concluding.
- Document architecture and run instructions.

## Language rules

- Default to standard French.
- Wrong answers must be wrong for a clear reason.
- Avoid ambiguous or absurd phrasing.
- Keep explanations short and useful.

## Done means

- The game runs locally.
- The build passes.
- Several missions are playable end-to-end.
- Save/progression works.
- README and architecture notes are present.