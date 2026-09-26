# Definition of Done (DoD): Sutradhar AI

This document establishes the binding criteria required to sign off on each milestone, component, and engineering loop of **Sutradhar AI** (`SIH26133`).

---

## 1. Global Baseline DoD (Applies to All Loops)

Before any loop is marked complete, it must satisfy these five universal criteria:
1. **Zero TypeScript Errors**: `npx tsc --noEmit` exits with status `0`.
2. **Clean Production Build**: `npm run build` succeeds without warnings or bundle failures.
3. **Strict Fidelity to Frozen Stitch Benchmark**: Screen layouts, colors, typography, and spacing match Stitch Project `17303241276460966652` without unsolicited redesigns.
4. **Synthetic Data & Safety Compliance**:
   - Zero real patient health information (PHI).
   - Prominent prototype notices (`PROTOTYPE • SYNTHETIC DATA`).
   - Assistive AI labeling (`ASSISTIVE RISK SIGNAL`, `OPERATIONAL EXPLANATION`) with deterministic fallback rules.
   - Zero unsupported medical diagnosis or clinical validation claims.
5. **Mobile Viewport Conformance**: Renders seamlessly at 390px mobile viewport without horizontal page overflow or clipping.

---

## 2. Milestone-Specific Definition of Done

### 2.1 Foundation (Loop 0) — Status: COMPLETE
- [x] Vite + React 18 + TypeScript + Tailwind CSS initialized.
- [x] Exact Stitch design system tokens configured in `tailwind.config.js` (colors, spacing, radii, typography).
- [x] Base global CSS (`index.css`) establishes overscroll suppression and safe area insets (`pt-safe`, `pb-safe`).
- [x] Google Fonts (`Public Sans`, `JetBrains Mono`) and `Material Symbols Outlined` linked in `index.html`.
- [x] Complete synthetic data structures (`beneficiaries`, `facilities`, `careGaps`, `referrals`, `metrics`) and TypeScript contracts created.
- [x] React Router DOM dependency configured with foundational status entry point.
- [x] Full project-control documentation suite created (`ARCHITECTURE.md`, `DESIGN_SYSTEM.md`, `STITCH_SPECIFICATION.md`, `PRODUCT_SPEC.md`, `DESIGN_SPEC.md`, `LOOP_ENGINEERING.md`, `DEFINITION_OF_DONE.md`).
- [x] Automated checks verified: `npm install`, `npx tsc --noEmit`, `npm run build`, and `vite` dev startup (HTTP 200).

### 2.2 Shared App Shell & Design System (Loop 1)
- [ ] Top App Header rendered with branding (`Sutradhar AI`), SIH tag (`SIH26133`), live cache indicator, and role dropdown (`Frontline (ASHA)` vs `Facility (Clinician)`).
- [ ] Fixed Bottom Navigation Bar rendered with all 5 tabs and active state indicators.
- [ ] Base Card primitives, Inset Wells, and Alert Cards with vertical accent strips implemented.
- [ ] Standard Button variants (Primary Blue, Secondary High-Surface, Resolution Green, Destructive Outline) adhere to $\ge 48\text{ px}$ touch footprint.
- [ ] Status Pills implemented with matching semantic colors and pulsing dot animations.
- [ ] Floating Toast notification container operational.

### 2.3 Feature Screen 1: Frontline Worker Dashboard (Loop 2)
- [ ] 5-card Operational Priority Matrix renders correct KPI counts and badges (`2 CRITICAL`, `IN TRANSIT`, etc.).
- [ ] Priority 1 Care Gap Alert card for Sunita Devi displays patient tags, gestational age, vitals, and expandable accordion details.
- [ ] Action buttons ("Initiate Follow-up", "View Gap") trigger appropriate workflows.
- [ ] Verification Pending card (Ramesh Chandra) and Referral Dispatch card (Anjali Soren) rendered faithfully.
- [ ] Recent audit activity log displays chronological entries with correct iconography.

### 2.4 Feature Screen 2: Care Gap Center (Loop 3)
- [ ] Urgency Header Banner highlights breached surveillance window (48h expired).
- [ ] Root-Cause Triplet (**DETECT $\rightarrow$ PREDICT $\rightarrow$ EXPLAIN**) rendered with high contrast.
- [ ] Chronological Evidence Trail displays 4 timestamped events with vertical connective line.
- [ ] Contextual road transit barrier preview card displayed.
- [ ] Action deck ("Start Follow-up Protocol", "Find Alternative Facility", "Simulate Arrival") provides interactive feedback.

### 2.5 Feature Screen 3: Smart Referral & Hospital Routing (Loop 4)
- [ ] 40 km Catchment Vector Map rendered via pure SVG (`viewBox="0 0 380 260"`).
- [ ] Map contains topo grid, highway corridors, rural arterials, animated patient radar pulse, and all 5 facility markers.
- [ ] Facility comparison stack clearly contrasts CHC Bikrampur (Recommended: MgSO4 in stock) against PHC Kalyanpur (Depleted stock callout).
- [ ] Interactive facility selection updates the fixed bottom dispatch bar.
- [ ] "Confirm & Generate Digital Token" triggers referral creation.

### 2.6 Feature Screen 4: Facility & Clinician Dashboard (Loop 5)
- [ ] Receiving clinician intake queue displays inbound referrals with live ETA telemetry.
- [ ] Diagnostic vital statistics strip rendered in tabular monospace font.
- [ ] Arrival Handshake Module provides token input box (`SH-28491`) and camera scan trigger.
- [ ] Single-tap "Simulate Handshake: REACH = TRUE" triggers arrival verification.
- [ ] Revealing Arrival Success Banner displays OPD Desk 2 assignment and SMS confirmation.

### 2.7 Feature Screen 5: Referral Details & Handshake Token (Loop 6)
- [ ] Back-button navigation header operational (`history.back()`).
- [ ] 5-stage Care Journey Progress Stepper highlights active transit stage (*Reach Pending*).
- [ ] Hero Token Card prominently displays passcode `SH-28491` (with one-tap copy) and referral ID `REF-2026-00125`.
- [ ] High-contrast SVG QR Matrix rendered with 4 L-shaped CSS corner brackets and central shield emblem.
- [ ] SMS dispatch status notice and full clinical dossier rendered.

### 2.8 Routing & End-to-End Golden Demo State (Loop 7)
- [ ] React Router connects all 5 screens with active navigation links.
- [ ] Role switcher toggles perspectives between Frontline ASHA and Facility Clinician.
- [ ] Golden Demo user journey (Sunita Devi: Screening $\rightarrow$ Care Gap $\rightarrow$ Referral $\rightarrow$ Handshake $\rightarrow$ Intake) operates end-to-end without page refreshes or breaks.

### 2.9 Integrations & Simulation Layer
- [ ] Simulated ABDM / ABHA validation adapters operational with synthetic health IDs.
- [ ] Simulated SMS gateway confirms dispatch to beneficiary mobile numbers.
- [ ] Offline caching simulator demonstrates offline state persistence and deterministic resync.

### 2.10 Final Judge/Demo Hardening (Loop 8)
- [ ] "Reset Demo State" control restores initial prototype data cleanly.
- [ ] Zero console errors or unhandled promise rejections.
- [ ] Visual polish strictly matches the frozen Stitch project under full inspection.
- [ ] Judge presentation walk-through script verified against the Three Delays framework.
