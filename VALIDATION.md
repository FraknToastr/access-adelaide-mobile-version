# Standalone distribution validation — 2026-10-28

The generated downloads contain the current separate-source updates, including inline Journey selection, Travel Mode labels, optional tool shortcuts when skipping setup, Reset Demo and the 100%/125% Dyslexic scale.

- `standalone/Access_Adelaide.html`: 2,731,001 bytes. `standalone/Access_Adelaide.zip`: 890,542 bytes. The ZIP contains exactly one member, `Access_Adelaide.html`, identical to the generated HTML.
- `rtk proxy node scripts/build-standalone.cjs --check` passes: source hashes, compact graph, generated HTML, deterministic ZIP and inline-script syntax are current.
- `scripts/test-standalone.cjs` passes after extracting the ZIP into an otherwise empty temporary folder. External requests are blocked; no local sidecar file is requested. Embedded shortcut logos load, font metrics are available, licences are present, a map-selected journey calculates 774 m, the phone-settings choice adds no tools, Travel Mode labels are current and Reset Demo retains the map key.
- The full routing browser and Dyslexic scale suites pass against the extracted HTML, served through an entry-only HTTP fixture and directly through file:// where applicable. Coverage includes setup, saved journeys, map/GPS selection, cancellation, Explore state, font migration, narrow layouts and offline operation.
- The routing engine's 9 test groups, UI contracts and whitespace checks pass. Runtime files are embedded without CDN dependencies; online basemap imagery and explicitly opened external links retain their network requirements. The build uses only Node and Python standard libraries.

Browser evidence remains Firefox headless with actual 2D rendering. Previous MapLibre lifecycle checks use a test double; this is not a live WebGL or physical iPhone/Android accessibility certification. See the earlier sections for source topology and accessibility limitations.

---

# Dyslexic text scale validation — 2026-10-28

These checks were recorded before generating the standalone distribution.

- `scripts/test-dyslexic-scale-browser.cjs` passes in Firefox using the embedded OpenDyslexic fonts. It checks enabling from 100%/125%/150%, preserving 100%, capping larger values at 125%, two-step cycling and labels throughout setup, and restoring normal font choices without increasing the selected size.
- Access and Text & contrast hide and disable 150% and label 125% as largest. Presets, Seeing suggestions, remembered settings and remembered support profiles cannot restore Dyslexic 150%; migrated sizes persist across reloads.
- At 320/390/412 px, both Dyslexic sizes pass landing, Journey map, toolbar/navigation, dialog and icon containment checks with dark contrast, reading spacing and reduced motion. Dyslexic 125% uses the largest-text layouts; Journey's Move Map control spans a full row to keep its label readable.
- Syntax, UI contracts and whitespace checks pass. Browser zoom remains independent of the app's two Dyslexic sizes. Physical phone assistive-technology testing is not claimed.

---

# Inline Journey map validation — 2026-10-28

These checks describe the inline-map source update included in the standalone distribution.

- Updated Firefox integration tests pass for inline map ownership, unchanged Journey URL, one reused map instance, both choices above the map, confirmation controls below the canvas, and Locate me inside the map only for start selection.
- GPS success remains provisional until confirmed. Denial and stale success callbacks after switching endpoint, panning, cancelling and navigation are handled. Collapsed summaries, cancelled edits, old saved coordinate journeys, legacy illustrative saves, calculated downloads and out-of-coverage failures pass.
- Explore's previous map/list choice, mock markers, Large Map/Legend, setup, navigation disclosure and Help communication card pass regression checks.
- Layout checks cover 320/390/412 px at 100%/125%/150% text with dark contrast and reduced motion. Offline file:// routing, calculation cancellation and factory reset preserving the map key pass. The requested Test network only paragraph and Journey sample-location choices are absent.
- Engine's 9 test groups, reproducible data check, map adapter tests, UI contracts, source syntax and whitespace checks pass. Physical iPhone/Android assistive-technology testing and live WebGL certification remain outside these automated checks.

---

# Local routing validation — 2026-10-28

This section records the initial separate-file routing build. The inline-map update above supersedes its earlier endpoint-entry UI; routing engine results remain applicable.

- `rtk proxy node scripts/test-routing.cjs`: all 9 test groups pass. Synthetic fixtures cover same-edge partial journeys in both directions, preserved interior vertices, real turns, alternate costs, all public exclusions, Stairs/Esculator filtering, the 50 m snap limit, nearest eligible segments, disconnected networks, unconnected crossings/near contacts, fallback endpoint keys, identical points, cancellation and immutable repeated queries.
- Nine real-network calculations match an independent queue-relaxation reference solver built from the raw GeoJSON, across Shortest/Fastest/Step-free. Representative node 3 → 2263 results: Shortest 999.8 m / 25.55 min; Fastest 1001.1 m / 25.49 min at 50 m/min personalised pace. Node 3 → 3781: Shortest 5003.8 m / 116.11 min; Fastest 5035.1 m / 115.00 min. These are modelled moving times, not measured journeys.
- Supplied baseline validated: 7,280 edges, 5,168 nodes, 14 components, 7,245 edges in the largest component, 396,098.186 m total source length, 35 exact path types. Default profiles exclude 290 edges; provisional Step-free excludes 437. Runtime graph is approximately 1.11 MB versus 3.05 MB source GeoJSON.
- `rtk proxy node scripts/build-routing-data.cjs --check`: generated network matches the committed source and converter output. Source fingerprint/network version: `c014dda572d9b88ae`.
- `scripts/test-routing-browser.cjs`: Firefox tests verify real calculated routes (Railway Station entrance → Cultural precinct toilet: 773.6 m / 18.8 min at 50 m/min), unresolved text, map endpoint selection/pan/confirmation/cancellation, GPS denial, save/reload/legacy confirmation, calculated text download, route endpoints/Fit route, navigation/reset cancellation races, secret reset retaining the key, and local-file routing with external requests blocked. Layout checks cover 320/390/412 px and 1024 px at 150% text in Dark Contrast Mode. Full onboarding, category filtering, large-map/legend layout, navigation disclosure and the Help communication card also pass.
- `scripts/test-routing-map.cjs`: actual Firefox 2D renderer checks taps, drag and button exclusion, offline network visibility and route endpoint persistence across renderer restart. A MapLibre test double verifies native map lifecycle, click selection and overlay state; this is not a live WebGL rendering certification.
- `rtk proxy node scripts/check-ui-contracts.cjs`, JavaScript syntax checks, shell syntax and `git diff --check` pass.

The browser scripts accept `PLAYWRIGHT_MODULE` (package directory) and `FIREFOX_EXECUTABLE` (browser executable). During validation these were `/home/n0rt/.nvm/versions/node/v22.23.2/lib/node_modules/@playwright/test` and `/home/n0rt/.cache/ms-playwright/firefox-1532/firefox/firefox`. Both scripts can also use a normal local Playwright installation. No new runtime packages are required.

Physical Android/iPhone testing, TalkBack/VoiceOver review, live authenticated MetroMap imagery, real WebGL performance on a phone, footpath topology inspection and accessibility verification remain outstanding. The 72 reported interior crossings are deliberately not joined. No standalone HTML or distributable ZIP was generated in this phase.

---

# Validation record — v2.0

27 October 2026. This records the checks completed, not a conformance certificate.

## Published-build migration — 28 October 2026

Authored changes were migrated from GitHub Pages build `fcfd801834b98bce2a4593e1e67594eb89bb1320` into the modular workspace. The approved policy is now 100/125/150% app text (150% default/maximum), a full page-flow legend, North/South/West/East arrows, and an independent icon-only App Shortcuts row. Earlier build checks below retain their historical settings.

- Full regressions passed 72 app-icon layouts and 24 map/direction/font combinations, along with native-choice bindings, setup validation, Back, Remember, reload and factory-reset imagery/key retention.
- Focused setup checks covered real shortcut-only saving, optional remembering, preserving other tool preferences, Back discarding uncommitted edits, intermediate Done validation, returning to Journey when editing, and returning to Explore after factory reset.
- Toolbar checks covered both display modes, all three sizes, standard/OpenDyslexic fonts, reading spacing and enlarged targets at 320/390px. Explicit SVG wrappers centre icons within one CSS pixel, labels remain within buttons, selected target sizes are honoured, and app icons remain on one separate row.
- Navigation uses SVG chevrons with correct Show/Hide accessible names. No caret text is used.
- Full-legend checks covered 320/390/480px widths plus short and landscape viewports: separate canvas/control-panel layout, document-flow legend, sticky accessible navigation, reachable options, and Back/Escape focus/scroll restoration.
- Stored 200% settings were verified to become effective and persisted 150% settings. The new preferences survive ordinary presets and reset to labels/tips-off defaults. Secret factory reset preserves the session imagery key and configuration.
- Hint tests passed 620ms hold and 2200ms post-release timing, 10px/multi-pointer cancellation, short-tap and keyboard activation, long-hold click suppression, disabling mid-hold, owned timers, inherited OpenDyslexic/text size, app bounds, ARIA preservation, native-dialog hosting, Escape and reset/disconnected-anchor cleanup.
- JavaScript syntax, stylesheet parsing and the no-dropdown source guard passed. No vendor, font, data or imagery-key source values were imported from the standalone bundle.

Tests used Firefox with the actual 2D map renderer. WebKit is installed, but its page process is blocked here by an IPC/socket restriction; this is not a missing package. Physical Safari/iPhone alignment, touch/context-menu behaviour, live WebGL and assistive technology remain device checks. No new axe/conformance audit or deployment was performed.


## Mobile controls update — 28 October 2026

The following checks used Playwright 1.63.0 with Firefox 151 and the real 2D map engine. These are interaction/layout checks, not a new axe or WCAG conformance audit. The earlier accessibility results below describe the previous build.

- 96 icon-bar cases passed: one through four pinned apps, 320/390/480px widths, 100/125/150/200% text, and standard/OpenDyslexic fonts. Icons stay in one row without a visible headline or labels, retain accessible names and touch targets, and do not overflow.
- 32 map/legend layout cases passed, including the single compact five-control row at 100/125%, a four-arrow North/South/East/West row, canvas above its control panel, and the control panel above bottom navigation.
- Legend switching preserved both canvas and panel dimensions. Inactive controls were inert; Escape and Back to controls restored the expected focus and state.
- The five-step setup flow passed shortcut validation, Back navigation, retained Taxi/Phone draft values, final review, remembered reload and optional empty selection.
- All replacement radio groups were exercised, including text, theme, speech rate, quick display, saved journey pace, basemap configuration and guide filtering.
- Drawer tests passed 300ms motion, rapid reversal, app/device reduced-motion changes during animation, closed-content focus exclusion and focus return. Device reduced motion suppressed animation even when the app allowed it.
- Factory reset retained a dummy session map key and imagery preferences while clearing setup. Embedded font/base stylesheet bytes were unchanged.
- The source guard `rtk proxy node scripts/check-ui-contracts.cjs`, JavaScript syntax checks and CSS parsing passed. Dynamic states contained no selects, datalists or popup comboboxes.

Live WebGL, physical phone keypad/app handoff, assistive technology and real speech delivery still require device checks. No real MetroMap key was used in these checks.


## Accessibility checks

The internal QA harness used axe-core 4.10.3 with WCAG 2 A/AA, WCAG 2.1 A/AA, WCAG 2.2 AA and best-practice tags. It was removed from the release. No Lighthouse score was measured.

| Tested state | Test width | Detected axe violations |
| --- | --- | ---: |
| Setup welcome | 390-pixel frame | 0 |
| Setup tool review with spoken-support readiness banner | 390-pixel frame | 0 |
| Access, 200% text, high contrast, spacing and persistent dock | 320-pixel frame | 0 |
| Large category tiles at those enlarged settings | 320-pixel frame | 0 |
| List choices | 320-pixel frame | 0 |
| One-at-a-time choices and Next | 320-pixel frame | 0 |
| Persistent message-card dialog | 320-pixel frame | 0 |
| Quick text/contrast dialog | 320-pixel frame | 0 |
| Free-text mock journey | 320-pixel frame | 0 |
| Map/imagery settings | 320-pixel frame | 0 |
| 2D Esri map, controls and point groups | 320-pixel frame | 0 |
| Platform guide, Android widget/overlay comparison | 320-pixel frame | 0 |
| Tools dialog | 320-pixel frame | 0 |

The narrow iframe had 305 CSS pixels of usable content because of its desktop scrollbar; the 390-pixel frame had 375. In recorded narrow checks, document scroll width matched content viewport width.

Some states produced **incomplete contrast checks** for decorative arrows, a textarea, dock labels, or partially visible map-associated text. These require human review; they are not passes. Other tested states, including the message-card, quick-display, platform guide and tools dialogs, had no incomplete rules. The main light and high-contrast token pairs have the calculated ratios below, but those calculations do not certify every composited UI state or basemap label.

Two landmark issues found around the new tools/voice area were corrected. The tools now sit in a named footer region with an internal group and navigation, rather than an aside nested within another landmark.

## Map checks

- The test Chrome environment could not create a WebGL context. The app automatically used the 2D raster renderer.
- Actual Esri Topography imagery appeared; all four visible tile images reported loaded at 256 × 256 pixels.
- The 2D map displayed mock point groups and the same point/list data.
- Explicit **Use 2D map safe mode** was applied through settings. Its status confirmed that safe mode was selected; all four visible Esri tiles loaded.
- Removing the API key retained applied 2D preferences and returned the key field to password mode.
- The Tools map-settings shortcut was corrected and verified to focus the Preferred basemap control.
- MetroMap integration uses the documented Australia_latest Web Mercator WMTS REST URL. **No valid key was supplied, so authenticated MetroMap imagery and a live rejected-key failover were not exercised.**
- The native MapLibre/WebGL rendering path remains to be checked on a WebGL-enabled device. This limitation is separate from the successfully tested 2D Esri path.

## Interaction checks

- Completed a visual-communication/easier-touch setup with automatic sound off, an edited card message, compact tray and one-at-a-time choices.
- Saved the setup and reopened the app. The message text, chosen tools, browsing mode and appearance survived reload.
- Confirmed vision-support choices suggest larger text, strong contrast, reading tools and spoken-screen options; spoken information can be changed independently.
- The persistent card opened directly with its configured message. Escape closed it.
- Previous/Next cycle categories. A horizontal pointer drag also moved from Toilets to Public transport without opening the category. This checks the gesture handler; it is not a physical touch-device certification.
- Category selection filtered the point/list layers. Public transport showed the station and two mock stops.
- Free-text origin/destination input accepted “My hotel” and “Shops near the river”. A mock journey displayed those labels, manual steps worked, and the sample could be saved. The UI explicitly says those labels are not geocoded.
- Missing destination produced an inline error and focused the text field.
- Message, quick-display and tools dialogs were exercised. Modal reading controls are available.
- Browser/PWA/iPhone/Android comparison controls and feature-group filtering were exercised. Android overlay permission guidance differed from the iPhone guidance.
- JavaScript syntax checked with Node for all authored scripts. Mock GeoJSON validated at 14 features across 10 layer types.

## Palette calculations

Selected WCAG relative-luminance calculations, rounded:

| Pair | Ratio |
| --- | ---: |
| Main text #183f38 / #fbfaf5 | 11.12:1 |
| Secondary text #405046 / #fbfaf5 | 8.19:1 |
| Secondary text #405046 / #eaf0e8 | 7.39:1 |
| White / accent #174f43 | 9.39:1 |
| Notice #623914 / #f5e6d4 | 8.11:1 |
| Dark text #f6f7ed / #142822 | 14.34:1 |
| Dark secondary #c0d3c6 / #142822 | 9.86:1 |
| High contrast white / black | 21.00:1 |
| Border #75877b / white | 3.81:1 |

## Shared UI consolidation — 2026-10-29

- Source syntax, UI contracts, whitespace checks and deterministic standalone build checks passed.
- The routing and Dyslexic browser suites passed against the source; `FILE_ONLY=1` preserves every scenario while avoiding the environment's intermittent localhost `listen EPERM` restriction. Default HTTP test mode remains available.
- The new direct-file shared-UI suite passed against both source and standalone. It checks Explore/Journey button geometry, normal shared frames, frameless Large Mode, controls above navigation on short screens, all supported normal/Dyslexic font sizes and reading spacing, button-content overflow, largest-size compass controls, shared framed sections, dashboard heading/region/focus and light/dark/contrast selected states.
- The complete standalone suite passed: isolated one-member ZIP, source parity, embedded assets/licences, offline routing/setup/reset, and all routing, Dyslexic and shared-UI child suites. The rebuilt HTML is 2,724,680 bytes; the ZIP is 889,267 bytes.
- This run used headless Firefox. Direct Edge/Chromium and physical-device validation remain outside this result. No GitHub commit or push was performed.

## Cache versioning — 2026-10-29

- The source entry, local scripts, styles, icon and dynamically loaded shortcut artwork share a deterministic release fingerprint. The build verifies or updates `index.html` and `version.json` before generating the standalone.
- Browser tests in headless Firefox and Chromium simulated a cached entry receiving a newer release, an up-to-date entry, an unavailable or invalid release response, and an out-of-sync entry after a redirect. They checked a single update navigation, preserved URL parameters/hash and browser data, no redirect loop, and normal local-file operation without a release request.
- The source routing, Dyslexic and shared-UI file-mode browser suites passed. The standalone suite verified source parity, embedded assets, isolation and the browser regressions. These are simulated/cache-fixture tests; GitHub Pages deployment and physical Edge or Firefox devices were not tested by this local change.

## Independent setup suggestions — 2026-10-29

- Confirmed the published setup code had added both Text & contrast and Read page for the seeing preference, and had enabled spoken screens for it.
- The source and rebuilt standalone pass direct-file Firefox checks for seeing alone, reading alone, both together, deselecting reading, and explicitly enabling spoken screens. The visual text-size, contrast and larger-target suggestions remain active. Existing remembered choices are not rewritten.
- The full standalone browser suite passed, including routing, Dyslexic, shared-UI, cache-version and setup-needs scenarios. The generated web release fingerprint is `bf2549313a8297b8`; no GitHub update was performed.

## Still required

- Physical iPhone/Android tests, VoiceOver, TalkBack, Voice Control/Voice Access and switch hardware.
- Real touch swipes, motion permission acceptance/denial and shake calibration. Motion was not physically tested.
- End-to-end speech audio, available voices, automatic-start policies, interruptions and stop behaviour on devices. UI/ready-state checks do not prove spoken delivery.
- WebGL-enabled MapLibre rendering and authenticated MetroMap imagery with the owner’s key/subscription.
- Full browser/OS text scaling, 400% zoom, forced colours, keyboard occlusion, landscape, safe areas and every focus position.
- Offline local-file launch on target devices, unavailable/cleared/full storage, map-network failures and provider-error edge cases.
- Co-design with people with varied access needs, and verified maintained accessibility/network data before any real journey service.

The prototype targets WCAG 2.2 AA with selected AAA design provisions. Automated zero-violation results do not establish WCAG conformance, native-platform certification or real-world route safety.
