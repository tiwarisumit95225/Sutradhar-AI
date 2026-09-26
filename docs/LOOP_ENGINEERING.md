# Loop Engineering Methodology: Sutradhar AI

## 1. Overview & Core Engineering Rule

All engineering and development on **Sutradhar AI** is conducted using the structured, iterative **Loop Engineering Lifecycle**:

$$\mathbf{SPECIFY} \longrightarrow \mathbf{IMPLEMENT} \longrightarrow \mathbf{RUN} \longrightarrow \mathbf{TEST} \longrightarrow \mathbf{REVIEW/FIX} \longrightarrow \mathbf{COMMIT} \longrightarrow \mathbf{NEXT\ LOOP}$$

> [!IMPORTANT]
> **Cardinal Engineering Rule**: Every loop possesses an explicit, non-negotiable **Definition of Done (DoD)**. No loop may be marked complete, and no subsequent loop may be initiated, until every DoD item has been verified through static typing, production builds, and visual verification against the frozen Stitch visual truth (`projects/17303241276460966652`).

---

## 2. The 7-Step Loop Lifecycle

### Step 1: SPECIFY
* Define loop boundaries, input artifacts, and target components/screens.
* Validate alignment with `PRODUCT_SPEC.md`, `DESIGN_SPEC.md`, and the Stitch frozen visual benchmark.
* Declare the exact files to be created or modified.

### Step 2: IMPLEMENT
* Author strictly typed React/TypeScript code using Tailwind CSS classes conforming to the established design system tokens.
* Enforce prototype boundaries: synthetic data only, assistive non-prescriptive AI, simulated external adapters.
* Zero redesigns: Reproduce the frozen Stitch layout, spacing, colors, and typography faithfully.

### Step 3: RUN
* Execute local dev environment tooling:
  ```bash
  npm run dev
  ```
* Verify server initialization, local listening ports, and route rendering.

### Step 4: TEST
* Execute mandatory automated verification checks:
  1. **TypeScript Typecheck**:
     ```bash
     npx tsc --noEmit
     ```
  2. **Production Build**:
     ```bash
     npm run build
     ```
  3. **Visual Verification**: Confirm viewport conformance (390px mobile base), asset rendering, and absence of layout overflow.

### Step 5: REVIEW / FIX
* Review file diffs and inspect build artifacts.
* Eliminate dead code, unused imports, lint errors, and CSS regressions.
* Confirm that no real patient data or ungrounded medical claims exist in the codebase.

### Step 6: COMMIT
* Verify that every criterion in the loop's Definition of Done is satisfied.
* Prepare a clear summary report detailing:
  - Files created or modified
  - Automated verification test results
  - Status against Definition of Done
* Record the milestone commit.

### Step 7: NEXT LOOP
* Proceed to the subsequent loop only upon explicit instruction or approved loop progression.

---

## 3. Master Loop Roadmap

| Loop | Milestone / Phase | Scope & Deliverables |
|:---:|---|---|
| **Loop 0** | **Foundation & Control Docs** | Project foundation, Vite + React + TS + Tailwind setup, design tokens, synthetic data structures, and foundational control documentation (`ARCHITECTURE.md`, `DESIGN_SYSTEM.md`, `STITCH_SPECIFICATION.md`, `PRODUCT_SPEC.md`, `DESIGN_SPEC.md`, `LOOP_ENGINEERING.md`, `DEFINITION_OF_DONE.md`). |
| **Loop 1** | **Shared App Shell & Design System Components** | Fixed top header (ASHA role switcher, sync status), fixed bottom navigation bar (5 tabs), status badges, base card primitives, and button components. |
| **Loop 2** | **Screen 1: Frontline Worker Dashboard** | 5-metric KPI Triage Matrix, Sunita Devi priority care-gap card with expandable accordion vitals, Ramesh Chandra verification card, Anjali Soren referral card, and audit log. |
| **Loop 3** | **Screen 2: Care Gap Center** | Root-cause analysis (Detect $\rightarrow$ Predict $\rightarrow$ Explain), chronological evidence trail, road transit constraints, and follow-up intervention action deck. |
| **Loop 4** | **Screen 3: Smart Referral & Hospital Routing** | 40 km Catchment Vector Map (SVG topography, animated transit pulses, facility markers), live inventory comparison stack, and bottom floating dispatch bar. |
| **Loop 5** | **Screen 4: Facility & Clinician Dashboard** | Clinician intake roster, real-time transit telemetry, arrival handshake verification module (`SH-28491` input & camera scan trigger), and dynamic `REACH = TRUE` success banner. |
| **Loop 6** | **Screen 5: Referral Details & Handshake Token** | 5-stage visual care journey stepper, hero token card with passcode `SH-28491`, high-contrast SVG QR matrix, SMS dispatch confirmation, and clinical dossier. |
| **Loop 7** | **End-to-End Navigation & Interactive State Flow** | Connect all 5 screens with client-side routing, shared state store (Sunita Devi referral and handshake lifecycle), and role switching. |
| **Loop 8** | **Judge/Demo Hardening & Production Polish** | Edge-case simulation controls (arrival simulation, offline mode toggle), performance optimization, judge walkthrough hardening, and final presentation readiness. |
