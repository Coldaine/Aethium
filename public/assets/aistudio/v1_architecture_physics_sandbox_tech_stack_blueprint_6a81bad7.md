# V1 Sandbox Spec, Physics Tuner & Widget Blueprint

*With the core product behavior locked in, here is the concrete blueprint for building the first playable prototype, along with the technical stack choices to consider.*

---

## 1. Locked-In V1 Architecture

*   **Bubbles = Typed Graph Cards:** Every Bubble is a JSON graph node (like a Trello/Kanban card) with flexible properties (`id`, `type`, `title`, `summary`, `status`, `links`, `actions`, `ttl`) rendered onto a 3D shape.
*   **Voice + Hold = Agent Harness Pass-Through:** Holding an object and speaking sends `{ object_json, voice_transcript }` directly to an agent harness. The harness runs standard tool calls to update the JSON node or trigger external APIs (like GitHub), backed by a simple state Undo stack.
*   **V1 Data Sources:**
    *   Local To-Dos & Quick Voice Notes.
    *   GitHub Activity (starting with mock PR JSONs, then a simple 10-minute cron/webhook summarized by a fast, lightweight LLM).
*   **Kinetic Typography ("Pizzazz"):** Character-level animation (letters on curves, staggered backflips on state change, subtle idle wave motion) so text feels alive rather than pasted on.

---

## 2. The Physics & Gravity Debug Menu (First Thing to Build)

Instead of guessing how objects should move, V1 will include an interactive **Physics & Oscillator Debug Panel** (like `lil-gui` or `Leva`) so you can dial in the feel live:

*   **Tunable Force Weights:**
    *   `driftStrength`: Ambient wandering force.
    *   `edgeGravity`: Pull toward screen borders/corners (positive = hug edges, negative = center).
    *   `mutualAttraction`: How strongly related cards pull toward each other (paired with short-range collision repulsion).
    *   `vortexTorque`: Gentle rotational orbit around the screen.
    *   `exitYankForce`: The directional gravity that gently pulls an item off-screen once its `ttl` (Time-To-Live) timer expires.
*   **Wave / Range Modulators (For Each Parameter):**
    *   `minVal` / `maxVal` sliders.
    *   `waveform`: `Static`, `Sine`, `Triangle`, `PerlinNoise`, or `RandomWalk`.
    *   `frequency`: How fast the force oscillates between Min and Max.

---

## 3. Widget Catalog (Self-Contained Contraptions)

Widgets live alongside Bubbles on the screen, holding collections of data with their own internal choreography rather than floating individually:

1.  **PR Bead Roller Coaster (Your Idea):** A 3D wire loop/coaster where colored beads represent active PRs. Beads roll forward as PRs move from Draft $\rightarrow$ Open $\rightarrow$ CI Passing $\rightarrow$ Approved. Hover a bead to read the LLM summary; click to open the PR.
2.  **Tetris / Icicle Task Graph (Your Idea):** A hierarchical icicle partition chart of your to-dos where rectangular tiles slowly settle or shift like low-gravity Tetris blocks. Clicking any block triggers its action or expands details.
3.  **CI/Commit Pachinko Board:** Commits drop in from the top as glowing marbles, bouncing off pins representing test stages before landing in "Merged/Green" or "Failed/Red" trays at the bottom.
4.  **Project Orrery (Orbital Rings):** Active repos sit at the center while branches and open PRs orbit on thin wire rings at different speeds based on recent commit activity.
5.  **Split-Flap Status Clacker:** A compact retro departure-board widget that physically flips letter tiles with a wave animation every 10 minutes when the LLM refreshes your high-level dev digest.

---

## 4. Next Decision: Choosing the Tech Stack to Prototype This

Since we want **3D shapes**, **custom physics/gravity forces**, **kinetic 3D typography (backflips/ripples)**, **particle sparks/shimmers**, and a **live debug menu** that can easily wrap into a transparent Windows overlay (`Electron` or `Tauri` with click-through flags), here is the cleanest stack to build it in right now:

*   **Rendering & 3D:** `Three.js` (or `React Three Fiber` + `@react-three/drei`) for rapid 3D polyhedra, shaders, and camera control.
*   **Kinetic 3D Text:** `troika-three-text` + `GSAP` (or custom vertex shaders) so individual letters in 3D space can do backflips, waves, and curves smoothly.
*   **Physics & Custom Forces:** Custom force-directed step loop (or `d3-force-3d` / `rapier3d`) so we have 100% control over custom gravity wells, edge pull, and TTL exit yanks.
*   **Live Debug Menu:** `lil-gui` or `Leva` for instant sliders, min/max bounds, and waveform selectors.

**Would you like me to build a live, interactive browser prototype of this right now**—complete with the floating 3D bubbles, kinetic flipping text, the PR Bead Roller Coaster & Icicle widgets, and the live Gravity/Oscillator Debug Menu so you can start playing with the sliders?