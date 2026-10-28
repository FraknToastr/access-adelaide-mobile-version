# Project UI rules

- Always wrap shell commands with `rtk`; see `/home/n0rt/.codex/RTK.md` and the user's tooling-discovery instructions.
- This is a mobile-only prototype. Keep all content within the app shell and verify narrow layouts at 320px and all supported text sizes.
- Never introduce native or custom dropdown selectors, including selects, datalists or popup comboboxes. Use visible native radio-card groups or inline drawers.
- Taxi and Phone configuration must open directly beneath the corresponding choice, using the shared drawer helper. Respect both app and device reduced-motion settings.
- App shortcuts show only icons in one row, with accessible names. They have no visible labels or headline.
- Main navigation always keeps Explore, Journey, Access and Help in a single row, including larger text, OpenDyslexic and reading spacing. Labels may wrap within their own buttons.
- The map canvas sits above its control panel. Do not overlay the panel over the canvas. The full legend expands in page flow and may resize the canvas; keep navigation reachable while it is open.
- App text sizes are 100%, 125% and 150%; 150% is the default and maximum. Migrate saved 200% preferences to 150%.
- Navigation disclosure arrows must use centered SVG icons, never text caret characters. Center icon/label content explicitly across browsers.
- The secret Demo only factory reset must preserve the map key and imagery configuration.
- Run `rtk proxy node scripts/check-ui-contracts.cjs` after UI changes, alongside relevant browser checks.
