# Spatial Information & Task Canvas: Unified Architectural Concept

## 1. The Core Philosophy: Ambient Presence, Zero Guilt
Rather than an exhaustive task manager, inbox, or IDE replacement, this system is an **ambient presentation and lightweight interaction layer** over your real work:

*   **Ephemerality Over Ingestion (Zero Guilt):**
    *   The canvas is *not* an exhaustive inbox. It does not track every notification, email, or message.
    *   Passing items drift into view once. If ignored, they simply glide away and do not return. There is no creeping backlog or unread count.
*   **Glanceable Summaries (Not Deep Work):**
    *   Polyhedra present concise 1-to-2 sentence summaries, status updates, or high-level decisions.
    *   Deep work (e.g., reviewing a 400-line PR, writing a long document) is explicitly offloaded: clicking through opens the native OS application (VS Code, browser, terminal).
*   **The Attention Spectrum:**
    *   *Peripheral HUD Mode:* Runs as a translucent Windows overlay. Click-through by default; holding a modifier key enables interaction.
    *   *Ambient TV / Living Mode:* Low-interaction presentation mode where life and updates glide past without requiring management.
    *   *Tactile Engagement Mode:* Intervene via touch, pen, or voice to nudge, cluster, or speak changes.

---

## 2. Object Archetypes & Taxonomy

### A. Faceted Polyhedra / "Bubbles" (Typed Graph Cards)
*   **What They Are:** A Bubble is fundamentally a **typed graph object or Kanban/Trello-style card** wearing 3D spatial visuals. Rather than rigid, hard-coded sides, it dynamically maps whatever properties exist on that typed node (title, summary, status, source link, quick actions, revision history) onto the faces of the shape.
*   **Physics Participation:** Bubbles participate fully in the canvas physics engine—they drift, respond to gravity wells, can be grabbed, clustered, or spoken to.
*   **Interaction:** Rotate to inspect facets; double-click/tap to open native context; hold modifier to drag or group.

### B. Playful "Widgets" (Self-Contained Visual Contraptions)
*   **What They Are:** Unlike individual floating Bubbles, a Widget is a larger, self-contained visual structure or mini-visualization that holds and displays multiple items using its own internal motion rules.
*   **Physics Participation:** Individual sub-items inside a widget (like beads or tiles) are *not* subject to global canvas gravity or free-dragging; they follow the widget's internal choreography and offer hover/click inspection.
*   **Core & Brainstormed Widget Concepts:**
    *   *1. The PR Bead Roller Coaster (Wire Loop):* A miniature 3D wire track where colored beads representing open PRs roll up and along the coaster as they progress through stages (opened, CI running, review, ready to merge). Hover over any bead to inspect its summary; click to open GitHub.
    *   *2. The Tetris / Icicle Graph:* To-dos or project hierarchies displayed as an icicle partition chart whose rectangular tiles slowly settle, shift, or stack like low-gravity Tetris blocks. Every tile is clickable and color-coded by category or urgency.
    *   *3. Commit Pachinko / Plinko Board:* New commits or webhook events drop from the top as tiny glowing marbles, bouncing down through pegs (linting, unit tests, build checks) before settling into "Ready" or "Broken" catch-basins.
    *   *4. The Repo Orrery (Planetary Rings):* A miniature mechanical solar system where a core project is the center orb, active branches orbit on thin rings as planets, and open PRs/issues orbit those branches as tiny moons.
    *   *5. Thermal Lava Tube (Active Jobs):* A small vertical glass cylinder where long-running tasks or agent builds rise and fall like glowing wax blobs based on activity heat.
    *   *6. Split-Flap Digest Board:* A tiny retro train-station clacker board that physically flips its character tiles with a kinetic ripple whenever the 10-minute LLM summary job refreshes.

### C. Passing Trains (Transient Information Streams)
*   **Behavior:** Lightweight data streams (emails, tweets, feed items) that drift across the screen on a path.
*   **Interaction:** Reach in to pluck and anchor an item into a persistent Bubble; otherwise let it drift off-screen when its timer expires.

---

## 3. Physics Sandbox, Forces & Live Debug Menu

Rather than hard-coding a single static layout, movement is driven by a **parametric force system** tuned interactively via an on-screen **Debug & Oscillator Menu**:

*   **5–6 Composable Force / Gravity Modes:**
    1.  *Free-Floating Drift:* Gentle ambient wander with drag/damping.
    2.  *Edge / Perimeter Gravity:* Soft attraction toward screen borders and corners to keep the center workspace clear.
    3.  *Mutual Node Pull / Repulsion:* Typed nodes gently pulling toward related nodes while keeping minimum spacing so text never overlaps.
    4.  *Orbital Swirl:* Subtle tangential force causing items to slowly circulate along an invisible path.
    5.  *Temporal Spine Gravity (Calendar Toggle):* Pulls timed items onto a chronological line when toggled on.
    6.  *TTL / Timeout Exit Yank:* When a transient item's lifetime timer expires, a directional gravity vector gently yanks it off the edge of the screen and despawns it.
*   **Live Debug & Wave-Modulation Menu:**
    *   An inspectable overlay panel with sliders for every force weight, speed limit, damping factor, and timer duration.
    *   *Dynamic Oscillation (Min/Max + Wave Functions):* Instead of static numbers, any parameter can be given a `[Min, Max]` range driven by a selectable periodic or noise function (e.g., Sine wave, Triangle wave, Perlin/Simplex noise) with adjustable frequency—allowing the canvas to naturally "breathe" between calm and lively periods.
*   **Stillness on Approach:**
    *   Lively and ambient when left alone, but immediately damping velocity when your cursor or finger approaches so you never chase a moving target.

---

## 4. Visual Polish & Kinetic Typography ("Pizzazz")

*   **Expressive, Kinetic Typography:**
    *   Text on bubbles and widgets shouldn't look like flat, static HTML forms.
    *   Using character-splitting and 3D text shaders, letters can sit at playful angles, ripple on arrival, or occasionally perform a kinetic flourish (e.g., title letters doing a quick staggered backflip or wave when a task updates or idles).
*   **"In-Progress" & Active State Indicators:**
    *   *Single-Particle Spark:* An active or delegated item collapses/dims into a subtle orb with a single orbiting spark particle to signify live work without clutter.
    *   *Shimmering:* A refractive shader wave passing across the polyhedron's surface.
    *   *Spinning / Gyroscopic Motion:* Increased axial spin cadence while a task or build executes, settling back to still when ready.

---

## 5. Direct Modality Synergy & Agent Harness

*   **Modifier-Gated Click-Through:**
    *   *Default State:* Completely transparent to input (`WS_EX_TRANSPARENT`).
    *   *Engaged State:* Holding a designated modifier key catches input for grabbing, rotating, or clustering.
*   **Deictic Voice -> Agentic Harness Pass-Through:**
    *   When you hold a Bubble and speak (*"Push this to Friday"* or *"Comment that tests are passing"*), the mechanics are dead simple: the app bundles `{ card_graph_json + spoken_transcript }` and passes it to an external **Agentic Harness / Tool Runner**.
    *   The agent executes standard tool calls (mutating the card's properties or calling an external GitHub/task API) and returns the updated state. A universal **Undo** reverts the state if needed.
*   **Magnetic Spatial Clustering:**
    *   Holding a grouping modifier and pushing bubbles together snaps them into a visual constellation ("keep these together in mind") without forcing batch execution.

---

## 6. V1 Telemetry & Ingestion Pipeline

*   **Initial Data Sources (V1):**
    1.  *Personal To-Dos & Voice Notes:* Spoken or typed directly into floating graph cards.
    2.  *GitHub Dev Activity:* Starts with mocked PR/commit payloads for visual tuning, followed by a simple 10-minute polling/webhook loop where a lightweight LLM summarizes recent PR/build activity into concise card facets and Widget bead states.
    3.  *(Deferred)* *Calendar Feed:* Skipped for initial hookup; mocked only when testing the Temporal Gravity toggle.
*   **Platform Substrate:**
    *   *Windows Overlay (Surface / Zenbook / Desktop):* DirectComposition / layered click-through window hosting a WebGL/Three.js or native GPU canvas.
    *   *Ambient Display:* Smart TV / idle monitor screensaver mode.