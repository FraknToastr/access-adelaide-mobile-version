# Accessibility design record

Prototype version 2.0 · reviewed 27 October 2026.

This document describes implementation decisions, not a formal accessibility conformance report. WCAG is assessed against success criteria and conformance levels; a numeric tool score is not a substitute for conformance or usability testing.

## Implemented features

### Information without sight or colour

- Semantic main content, banner, named navigation, headings, lists, fieldsets and legends.
- Full places list from the same 14-point mock dataset used by MapLibre and the 2D tile renderer. Category and layer filters update both representations.
- Full written directions independent of map interaction or WebGL.
- Visible text labels on primary controls; named icon controls on the map and dialogs.
- Type names, symbols and written status accompany colour. Mock points use different pictograms and some different marker shapes.
- Decorative SVG icons are hidden from assistive technology.
- Map canvas is excluded from the accessibility tree; accessible DOM point buttons, map controls and equivalent list supply its interaction and information.
- Map groups expose their point count and show all grouped place descriptions in a dialog.
- Explicit source confidence and unknown access information. No sample facility is labelled verified.

### Vision, reading and reflow

- Four text-size choices, up to 200%, using the root font size.
- Browser zoom is enabled; the viewport does not set maximum-scale or user-scalable=no.
- Light, dark, black/white high contrast and follow-device themes.
- Core light-theme text pairs exceed 7:1 in palette calculations. The high-contrast text pair is 21:1. This does not prove every rendered element or basemap is AAA.
- Text-spacing option: 1.8 line height, 0.12 em letter spacing, 0.16 em word spacing and 2 em paragraph spacing.
- Simpler-page option removes decoration while retaining journey and facility information.
- Native selectors and wrapping content instead of bespoke scroll-wheel or drag-only menus.
- Navigation changes to two columns for the largest text sizes, retaining whole-word labels.
- Mobile width at wider screens; no device detection or desktop access wall.
- No portrait lock. Landscape remains possible.
- Safe-area padding for the lower navigation; sticky controls become static on short-height viewports.
- Forced-colour media rules retain native system colours and explicit borders/focus. The geographic map retains its own colours and has a list alternative.

### Dexterity, keyboard and input

- Primary app buttons generally have a minimum 48 CSS pixel height; an option raises most controls to 60 pixels.
- Checkbox/radio targets include the surrounding full-row label, not just the visible input square.
- Large named map zoom, fit and cardinal-direction buttons replace any need to pinch or drag.
- Nearby point buttons are grouped to reduce overlapping targets. Points partly outside the map viewport are not exposed as clipped buttons.
- No task requires shaking, hovering, swiping or a custom path gesture. Optional left/right swipes and optional shake-to-cycle duplicate the Previous/Next buttons for one-at-a-time categories.
- Native button click activation supports pointer cancellation before release.
- No map keyboard trap: the canvas does not capture arrow keys; map buttons remain available to keyboard and switch users.
- Skip-to-content and skip-to-navigation links.
- Visible focus: three-pixel outline plus contrasting halo.
- View changes update the document title and focus the new heading. Setup steps also move focus to their heading.
- Sample route-to-map action focuses the Map control and brings the map into view.
- Native modal dialogs with accessible names, background inertness, Escape dismissal and return focus.
- Written journey steps advance only on user action; position and headings are announced.

### Hearing, speech and communication

- No sound-dependent instructions, alerts or meaning. Visual communication and spoken information are independent setup choices.
- Read-aloud is opt-in. Users may request spoken screen introductions, including remembered-mode startup where the browser permits it. A Start voice alternative is shown where another tap is needed. Stop controls are available in the page and dialogs.
- Adjustable speech rate. All spoken directions remain visible as text.
- Speech stops when the page is hidden or left. Focus is restored if the speech controls disappear while focused.
- A configurable message card can remain in the persistent bottom dock or compact in-app tray. It does not require a microphone or spoken response. Card speech is a separate explicit action.
- Exportable text directions and feedback.

### Cognition, predictability and privacy

- Four consistently positioned, visibly labelled navigation choices.
- Needs-based quick setups; no diagnosis, account or onboarding questionnaire required.
- Simple form validation with inline error, association to the field, focus and a corrective suggestion.
- Live status messages for filtering, route creation, steps and local saving.
- No audio before an explicit reading/spoken-screen choice; no timed prompts, advancing steps, flashing, countdowns or automatic location tracking.
- Reduced motion is on by default, and the operating system preference always overrides motion opt-in.
- Quiet screen with an explicit return button and no timer.
- Preferences remembered only when requested. One journey can be explicitly saved on-device.
- Storage failures leave core app interactions available. Text export provides an alternative to saving in the browser.
- Clear/remove actions, honest mock-data labels and visible offline/privacy explanations.

## Version 2 additions

- A skippable first-run setup asks what would help, rather than requiring a disability label. Quick reading, contrast and communication aids are available before setup starts.
- Suggested tools and appearance can be reviewed and changed. The profile can be session-only or explicitly remembered with its message-card text.
- Eight open-ended categories have large tiles, a list or one choice at a time. No fixed destination list is required; journey descriptions accept free text.
- A bottom dock or compact floating tray keeps selected tools inside the app. This is distinct from an OS overlay or native Home/Lock Screen widget.
- Speech is optional and independent from visual communication. A quick spoken-screen pause control avoids requiring a full setup rerun.
- Optional swipe and shake are alternatives, never the only input. Shaking never confirms a category or permission. Real-device sensor and gesture tests remain required.
- MetroMap configuration uses a masked key field, explicit Apply and optional key storage. Esri Topography is the no-key/error fallback.
- WebGL failure now has a real 2D raster alternative, with the same point buttons, category filters, route line and map controls. No device permission can repair a blocked WebGL context; a different rendering path can mitigate it.
- The browser/native guide compares 15 feature areas and links official documentation. It separates native capabilities, permissions, implementation work and user-controlled system settings.

## WCAG 2.2 implementation mapping

These are supporting mechanisms, not declarations that every criterion has passed. A complete audit must assess all applicable criteria and every relevant state.

| WCAG criterion | Level | Implementation mechanism |
| --- | --- | --- |
| 1.1.1 Non-text Content | A | Same-data places list, written routes, named controls, hidden decorative graphics. |
| 1.3.1 Info and Relationships | A | Headings, lists, native labels, fieldsets, legends and descriptions. |
| 1.3.2 Meaningful Sequence | A | Linear document order and single-column content. |
| 1.3.3 Sensory Characteristics | A | Directions and controls do not depend solely on colour, shape or position. |
| 1.3.4 Orientation | AA | No orientation lock; layout also supports landscape. |
| 1.4.1 Use of Color | A | Layer type labels, pictograms, numbers and text states. |
| 1.4.2 Audio Control | A | Speech requires an opt-in reading/spoken-screen choice; page and dialog stop controls are provided. |
| 1.4.3 Contrast (Minimum) | AA | High-contrast palettes; automated checks and key-pair calculations. |
| 1.4.4 Resize Text | AA | Root-relative typography, 200% setting and enabled browser zoom. |
| 1.4.6 Contrast (Enhanced) | AAA | Core text palette exceeds enhanced contrast thresholds; broader audit still needed. |
| 1.4.10 Reflow | AA | Wrapping layout and narrow-width checks; the geographic map has a textual alternative. |
| 1.4.11 Non-text Contrast | AA | Contrasting control borders, visible selected states and focus styling. |
| 1.4.12 Text Spacing | AA | Spacing controls and tested combined 200% text/spacing state. |
| 2.1.1 Keyboard | A | Native controls, disclosures, forms and button alternatives for map actions. |
| 2.1.2 No Keyboard Trap | A | Canvas excluded from tab order; native dialogs support Escape. |
| 2.2.1 Timing Adjustable | A | App interactions have no time limits. |
| 2.2.2 Pause, Stop, Hide | A | No automatically moving UI; speech is stoppable. |
| 2.3.1 Three Flashes or Below Threshold | A | No flashing content. |
| 2.3.3 Animation from Interactions | AAA | Reduced movement default, device preference respected, instant map option. |
| 2.4.1 Bypass Blocks | A | Skip links. |
| 2.4.2 Page Titled | A | Document title updated for each main view. |
| 2.4.3 Focus Order | A | Document order, heading focus on navigation, dialog focus return. |
| 2.4.6 Headings and Labels | AA | Descriptive headings, visible controls and form labels. |
| 2.4.7 Focus Visible | AA | Strong focus outline and halo. |
| 2.4.11 Focus Not Obscured (Minimum) | AA | Flow layout, scroll padding, native dialog scrolling; short viewports release sticky navigation. |
| 2.4.13 Focus Appearance | AAA | Three-pixel outline as a starting design; verify area/contrast for every control manually. |
| 2.5.1 Pointer Gestures | A | Named buttons for zoom, panning and fitting map. |
| 2.5.2 Pointer Cancellation | A | Native click activation, no pointer-down commitments. |
| 2.5.3 Label in Name | A | Visible labels supply control names; map icons have descriptive names. |
| 2.5.4 Motion Actuation | A | Motion is off by default, can be disabled, pauses when hidden, and only cycles categories. Previous/Next buttons provide the same function. |
| 2.5.5 Target Size (Enhanced) | AAA | Large primary controls and full-row labels; review text-link and map-attribution exceptions. |
| 2.5.7 Dragging Movements | AA | No task requires dragging. |
| 2.5.8 Target Size (Minimum) | AA | Primary 48-pixel targets, label hit regions and grouped markers. |
| 3.1.1 Language of Page | A | en-AU document language. |
| 3.2.1 On Focus | A | Focus alone does not submit or navigate. |
| 3.2.2 On Input | A | Route build and setup completion require explicit buttons. Preference controls update the interface without submitting. |
| 3.2.3 Consistent Navigation | AA | Stable four-item main navigation. |
| 3.2.4 Consistent Identification | AA | Reused icons, wording and control patterns. |
| 3.2.6 Consistent Help | A | Help remains in the same navigation position. |
| 3.3.1 Error Identification | A | Inline text error, invalid state, field association and focus. |
| 3.3.2 Labels or Instructions | A | Labels, explanatory text and explicit mock-data notices. |
| 3.3.3 Error Suggestion | AA | Missing destination and communication text have corrective messages. |
| 4.1.2 Name, Role, Value | A | Native controls plus pressed, expanded, current, invalid and dialog states. |
| 4.1.3 Status Messages | AA | Polite atomic status regions without moving focus for routine updates. |

No authentication exists, so accessible-authentication requirements are not demonstrated. There is no video, live audio stream, payment flow or real-time transport system; those requirements would need fresh assessment if added.

## Other standards and mobile guidance

| Reference | How this prototype responds | Limit |
| --- | --- | --- |
| W3C mobile accessibility guidance | Supports touch alternatives, readable small-screen layout, orientation, zoom and alternative input. | W3C applies WCAG to mobile; there is no separate W3C mobile score. |
| EN 301 549 V4.1.1 | Useful functional perspective: use without vision, hearing, colour perception or vocal interaction; limited manipulation; cognition; privacy. Text/list alternatives and native controls address parts of that intent. | No EN 301 549 assessment, procurement claim or jurisdictional compliance opinion. Clauses beyond web content need separate scoping. |
| Apple accessibility HIG | Large controls, VoiceOver-oriented semantics, adaptable appearance, reduced motion and predictable navigation. | A browser app does not automatically conform to native Apple requirements. VoiceOver/Voice Control testing remains open. |
| Android accessibility guidance | Large touch areas, labelled controls, non-colour meaning, TalkBack-oriented semantics and text alternatives. | Android dp and Apple pt are native units; CSS pixels are not a blanket equivalence. TalkBack, Switch Access and physical sizing require device tests. |
| Cognitive accessibility guidance | Plain instructions, consistent layout, no time pressure, simple-page option and a quiet screen. | Reading simplicity and cognitive usability require review with people, not just software. |

## Required manual test plan

1. iPhone Safari with VoiceOver: all four views, rotor headings/landmarks, form errors, map point groups, dialogs, speech controls and focus restoration.
2. Android Chrome with TalkBack: reading order, name/role/state, gesture alternatives, native selectors, errors and dialogs.
3. Voice Control/Voice Access: activate controls using visible labels, including repeated navigation and map actions.
4. Switch Control/Switch Access and an external keyboard: scanning order, skip links, every action, Escape, no trap, restored focus and visible focus at every scroll position.
5. Browser zoom to 200% and 400%, OS text enlargement, all spacing combinations, 320 CSS pixel width, short landscape viewports, on-screen keyboard, notches and safe areas. The in-app 200% check is not a substitute for all these tests.
6. Windows forced colours and increased contrast settings, all themes and selected/focus/error/disabled states.
7. Physical touch accuracy, accidental taps, point grouping and control size on multiple phones.
8. Speech start/stop/end/error, unavailable voice, screen-reader speech interaction and privacy behaviour on real devices.
9. Network loss, unavailable basemap, WebGL failure, storage disabled/full, local-file launch and reopened offline sessions.
10. Co-design sessions with people with mobility, vision, hearing, dexterity, cognitive and sensory access needs. Include combinations of needs and unfamiliar visitors.
11. Field verification and an accessible route engine before enabling real journeys. Define a maintenance owner, inspection dates, change reporting, uncertainty and temporary-closure policy.

## Primary references

- [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/)
- [W3C mobile accessibility](https://www.w3.org/WAI/standards-guidelines/mobile/)
- [W3C cognitive accessibility guidance](https://www.w3.org/TR/coga-usable/)
- [EN 301 549 V4.1.1, September 2026](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/04.01.01_60/en_301549v040101p.pdf)
- [Apple accessibility HIG](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Android accessibility guidance](https://developer.android.com/guide/topics/ui/accessibility/views/apps-views)
- [MapLibre GL JS API](https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/)

References guide the design. They do not certify this implementation.
