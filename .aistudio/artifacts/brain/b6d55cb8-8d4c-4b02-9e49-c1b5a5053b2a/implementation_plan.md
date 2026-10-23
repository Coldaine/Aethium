# Aetherial — Spatial Task & Information Canvas

Aetherial is an adaptive 3D spatial information substrate and interactive physics sandbox that transforms tasks, notes, Google Workspace streams, and developer telemetry into tactile polyhedra ("Bubbles"), passing data trains, and mechanical 3D contraption widgets across an ambient-to-tactile attention spectrum.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Product & Architecture Decisions (from Phase 1 Alignment)**

- **Confirmed Decision 1 — Data Sources & Workspace Integration**: **Live Google Workspace OAuth + Simulated GitHub PR Telemetry**. We will configure client-side Google OAuth for **Gmail** (transient "Passing Trains" of unread/recent messages), **Google Calendar** (events pulled onto the chronological "Temporal Spine" gravity axis), **Google Drive** (recent workspace docs/notes), and **Google Keep** (note cards), paired with realistic GitHub PR/CI telemetry payloads summarized every 10 minutes (or on-demand) by Gemini.
  - *Enterprise Note on Google Keep API*: Because Google's `keep.googleapis.com` REST API restricts OAuth consent on consumer `@gmail.com` accounts to Workspace Enterprise domain admins, the app will request the Workspace scopes and automatically provide a seamless bi-directional fallback to Drive/local graph note storage if a consumer account receives a scope restriction from the Keep endpoint.
- **Confirmed Decision 2 — Five 3D Contraption Widgets**: Alongside floating faceted Bubbles, the canvas will feature five self-contained, interactive 3D mechanical contraptions with independent internal choreography:
  1. **PR Bead Roller Coaster** (3D wire loop where PR beads climb through Draft → Open → CI Running → Approved).
  2. **Low-Gravity Tetris & Icicle Task Graph** (hierarchical partition blocks that slowly settle and stack like low-gravity Tetris tiles).
  3. **Split-Flap Digest Clacker Board** (retro departure-board tiles that physically flip with a wave ripple when Gemini refreshes the dev/workspace digest).
  4. **Project Orrery Planetary Rings** (core repos at the center with active branches and PR moons orbiting on brass/titanium wire rings).
  5. **Thermal Lava Tube** (vertical glass cylinder where active background builds and in-progress agent tasks rise and fall as glowing thermal blobs).
- **Confirmed Decision 3 — Deictic Voice Input**: **Push-to-Talk Web Speech API Microphone**. Grabbing and holding any 3D Bubble engages the browser's live microphone (`SpeechRecognition` / `webkitSpeechRecognition`) to capture spoken commands (*"Push this to Friday"*, *"Summarize and archive"*, *"Move to ready to merge"*), bundling `{ card_graph_json, spoken_transcript }` to the server-side Gemini Agentic Harness with a universal **Undo** stack and explicit confirmation modals before mutating Google Workspace records.
- **Confirmed Decision 4 — Switchable Attention Spectrum Modes**: Instant switching between **Peripheral HUD Overlay Mode** (translucent desktop overlay simulation with modifier-key clutch to toggle click-through vs. grab), **Ambient TV / Living Mode** (cinematic low-interaction drift with procedural Web Audio harmonic chimes), and **Tactile Engagement Mode** (direct manipulation, facet inspection, magnetic clustering, and push-to-talk voice).

---

## 1. Overview & Core Concept

- **What It Does**: Replaces guilt-inducing backlogs and static 2D Kanban boards with a living 3D physics canvas. Transient items (emails, commits, notifications) glide across the viewport as **Passing Trains**—if ignored, they expire via a TTL timer and are gently yanked off-screen forever. Items you care about can be plucked into persistent **Faceted Polyhedra Bubbles** (typed JSON graph cards mapped onto 3D crystal/metallic shapes) or inspected inside mechanical **3D Widgets**.
- **Target Audience / Persona**: Developers, technical leads, and spatial thinkers who want ambient awareness of code pipelines, tasks, and Workspace communications without drowning in an exhaustive inbox.
- **Key Value**:
  - **Zero-Guilt Ephemerality**: Unplucked stream items drift away cleanly when their Time-To-Live (`ttl`) expires.
  - **Deictic Touch + Voice Synergy**: Touching/holding an object establishes context (*"this"*), while voice supplies the action delta (*"move to tomorrow at 3 PM"*), eliminating chat-thread copy-pasting.
  - **Live Parametric Physics & Wave Modulation**: A full on-screen **Physics & Oscillator Debug Menu** lets you sculpt how objects move and breathe using `[Min, Max]` sliders driven by Sine, Triangle, Perlin Noise, or Random Walk oscillators.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Title / Mode Entry & Workspace Connection**:
   - Launches into a full-viewport (`100vw × 100vh`) 3D spatial environment with a bespoke inline SVG title lockup, live-drifting polyhedra, a quick-start CTA (`Enter` / `Space` to enter canvas), and an official **"Sign in with Google"** button to connect Gmail, Calendar, Drive, and Keep.
2. **Inspecting & Manipulating Faceted Bubbles**:
   - Hovering or approaching a Bubble with the pointer triggers **Stillness on Approach** (local velocity damping drops to near-zero so you never chase a moving target).
   - Dragging rotates the multi-part 3D polyhedron to inspect its typed graph facets (**Face 1**: Kinetic Title & Category · **Face 2**: Gemini 2-Sentence Summary · **Face 3**: Quick Actions & Status · **Face 4**: Source Metadata & Revision History).
   - Holding the **Cluster Modifier (`Shift` + Drag)** snaps nearby Bubbles into a magnetic constellation connected by subtle spring tethers.
3. **Push-to-Talk Deictic Voice + Gemini Agent Harness**:
   - Pressing and holding a Bubble (or holding `V` / `Space` while a Bubble is selected) activates the **Push-to-Talk Microphone Ring** around the polyhedron.
   - Releasing sends `{ card_json, spoken_transcript }` to the server-side Gemini Agentic Harness (`gemini-4-argon` for complex tool/graph mutations, `gemini-3.8-flash` for summarization, `gemini-3.1-flash-lite` for rapid facet edits).
   - While Gemini processes, the Bubble enters the **"In-Progress" Visual State** (collapsing into a **Single-Particle Spark** orb with a refractive shader shimmer and increased gyroscopic spin). Upon completion, its 3D title characters perform a **staggered kinetic backflip**, and an **Undo** action is pushed to the history stack.
   - If the spoken command requests mutating or deleting external Google Workspace data (e.g., trashing an email, updating a Calendar event, or modifying a Drive file), a clear **Confirmation Modal** describes the exact change and awaits explicit user confirmation before executing the Workspace API call.
4. **Interacting with the 5 Mechanical Contraption Widgets**:
   - Users can focus on or toggle any of the 5 spatial contraptions positioned around the studio perimeter:
     - **PR Bead Roller Coaster**: Hovering a bead pauses its climb along the 3D spline track and reveals the PR's Gemini summary; clicking opens the PR detail drawer or external link.
     - **Low-Gravity Tetris / Icicle Task Graph**: Clicking any settling rectangular block triggers task completion or expands subtasks.
     - **Split-Flap Digest Clacker Board**: Clicking the clacker triggers an immediate Gemini `gemini-3.8-flash` digest refresh, physically flipping the 3D character flaps with a procedural mechanical clack sound.
     - **Project Orrery Planetary Rings**: Hovering orbiting branch planets or PR moons highlights their orbital ring and commit cadence.
     - **Thermal Lava Tube**: Displays active background jobs rising and cooling as buoyant metaball-style thermal spheres inside a glass cylinder.
5. **Tuning the Physics & Oscillator Debug Panel**:
   - Pressing `D` (or clicking **Physics Tuner** in the bottom dock) opens the live **Gravity & Wave Oscillator Drawer**.
   - Each of the 6 forces (`driftStrength`, `edgeGravity`, `mutualAttraction`, `vortexTorque`, `temporalSpinePull`, `exitYankForce`) features a static weight slider plus a dynamic oscillator toggle with `minVal`, `maxVal`, `frequency`, and `waveform` (`Static`, `Sine`, `Triangle`, `PerlinNoise`, `RandomWalk`), plus a real-time waveform sparkline preview.

### Visual Identity & Theme

- **Aesthetic Direction**: **Precision Horology & Optical Glass Studio**—inspired by kinetic sculptures, Teenage Engineering tactile instrumentation, and museum-grade dark optical glass.
- **Color Palette & Mood (60-30-10 Distribution)**:
  - **60% Dominant Canvas (`--background`)**: Deep Obsidian Studio (`#090B10`) in Tactile/TV Mode; switchable to a simulated desktop workspace backdrop with alpha-composited glass in **Peripheral HUD Overlay Mode**.
  - **30% Structural Surfaces (`--card` / `--border`)**: Solid/translucent graphite surfaces (`rgba(17, 20, 28, 0.88)`) with crisp `1px solid rgba(255, 255, 255, 0.09)` hairline borders (never using `backdrop-filter` over the active WebGL canvas to preserve 60fps performance).
  - **10% Semantic & Material Accents**:
    - Warm Brushed Brass / Amber (`#F59E0B`) for To-Dos & Keep/Drive Notes.
    - Electric Cyan (`#06B6D4`) for GitHub PRs, Beads, and Orrery Orbits.
    - Coral Vermilion (`#F43F5E`) for Urgent / CI Failed states and Lava Tube heat.
    - Emerald Mint (`#10B981`) for CI Passing / Approved PRs and Calendar Spine locks.
- **Typography & Hierarchy (2+1 Font Rule)**:
  - *Display & 3D Kinetic Titles*: `Syne` / `Bricolage Grotesque` (bold, sculptural geometry for 3D character-split backflips and wave ripples).
  - *UI & Summary Prose*: `Plus Jakarta Sans` (clean, high-legibility sans for card summaries and HUD controls).
  - *Telemetry, Oscillators & Split-Flap Tiles*: `JetBrains Mono` with strict `tabular-nums` (`font-variant-numeric: tabular-nums`) for physics parameters, TTL countdowns, and PR numbers.
- **Viewport Budget & Ergonomic Layout**:
  - At least **85% of the viewport** remains unobstructed 3D canvas (`100vw × 100vh`).
  - All primary mode switches (Attention Mode, Temporal Spine Toggle, Workspace Sync, Undo Button, Mute Audio, Physics Tuner Toggle) live in a **Collapsible Bottom Control Dock** (`<= 15%` viewport footprint) with a `▾ Hide Controls (H)` Zen-mode drawer handle.
  - Metadata on overlays uses clean unboxed typography with `·` separators (zero static pill clutter, zero pulsing status dots).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Custom 6-Force Vector Symplectic Integrator vs. Heavy Rigid-Body Engine**
  - *Chosen Approach*: A custom, zero-GC 3D force-directed physics step loop in TypeScript using pre-allocated `THREE.Vector3` scratch registers.
  - *Why*: Standard rigid-body engines (Cannon/Ammo) fight custom non-Newtonian behaviors like "Stillness on Approach", "Temporal Spine chronological alignment", "TTL Exit Yank", and Perlin-modulated edge gravity. A custom symplectic Euler + velocity-verlet integrator gives 100% deterministic control over all 6 forces at a locked 60fps.
  - *Alternatives Considered*: `rapier3d` WASM—passed over because custom wave-modulated attraction fields and immediate cursor-approach damping are cleaner and lighter in a dedicated force field solver.
- **Decision 2 — Composite 3–12 Part Procedural `THREE.Group` Meshes + 3D Character-Split Canvas Sprites**
  - *Chosen Approach*: Every Bubble and Widget contraption is assembled as a multi-part `THREE.Group` (combining faceted crystal shells, brushed metallic bezels, orbital spark rings, and individual per-character 3D planes for staggered backflip and wave animations) with `RoomEnvironment` PBR reflections.
  - *Why*: Eliminates external `.glb` or font file 404 risks while delivering authentic physical refraction, metallic specular highlights, and per-letter kinetic animations ("pizzazz").
- **Decision 3 — Multi-Tier Server-Side Gemini Routing (`gemini-4-argon`, `gemini-3.8-flash`, `gemini-3.1-flash-lite`)**
  - *Chosen Approach*: All Gemini calls execute strictly on the server via Next.js API routes (`/api/gemini/*`):
    - `gemini-4-argon`: Powers the **Deictic Voice Agentic Harness**, interpreting spoken intents against the Bubble's JSON graph schema and returning structured tool calls (mutate card properties, cluster related nodes, draft Workspace updates). *(Note: Before invoking `gemini-4-argon`, the app will support triggering the AI Studio paid model key selection flow if needed, with automatic fallback to `gemini-3.8-flash` so actions never fail).*
    - `gemini-3.8-flash`: Powers the **10-Minute / On-Demand Digest Summarizer** for GitHub PR activity, Gmail passing trains, and the Split-Flap Clacker Board.
    - `gemini-3.1-flash-lite`: Powers ultra-low-latency **Kinetic Title & Micro-Tag Generation** when plucking transient train items into persistent Bubbles.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                      CLIENT BROWSER (Next.js App Router Spatial UI)                   │
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │               Isolated Full-Viewport Three.js WebGL Stage (useRef)              │  │
│  │                                                                                 │  │
│  │  ┌──────────────────────────┐  ┌──────────────────────────┐  ┌───────────────┐  │  │
│  │  │  6-Force Physics Engine  │  │  Faceted Polyhedra       │  │ Passing Train │  │  │
│  │  │  + Wave Oscillator Mod   │─▶│  Bubbles (Typed Graph)   │  │ Stream Spawner│  │  │
│  │  │  (Sine/Triangle/Perlin)  │  │  + Kinetic Flipping Text │  │ + TTL Yank    │  │  │
│  │  └──────────────────────────┘  └──────────────────────────┘  └───────────────┘  │  │
│  │                                                                                 │  │
│  │  ┌───────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                  5 Self-Contained 3D Contraption Widgets                  │  │  │
│  │  │  [1. PR Bead Coaster] [2. Tetris/Icicle Graph] [3. Split-Flap Clacker]    │  │  │
│  │  │  [4. Project Orrery Rings]                     [5. Thermal Lava Tube]     │  │  │
│  │  └───────────────────────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                           ▲                                           │
│                                           │ Raycaster + Ref State Bridge              │
│                                           ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐  │
│  │                     Low-Occlusion Semantic DOM Overlays                         │  │
│  │  • Collapsible Bottom Control Dock (Attention Mode, Temporal Spine, Undo, Mute) │  │
│  │  • Live Physics & Oscillator Debug Drawer (Min/Max/Waveform/Frequency Sliders)  │  │
│  │  • Push-to-Talk Web Speech API Mic Ring + Workspace Mutation Confirmation Modal │  │
│  └─────────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────┬─────────────────────────────────────────┬──────────────────────┘
                       │ Bearer Access Token (In-Memory)         │ JSON Graph + Speech
                       ▼                                         ▼
┌─────────────────────────────────────────────┐   ┌─────────────────────────────────────┐
│   Google Workspace REST APIs (OAuth 2.0)    │   │   Next.js Server API Routes         │
│  • Gmail API (Passing Train Messages)       │   │  • POST /api/gemini/agent-harness   │
│  • Calendar API (Temporal Spine Events)     │   │    (gemini-4-argon Function Calls)  │
│  • Drive API (Workspace Notes & Docs)       │   │  • POST /api/gemini/digest          │
│  • Keep API (+ Consumer Note Fallback)      │   │    (gemini-3.8-flash PR/Mail Digest)│
│                                             │   │  • POST /api/gemini/fast-facet      │
│                                             │   │    (gemini-3.1-flash-lite Summary)  │
└─────────────────────────────────────────────┘   └─────────────────────────────────────┘
```

### Data Model & State

1. **`SpatialGraphNode` (Bubble / Train Entity)**:
   - `id`: Unique node identifier.
   - `archetype`: `'bubble' | 'train_car'`.
   - `source`: `'todo' | 'note' | 'github_pr' | 'gmail' | 'calendar' | 'drive' | 'keep'`.
   - `title`: Short title rendered with 3D character-split kinetic meshes (supports staggered backflip & wave animations).
   - `summary`: Concise 1–2 sentence Gemini summary mapped onto Face 2.
   - `status`: `'idle' | 'in_progress' | 'completed' | 'ci_running' | 'approved' | 'failed'`.
   - `visualEffect`: `'normal' | 'single_particle_spark' | 'refractive_shimmer' | 'gyro_spin'`.
   - `facets`: Structured array of 4 face payloads (`Title/Tag`, `Summary`, `Quick Actions`, `Metadata/Links`).
   - `clusterId`: Optional constellation group ID when magnetically snapped together.
   - `scheduledAt`: Optional ISO timestamp used when the **Temporal Spine Gravity** toggle pulls timed items onto the horizontal timeline axis.
   - `ttlSeconds` & `ageSeconds`: Lifetime counters; when `ageSeconds >= ttlSeconds` on transient items, `isExpiring = true` triggers the directional **TTL Exit Yank** vector.
2. **`ForceParameterConfig` (Physics & Oscillator State)**:
   - Each of the 6 forces (`driftStrength`, `edgeGravity`, `mutualAttraction`, `vortexTorque`, `temporalSpinePull`, `exitYankForce`) + global `damping` and `approachStillnessRadius` holds:
     - `baseValue`: Current static value.
     - `oscillatorEnabled`: Boolean toggle.
     - `minVal` & `maxVal`: Oscillation bounds.
     - `waveform`: `'static' | 'sine' | 'triangle' | 'perlin' | 'random_walk'`.
     - `frequency`: Cycles per minute (`0.05` Hz to `2.0` Hz).
3. **`UndoActionEntry` (Universal Undo Stack)**:
   - Stores pre-mutation snapshots of `SpatialGraphNode[]`, widget states, and any reversible agent action descriptions so the user can revert any voice or manual mutation with a single click (`Cmd/Ctrl + Z`).

### Interactive Component & State Mapping

- **Modifier Clutch & Attention Spectrum Switcher**:
  - Switching between **HUD Overlay Mode**, **Ambient TV Mode**, and **Tactile Engagement Mode** updates the scene environment lighting, background alpha/wallpaper simulation, and pointer-events clutch behavior. In HUD Overlay Mode, holding `Alt` / `Option` (or toggling the clutch lock in the bottom dock) switches between click-through passivity and active 3D raycast grabbing.
- **Push-to-Talk Voice-Hold Gesture**:
  - `pointerdown` + hold on a Bubble (or holding `Space` while hovering/selecting a Bubble) starts `SpeechRecognition`, activates the 3D audio-reactive ring around the Bubble, and damps its velocity to zero.
  - On `pointerup` / key release, the captured transcript and the Bubble's `SpatialGraphNode` JSON are POSTed to `/api/gemini/agent-harness`.
  - While awaiting response, `node.visualEffect` transitions to `'single_particle_spark'` (or `'refractive_shimmer'`). When the JSON tool mutation returns, the previous state is pushed to `undoStack`, the Bubble's facets update, and a staggered 3D character backflip animation plays across its title letters accompanied by a procedural Web Audio harmonic chord.
- **Passing Train Plucking**:
  - Gmail messages and live webhook/commit events spawn on a curved spline track across the upper/lower perimeter as transient train cars with a 45-second `ttl`. Clicking or dragging a train car out of the stream converts its `archetype` from `'train_car'` to `'bubble'`, clears its `ttl` expiration, and calls `/api/gemini/fast-facet` (`gemini-3.1-flash-lite`) to enrich its 4 polyhedron faces.

### Key Sequences & Integrations

1. **Google Workspace OAuth Flow (Step 1 of Execution)**:
   - On approval of this plan, we will invoke `set_up_oauth` for Gmail (`gmail.modify`), Google Calendar (`calendar.events`), Google Drive (`drive.file`, `drive.readonly`), and Google Keep (`keep.readonly`), using Firebase Auth (`signInWithPopup` with `GoogleAuthProvider`) and strict in-memory token caching.
   - Any voice or click action that modifies external Workspace data (e.g., archiving/sending an email, rescheduling a Calendar event, or updating a Drive file) will first display the mandatory **Workspace Action Confirmation Modal** before calling the Google REST endpoint.
2. **Procedural Web Audio Synthesizer**:
   - Zero external audio files. Uses the browser's `AudioContext` to synthesize subtle glass marimba taps on Bubble hover, mechanical clacks on Split-Flap board refreshes, coaster bead rolling clicks, and warm harmonic chimes when an agent task completes (with a global Mute toggle in the bottom dock).
