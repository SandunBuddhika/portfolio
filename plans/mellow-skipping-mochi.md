# Plan — Immersive Project Telemetry Drawers & Interactive Command Shell Terminal

This plan outlines the architecture, layout, styling, and JavaScript logic to implement dynamic interactive features: an expandable project details drawer with custom animated telemetry graphs/charts for all 6 projects, and an interactive shell terminal inside the contact section.

---

## 1. Context & Architectural Constraints

1. **Pincushion Scroll Interaction**:
   - The `.work__grid` applies a continuous 3D perspective distortion, scale translation, and clip-path curves to `.work__item` cards on scroll.
   - **Constraint**: If expandable detailed panels are rendered *inside* the `.work__item` blocks, they will be clipped, warped, and distorted by the parent's scroll matrix.
   - **Solution**: We will implement a fullscreen absolute **Drawer Overlay** (`.project-drawer`) sitting *outside* the work grid in the DOM structure. It will slide in smoothly on click, completely avoiding parent clipping or performance bottlenecks, and remain perfectly sharp and readable.

2. **Graph Animations & Interactivity**:
   - Instead of static mock images or text dumps, each of the 6 projects will feature a custom, dynamically-rendered **Animated SVG Telemetry Panel** inside the drawer.
   - These panels will use CSS and native JavaScript intervals to simulate live system data (e.g. queue routing, caching metrics, replication heartbeats) in real time.

3. **Interactive Shell Terminal**:
   - In the `contact` section, we will embed a retro-futuristic, fully functional **Command Line Shell Terminal** (`.contact__terminal`) where visitors can run interactive commands like `help`, `about`, `skills`, `projects`, `contact`, and `clear`.

---

## 2. Proposed Implementations

### A. Immersive Project Drawer Overlay (`index.html`)
We will add a clean, fullscreen sliding drawer at the bottom of `index.html` (outside the scroll container to guarantee root-level relative positioning):
```html
<div class="project-drawer" id="project-drawer" aria-hidden="true">
  <div class="project-drawer__backdrop" id="project-drawer-backdrop"></div>
  <div class="project-drawer__content">
    <button class="project-drawer__close" id="project-drawer-close" aria-label="Close project">
      <span>[ESC] CLOSE ×</span>
    </button>
    <div class="project-drawer__scroll" id="project-drawer-scroll">
      <!-- Injected dynamically via js/projects.js -->
    </div>
  </div>
</div>
```

### B. JavaScript Projects Controller (`js/projects.js`)
We will create a new JavaScript file containing real-world, high-end software engineering specifications for all 6 projects. On `.work__link` click, the JS will intercept the action, open the drawer, populate the container, and initiate the specific SVG telemetry animation:

1. **NexaCommerce (High-Performance Core Engine)**:
   - *Technical focus*: Redis cluster locks, stripe webhooks, Elastic fuzzy search.
   - *Telemetry Animation*: "Traffic & Cache Hit Rate". Animated Bezier curves simulating live traffic load vs. cache hit ratios.

2. **PulseAnalytics (Real-Time Ingestion Pipeline)**:
   - *Technical focus*: ClickHouse storage, WebSocket streaming, telemetry partitioning.
   - *Telemetry Animation*: "Ingestion Throughput wave". Twin sine wave paths fluctuating continuously with real-time numeric counter updates (e.g. `84,512 rec/sec`).

3. **Archway CMS (Headless Multi-Tenant Engine)**:
   - *Technical focus*: Edge cache-invalidation, drag-and-drop block schemas, AWS S3 resize hooks.
   - *Telemetry Animation*: "Edge CDN Replication Node-Graph". Live pulses traveling from a core database node out to three edge CDN nodes.

4. **FlowSync API (Event-Driven Gateway)**:
   - *Technical focus*: Token-Bucket rate limiting, JSON Web Tokens middleware, REST-to-gRPC proxies.
   - *Telemetry Animation*: "Active Rate-Limiter Gate". Green/red particle flows falling through a central gate boundary (simulating HTTP 200 vs HTTP 429).

5. **OrbUI Design System (Modern Web Toolkit)**:
   - *Technical focus*: WCAG accessibility, CSS-in-JS code splitting, atomic UI component tree.
   - *Telemetry Animation*: "Bundle Size Optimization & Responsive Reflow Widget". Real-time interactive grid widget with a dragging slider that reflows structural elements on the fly.

6. **VaultDB (Encrypted Peer-to-Peer DB)**:
   - *Technical focus*: Raft consensus model, AES-GCM-256 field encryption, WAL logs.
   - *Telemetry Animation*: "Consensus Ring replication map". Pulsing circular nodes showing leader heartbeats and followers sync metrics in milliseconds.

### C. Interactive Command Shell Terminal (`index.html` & `css/style.css`)
We will embed an interactive command terminal inside the `contact` section. Visitors can type in realistic command prompts, which print elegant ASCII-formatted outputs.
- **HTML structure**: Terminal header with window controls, a terminal body output log, and a live input prompt with a flashing block cursor.
- **JS handling**: Built-in parser supporting:
  - `help`: list commands.
  - `about`: staff-engineer styled background bio.
  - `projects`: summary list of all projects with tech stacks.
  - `skills`: prints a beautiful ASCII tech pyramid.
  - `contact`: triggers contact actions.
  - `clear`: wipes out the screen.

---

## 3. Styling & Styling Elements (`css/style.css`)

- **Drawer transitions**: 
  - Absolute fullscreen, drawer content translating `X(100%)` to `X(0)` with high-performance CSS transforms and smooth spring easing.
- **Terminal theme**:
  - Deep dark console container, terminal banner, mono-font inputs, neon green/yellow styling accents (`var(--accent)`).
- **SVG charts styles**:
  - Gridlines, tooltips, glow filters (`drop-shadow`), pulsing dots, and dash-array stroke animations.

---

## 4. Verification & Testing Plan

1. **Drawer opening/closing**:
   - Inspect click responses, ESC key triggers, and background tap handlers.
2. **Animation fluidity**:
   - Ensure the requestAnimationFrame loop is correctly throttled and stops executing when the drawer is closed to save battery and CPU power.
3. **Interactive terminal input**:
   - Verify typing on mobile viewports vs desktop. Ensure standard commands trigger clean, error-free terminal logs.
