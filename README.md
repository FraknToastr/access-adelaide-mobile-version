# Access Adelaide — mobile prototype v2.0

A needs-based setup, large category choices, persistent access tools and a MapLibre map with a real 2D raster fallback.

**Place points and facility descriptions remain mock examples. Journey routes, distances and estimated travel times are now calculated from the supplied walking network. Accessibility, availability and entrances are unverified. Destination text is not geocoded. This is a test prototype, not a verified navigation service.**

## Open it

Open `index.html` in the complete source folder. Keep the adjacent scripts, stylesheet and `vendor` folder together. There is no build step or package installation. The app and local routing engine work from the adjacent files without a server; Locate me needs a browser that permits geolocation in the current context, normally HTTPS or localhost. No account is required. Single-file HTML and ZIP packaging are deferred.

The first visit opens setup at 150% text with high contrast and reduced movement. Supported app text sizes are 100%, 125% and 150%; remembered 200% preferences are migrated to 150%. Choices can be changed later from **Access → Change my setup**.

**Use my phone's settings** opens the initial Explore page with 100% text, the light theme and all mock places shown.

## Set up the support you want

1. Choose what would help: seeing, reading aloud, communicating, visual information, easier tapping or calmer screens. A diagnosis is not requested.
2. Review suggested tools and spoken information. Hearing and speaking support are separate choices.
3. Choose optional App Shortcuts: Uber, Taxi, Phone and Spotify. Taxi and Phone open their configuration directly below their choices. You may leave every app off.
4. Choose large tiles, one category at a time or list choices. Swiping and shaking are optional alternatives to buttons.
5. Review the setup and optionally remember it on this device. Remembering saves chosen preferences, shortcut configuration and communication-card text in browser storage.

**Set up my app and shortcuts** opens the full flow. **Done** on intermediate pages saves valid choices made so far. Editing setup returns to the last Explore or Journey page; first-time setup, factory reset and **Use my phone's settings** return to initial Explore. **Set up my shortcuts only** opens Optional Tool Shortcuts and Optional App Shortcuts with a shared remember option, Back and Save. It preserves other preferences and applies only valid shortcut changes.

Text/contrast controls, Hear this page and a communication card are available from the opening screen. The app changes its own interface; it does not change the phone’s global accessibility settings.

The fifth control, **Dyslexic font**, toggles OpenDyslexic throughout the app. Its label always previews the font. Regular and bold OpenDyslexic fonts are embedded in `styles.css`, so they work offline without installing a font or contacting a font service. The option starts off and is saved only with your remembered setup. Access reset and the secret Demo only reset turn it off; the secret reset keeps your map key and imagery settings.

OpenDyslexic is by Abbie Gonzalez, licensed under SIL OFL 1.1. The bundled copyright and licence are in `vendor/OPENDYSLEXIC-LICENSE.txt`; `vendor/OPENDYSLEXIC-SOURCES.md` records the original font blobs.

A remembered request for spoken screens is attempted where browser audio rules allow it. **Start voice** remains available if another tap is needed. Speech is optional and stoppable. It does not replace VoiceOver, TalkBack, Voice Control, Voice Access or switch input.

## Browse openly

Eight categories: Toilets, Public transport, Shops, Food & drink, A place to rest, A quieter place, Drinking water and Things to do.

Use **Tiles**, **One at a time** or **List choices**. The one-at-a-time view includes Previous and Next. If enabled, horizontal swipes or a shake cycle choices; they never confirm a selection. The sensor listener is off by default and paused when the page is hidden. Motion support needs a compatible device/browser and any permission required by that browser. Enable shake again after reopening; the app does not automatically request motion permission.

There are 14 mock points across 10 map layers. A category filters both map and list. **Show all mock places** restores the full set. The initial home view is list-first, with the map available from **Map**.

## Calculate a walking-network journey

Choose start and destination using the map, the inline sample-place lists, an exact known sample name, or optional one-shot GPS for the start. Unrecognised text does not become coordinates. Editing a resolved label clears its stored coordinate association. GPS denial or an unavailable secure context leaves map and sample-place selection available.

**Choose start on map** and **Choose destination on map** reuse Explore's map. Tap to position the crosshair, or use **Move Map** and its directional buttons, then **Use this location**. Cancel or Escape keeps the previous endpoint. Offline selection shows eligible walking paths. **See on map** and **Fit route** display the calculated line and distinct start/end markers in both renderers.

Choose **Shortest** (default), **Fastest**, or **Step-free (provisional)**. All exclude Private Path, Unofficial Path, Timed Path, Timed Underpass and every proposed crossing type. Step-free also excludes the source categories Stairs and Esculator. It does not establish wheelchair accessibility. Rest, shade, quietness, kerb ramps, surfaces, widths and facilities are not optimised or checked.

Each endpoint snaps to its nearest eligible polyline segment within **50 metres**. Distances include only traversed path subsegments, including same-edge partial journeys. Snapping offsets are disclosed separately and are not verified connecting paths. Disconnected or out-of-coverage endpoints produce explanations; there is no straight-line or illustrative fallback.

Shortest and Step-free minimise source metres. Fastest minimises `Shape_Length / Speed` (Speed is metres/second). Personalised moving time is the sum of those seconds, multiplied by `1.39 / (chosen pace / 60)`; the pace choices remain 35/50/70 metres per minute. This retains source speed penalties but is not a measured travel time. Rest time is additional. Walktime is not used.

Written turns are approximate and derived from the traversed geometry. **Read Steps**, save and text download use the calculated result. Saved journeys contain versioned endpoint coordinates and preferences, and are recalculated when opened. Older illustrative saves require explicit endpoint selection before calculation. No automatic GPS tracking, remote routing or geocoding is added.

### Network and reproducible conversion

The WGS84 input in `data/walking-pathways.geojson` was extracted unchanged from the supplied routing handoff. It contains 7,280 paths, 5,168 endpoint nodes, 14 components and approximately 396.1 km; the largest component contains 7,245 paths. These are unfiltered source counts. Default profiles exclude 290 edges; provisional step-free excludes 437. Exact path types and exclusion counts are available from the engine statistics.

Topology uses FromNode/ToNode; endpoints consistently rounded to eight decimals are a fallback for exports without IDs. Interior crossings and nearby junctions are never connected automatically. Every intermediate vertex is retained. Source topology and accessibility remain unvalidated, including the handoff's 72 interior crossings.

Run `rtk proxy node scripts/build-routing-data.cjs` to regenerate the compact classic-script runtime graph, or append `--check` to verify reproducibility. It records source SHA-256 and baseline counts and rejects an unexpected dataset rather than silently repairing it. The engine loads the generated script locally without fetch, CDN, routing services or a build step for users.

## Keep tools close

Choose a bottom tool dock or compact in-app floating tray. The message card and reading button can remain visible in the tray; other controls remain under **Access → Open my tools**.

On the main pages, the SVG chevron at the right of the tool row hides or reveals bottom navigation. Its accessible name changes between **Hide navigation** and **Show navigation**. In-app tools can reflow into additional rows to keep labels and touch targets readable; pinned app icons always keep a separate single row. The panel hides when no visible tools or shortcuts are selected and restores navigation. This choice lasts for the current visit; reloading, resetting access settings or clearing app data restores navigation. Navigation stays hidden throughout setup.

Tools include a message card, Read page, Text & contrast, Quiet moment, optional shake control, a quick spoken-screen toggle and a shortcut to map settings. Reading controls are also provided inside dialogs. These are widgets **inside this app**, not overlays above other apps or native Home/Lock Screen widgets.

## Button display and hints

Under **Access → Buttons & shortcuts**, choose **Icons and labels** (the default) or **Icons only** for access tools and main navigation. App shortcuts always remain icon-only. These preferences are also available during setup and follow Remember my setup.

Optional **Long press for a short tip** starts off. When enabled, hold an eligible control for about 620ms to see a description without activating it. Moving more than 10px cancels the hold. Keyboard focus and pointer hover offer the same descriptions; Escape dismisses them. Hints inherit the chosen text size and font, remain within the app bounds and work inside dialogs. Navigation, reset, preference changes, scrolling and dialog changes dismiss pending or visible hints.

## App shortcuts

Under **Access → App Shortcuts**, choose Uber, Taxi, Phone and Spotify, then press **Save shortcuts**. The same chooser is included in Set up my app onboarding; its draft is applied when setup finishes. Back and Continue retain entered choices. The bar shows icons only, in one equal-width row, with descriptive accessible names and no visible headline or labels. Unpin every app to hide it.

Taxi and Phone settings open in inline drawers directly below their respective choices. Taxi offers Adelaide presets (13cabs, Suburban Taxis, Adelaide Independent Taxis and Access Taxis), plus Other number. Phone offers number entry each time or Speed dial. Number fields request the telephone keypad. Calling hands the number to the device's telephone handler; desktop browsers may have no calling app.

Drawer transitions use 300ms height and opacity animation when movement is permitted. **Reduce movement is on by default**, so first-run drawers open immediately. Turning it off allows animation unless the device requests reduced motion. Closed drawers are removed from keyboard navigation; rapid changes and focus entering a drawer finish safely.

Uber and Spotify use their public app/web links; no journey or GPS coordinates are sent to those services by this app. These links need the service to be available. Uber, Spotify and 13cabs artwork is bundled locally. Other taxi providers use a neutral taxi symbol because their logo files could not be retrieved in the implementation environment. Artwork sources and licenses are under `vendor/shortcuts/`.

Shortcut preferences and saved numbers follow **Remember my setup on this device**. With remembering off, they last for this visit. Reset access settings retains the current shortcuts; Clear saved data and the secret Demo only reset clear them. The secret reset continues to preserve the map key and imagery settings.

## Map controls

**Move Map** reveals one row of four arrow-only buttons in North, South, West, East order. At 100% or 125% text, the main controls occupy one row: Move Map, zoom in, zoom out, Large Map and Recentre. Larger text uses roomier controls. Recentre fits the selected mock places.

**Large Map** expands the map with the control panel below the canvas and the app's sticky panel below both. The canvas is never behind the map controls. **Normal Map** or Escape restores the page. Map resizing retains centre and zoom; short viewports keep controls scrollable without shrinking touch targets.

The **Legend** toggle beside the mock-points badge opens the full legend and map options in page flow. In Large Map, the canvas becomes a smaller header while every legend entry remains reachable by page scrolling. Bottom navigation remains accessible. **Back to controls** restores the map controls and large canvas; Escape closes the legend before leaving Large Map. **Map credits** and provider links are in Help; renderer/provider status paragraphs are not shown on the map.

## MetroMap and the map fallback

Open **Access → Map & imagery** (also reachable through Tools).

1. Choose **MetroMap, with Esri fallback**.
2. Paste your own MetroMap API key. The field is masked.
3. Leave **Remember API key on this device** off for session-only use, or opt in on a trusted device.
4. Select **Apply map settings**.

An eligible MetroMap API subscription is required. No valid key was supplied during development, so authenticated MetroMap imagery remains to be checked with your key. The implementation uses the documented Australia_latest Web Mercator WMTS REST endpoint.

With no key, or when MetroMap tile requests fail, the app uses **Esri World Topographic Map**. MapLibre GL JS 5.6.1 is the main renderer. If WebGL is unavailable, fails to start, or loses its context, the app switches to a 2D raster renderer using the same basemap tiles, mock points, routes and button controls. A MetroMap tile-source failure can also switch to the 2D Esri fallback. **Use 2D map safe mode** can be selected explicitly.

If online tiles cannot be reached, local schematic outlines and the full places list remain available. Map status explains which renderer and provider are being used. Map credits are below the map.

The API key is sent directly to MetroMap in imagery requests. Optional local storage is not a credential vault. The key is not placed in source files, route exports or this ZIP. Remove API key and the full data-clear action remove it. A production credential-delivery approach should be agreed with the imagery provider before public deployment.

Official endpoints:

- [MetroMap WMTS integration](https://docs.metromap.com.au/docs/ogc-wmts)
- [Esri World Topographic Map service](https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer)

## Browser versus native app guide

**Browser or native app?** is an expandable section at the bottom of Help and starts collapsed. It compares Browser tab, installed web app (PWA), iPhone native/hybrid and Android native/hybrid across 15 feature areas. The guide link in Tools opens this inline Help section. The app-versus-phone-settings notice is also in Help.

Each feature distinguishes what becomes possible, which permission/user action is involved, where native development helps and what this mockup actually implements. The guide does not request permissions. Optional interface detection reports API presence, not hardware capability or a successful permission grant.

## Offline and privacy

The source folder bundles the app, MapLibre, mock/schematic data and the compact walking graph. Lists, cards, routing and written steps work without online maps. Real MetroMap/Esri tiles need internet. The hosted version is not currently an installed offline PWA and has no service worker or real offline map package.

No analytics, automatic GPS, microphone capture, voice recognition or background navigation. The only GPS request is the one-shot Locate me action. Its coordinates remain in the current form unless you explicitly save a journey containing that endpoint. Browser speech may use local or remote voices, depending on the device. Motion is read only after the user enables the optional control, and is not recorded or transmitted.

Settings and cards are remembered only when chosen. Browser storage can be unavailable or cleared. Use **Help → Privacy & stored information → Clear saved setup, settings & journey** to clear the saved profile, access settings, journey and imagery key.

## Source layout

- `index.html`: semantic interface, setup shell, dialogs and inline Help guide.
- `app.js`: navigation, access settings, calculated journeys, endpoint selection, exports and speech.
- `support-ui.js`: onboarding, shortcut drawers, profiles, categories, tools and optional category inputs.
- `ui-controls.js` / `ui-controls.css`: visible radio-card choices and shared reduced-motion-aware drawers.
- `setup-shortcuts.css`: shortcut chooser and icon-only row.
- `map-controls.css`: compact controls, stacked map layout and full page-flow legend.
- `toolbar.css`: responsive tool/navigation rows and centered SVG controls.
- `press-hints.js` / `press-hints.css`: optional pointer, focus and keyboard hints.
- `map-engine.js`: MapLibre, 2D tiles, provider failover, point selection and route overlays.
- `routing-engine.js` / `routing-data.js`: local graph routing and generated compact network.
- `routing.css`: Journey controls and map-selection styling.
- `data/walking-pathways.geojson`: unchanged WGS84 routing input; `scripts/build-routing-data.cjs` regenerates the runtime data.
- `platform-guide.js`: browser/PWA/iPhone/Android comparisons and source links.
- `data.js` / `mock_points.geojson`: invented examples and local geometry.
- `styles.css`: mobile layout, themes, focus states and reflow.
- `vendor/`: pinned MapLibre distribution and licence.

## UI rules and checks

This is a mobile-only interface. The authored changes were migrated from published build `fcfd801834b98bce2a4593e1e67594eb89bb1320`; workspace assets and modules remain local. Native selects, datalists and custom popup selectors are prohibited; use visible choice cards and inline drawers. Run `rtk proxy node scripts/check-ui-contracts.cjs` to check application sources for dropdown selectors. `AGENTS.md` records these rules for future changes. Browser checks still need to cover onboarding, drawer focus/motion, text reflow, shortcut rows and both map renderer paths where available.

`ACCESSIBILITY.md` records implementation decisions. `VALIDATION.md` records tests and their limits. No WCAG conformance, native-app certification, Lighthouse score or real-world route accessibility is claimed.
