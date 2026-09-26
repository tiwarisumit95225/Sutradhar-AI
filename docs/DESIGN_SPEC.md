# Design Specification: Sutradhar AI

**Theme Name:** Rural Care Orchestration  
**Frozen Visual Source of Truth:** Stitch Project `17303241276460966652` (`projects/17303241276460966652`)  
**Design Paradigm:** Corporate / Modern Utilitarian Field Architecture  
**Target Viewport:** Mobile-first (CSS: 390px width / Canvas: 780px @2x, `viewport-fit=cover`)

---

## 1. Frozen Visual Source of Truth & Philosophy

The user interface of Sutradhar AI is governed by the frozen design state captured in Google Stitch. It rejects consumer-tech embellishments, frosted glass blurs that degrade contrast under direct sunlight, and decorative gradients. 

### Core Design Pillars
1. **Field Ergonomics & Sunlight Resilience**: Utilitarian contrast ratios (exceeding WCAG AAA for primary clinical data) ensuring legibility on low-cost IPS mobile screens under harsh Indian ambient sunlight.
2. **Deterministic Color Semantics**: Every color signifies an unambiguous operational state: clinical urgency (crimson), verified resolution (forest green), active transit (amber/navy), or institutional structure (slate).
3. **Touch-Safe Outdoor Target Footprint**: Every interactive element enforces an absolute vertical footprint of $\ge 48\text{ px}$ with $\ge 8\text{ px}$ exterior clearance to prevent accidental touches during bumpy transit or single-handed field operation.
4. **Transparent Assistive Intelligence**: Algorithmic recommendations are visually partitioned from clinical facts, labeled with standardized nomenclature (`ASSISTIVE RISK SIGNAL`, `OPERATIONAL EXPLANATION`), and bound to human confirmation toggles.

---

## 2. Screen Inventory

| Screen Name | Stitch Resource ID | Resolution | Primary Role | Layout Shell |
|---|---|---|---|---|
| **Frontline Worker Dashboard** | `1ec7806770124bf393fc96dca25ccaf6` | 780 × 4522 px | Frontline ASHA | Fixed Header + Scrollable Ticker & Roster + Fixed Bottom Nav |
| **Care Gap Center** | `3846fb86f99349ed8773bee86fba35e9` | 780 × 5684 px | ASHA Supervisor | Fixed Header + Stepper + Deep Diagnostic Accordions + Fixed Bottom Nav |
| **Smart Referral & Hospital Routing** | `45d8714988644cc796513534bd063375` | 780 × 3782 px | Medical Officer / ANM | Fixed Header + SVG Vector Map + Facility Comparison Stack + Fixed Dispatch Bar |
| **Facility & Clinician Dashboard** | `57797c22865041119bf3b2a9376b0fe1` | 780 × 3266 px | CHC Clinician | Fixed Header + Telemetry Roster + Handshake Scan Deck + Fixed Bottom Nav |
| **Referral Details & Handshake Token** | `649a1991856d424287a7b14eb09d6473` | 780 × 3544 px | Patient / ASHA | Back Button App Bar + 5-Stage Stepper + Hero QR Token Card + Clinical Dossier |

---

## 3. Navigation Structure & App Shell

```
┌────────────────────────────────────────────────────────────────────────┐
│ Fixed Header (h-20, pt-safe, bg-surface/90, backdrop-blur-xl)          │
│ [Brand: Sutradhar AI + SIH26133]  [Cache Synced]  [Role Dropdown] [👤] │
├────────────────────────────────────────────────────────────────────────┤
│ Scrollable Main Viewport (pt-20, pb-24, overflow-x-hidden)             │
│                                                                        │
│ • Screen 1: Dashboard (KPI Matrix, Patient Priority Roster)            │
│ • Screen 2: Care Gap Center (Detect-Predict-Explain, Evidence Trail)    │
│ • Screen 3: Smart Referral (Vector Network Map, Facility Selector)     │
│ • Screen 4: Facility Dashboard (Queue, Handshake Scanner Deck)         │
│ • Screen 5: Handshake Token (5-Step Tracker, Passcode, QR Matrix)     │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│ Fixed Bottom Nav (h-16, pb-safe, bg-surface-container-lowest/95)       │
│ [Dashboard]   [Screening]   [Referrals]   [Care Gaps]   [District]    │
└────────────────────────────────────────────────────────────────────────┘
```

* **Role Switcher Dropdown**: Anchored in the top header. Allows toggling between `Frontline (ASHA)` and `Facility (Clinician)`.
* **Detail Back Button (Screen 5)**: Standard app bar replaced with a navigation back button (`history.back()`) paired with `Patient Clinical Dossier` title and security lock tag.
* **Persistent Bottom Navigation Tabs**:
  * `space_dashboard`: **Dashboard** (Screen 1)
  * `clinical_notes`: **Screening**
  * `local_hospital`: **Referrals** (Screens 3 & 4)
  * `crisis_alert`: **Care Gaps** (Screen 2)
  * `analytics`: **District Intel**

---

## 4. Typography Scale

The system utilizes **Public Sans** for display, headings, body copy, and user actions, and **JetBrains Mono** for numerical figures, tokens, and audit hashes:

```
headline-xl         32px / 40px  | Bold (700)     | tracking: -0.02em
headline-xl-mobile  24px / 32px  | Bold (700)     | tracking: -0.01em
headline-lg         24px / 32px  | Semibold (600) | tracking: -0.01em
headline-md         20px / 28px  | Semibold (600) | tracking: normal
headline-sm         16px / 24px  | Semibold (600) | tracking: normal
body-lg             16px / 24px  | Regular (400)  | tracking: normal
body-md             14px / 20px  | Regular (400)  | tracking: normal
body-sm             12px / 16px  | Regular (400)  | tracking: normal
label-lg            14px / 20px  | Semibold (600) | tracking: 0.01em
label-md            12px / 16px  | Semibold (600) | tracking: 0.02em
label-sm            11px / 14px  | Medium (500)   | tracking: 0.02em
code-sm             12px / 16px  | Medium (500)   | Monospace
code-xs             10px / 14px  | Medium (500)   | Monospace, tracking: 0.04em
```

---

## 5. Color Palette (Material 3 Utilitarian)

| Semantic Token | Hex Code | Purpose & Application |
|---|---|---|
| `primary` | `#0037b0` | Deep Institutional Slate Blue. Structural titles, icons, branding. |
| `primary-container` | `#1d4ed8` | High-Priority Action Blue. Primary buttons, selected tab pills. |
| `on-primary` | `#ffffff` | Pure white text and icons on primary surfaces. |
| `on-primary-container` | `#cad3ff` | Subtle highlight text on primary container fills. |
| `surface` | `#f8f9ff` | Cool Tinted Slate Canvas. Page background base. |
| `surface-container-lowest` | `#ffffff` | Pure White Base for all primary card containers. |
| `surface-container-low` | `#eff4ff` | Subtle Inset Well for nested data lists and sub-banners. |
| `surface-container` | `#e5eeff` | Neutral container fill for patient summary headers. |
| `surface-container-high` | `#dce9ff` | Elevated control backgrounds, secondary buttons, inputs. |
| `surface-container-highest`| `#d3e4fe` | Interactive focus and hover fills. |
| `on-surface` | `#0b1c30` | Dominant Navy Slate. Primary body text and patient names. |
| `on-surface-variant` | `#434655` | Muted Secondary Slate. Labels, timestamps, and subtitles. |
| `tertiary` | `#005022` | Resolution Forest Green. Verified records, active sync, safe vitals. |
| `tertiary-container` | `#006b2f` | Dark Green Fill for success confirmation banners. |
| `tertiary-fixed` | `#95f8a7` | Light Mint Accent for verified badges and pulsing success tags. |
| `error` | `#ba1a1a` | Care-Gap Crimson. High-risk alerts, window breaches, danger flags. |
| `error-container` | `#ffdad6` | Soft Pink Fill for urgent alert cards and warning chips. |
| `on-error-container` | `#93000a` | Deep Red Text on alert containers. |
| `secondary` | `#565e74` | Slate Neutral for intermediate metadata and inactive indicators. |
| `secondary-container` | `#dae2fd` | Soft Periwinkle for in-transit chips and selected outlines. |
| `outline` | `#747686` | Boundary strokes for dividers and borders. |
| `outline-variant` | `#c4c5d7` | Subtle hairline dividers (`0.8px` strokes). |

---

## 6. Spacing, Margins & Corner Radii

* **Outer Layout Margins**:
  * Mobile default: `px-margin` = `1rem` (16px)
  * Tablet breakpoint: `margin-tablet` = `1.5rem` (24px)
  * Desktop max-bound: `margin-desktop` = `2rem` (32px)
* **Spatial Step Scale**:
  * `space-xs`: `0.25rem` (4px)
  * `space-sm`: `0.5rem` (8px)
  * `space-md`: `1rem` (16px)
  * `space-lg`: `1.5rem` (24px)
  * `space-xl`: `2rem` (32px)
* **Corner Radii Hierarchy**:
  * Small inputs / badges: `rounded-lg` (`0.25rem` / 4px)
  * Primary cards & containers: `rounded-xl` (`0.5rem` / 8px)
  * Status chips, action pills, avatars: `rounded-full` (`9999px`)

---

## 7. Cards & Surface Elevation

Cards avoid heavy, blurred drop shadows. They rely on high-contrast surface stepping and low-deflection boundary shadows:
- **Resting Data Card**: `bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30`
- **Care-Gap / Critical Card**: Left-hand 4px semantic indicator bar (`border-l-4 border-error` or `w-1.5 bg-error`), container fill `bg-surface-container-lowest`.
- **Nested Inset Module**: `bg-surface-container-low p-space-sm rounded-lg`
- **Interactive Accordion**: Includes chevron toggle `toggleCardDetails(id)` to reveal hidden vitals and visit histories.

---

## 8. Button & Interactive Trigger System

Interactive triggers maintain a minimum `48px` vertical footprint:

1. **Primary Forward Action CTA**:
   `bg-primary text-on-primary py-3 px-space-md rounded-lg font-label-md font-bold min-h-[48px] shadow-sm active:bg-on-primary-fixed-variant transition-colors`
2. **Secondary / Utility Button**:
   `bg-surface-container-high text-on-surface hover:bg-surface-container-highest py-3 px-space-md rounded-lg font-label-md font-bold min-h-[48px] active:bg-secondary-container transition-colors`
3. **Resolution / Verification Button**:
   `bg-tertiary text-on-tertiary py-3 px-space-sm rounded-lg font-label-md font-bold min-h-[48px] shadow-sm active:bg-tertiary-container`
4. **Destructive / Transfer Button**:
   `bg-surface-container-high text-error font-label-md font-semibold min-h-[48px] rounded-xl active:bg-surface-container-highest`

---

## 9. Status Badges & Priority Chips

All badges utilize compact pill geometry (`rounded-full`) with deterministic semantic pairs:

* **High Risk / Critical Deficit**: `bg-error-container text-on-error-container font-code-xs font-bold px-space-xs py-0.5 rounded-full` (with pulsing red indicator ring).
* **In Transit / Active Referral**: `bg-secondary-container text-on-secondary-container font-code-xs font-bold uppercase px-space-xs py-0.5 rounded-full`.
* **Verified / In Lab / Evidenced**: `bg-tertiary-fixed text-on-tertiary-fixed-variant font-code-xs font-bold px-1.5 py-0.5 rounded-full`.
* **Online & Synced**: `bg-surface-container-lowest text-tertiary shadow-sm px-space-sm py-1 rounded-full font-code-xs font-semibold` (with pulsing green indicator).

---

## 10. Map Section Specification (Catchment Vector Network)

Implemented in **Screen 3** with a summary preview in **Screen 2**:
* **Format**: Offline-resilient pure SVG vector graphic (`viewBox="0 0 380 260"`).
* **Grid**: 24px topographical grid pattern (`stroke="#d3e4fe"` at `0.8px` width).
* **Corridors**:
  * District Highway: Heavy 5px curved path (`stroke="#bec6e0"`).
  * Rural Arterials: 2px dashed arterial path (`stroke="#c4c5d7" stroke-dasharray="3,3"`).
* **Network Markers**:
  1. `(70, 190)`: Sub-Center Rampur (Origin, 0.8 km).
  2. `(115, 140)`: Patient Marker (Sunita Devi) with animated concentric pulse ring and label `📍 Sunita (Rampur)`.
  3. `(160, 90)`: PHC Kalyanpur (6 km) — Red deficit callout `CBC No Reagents`.
  4. `(230, 110)`: CHC B Bikrampur (12.4 km / 35 min) — Active green recommendation target with recommendation badge `★ CHC Bikrampur`.
  5. `(320, 50)`: District Hospital Sadar (35.2 km) — Tertiary backup marker.

---

## 11. Digital Handshake & Token Specification

Enforces the operational handshake in **Screen 5** (presentation) and **Screen 4** (intake):
* **Numerical Passcode**: `SH-28491` rendered in 36px bold JetBrains Mono.
* **Referral Token ID**: `REF-2026-00125` with one-tap copy button.
* **Synthetic High-Contrast SVG QR Matrix**:
  * Three $7\times 7$ position-detection corner patterns with internal concentric modules.
  * Timing patterns and pseudo-random matrix representation.
  * Centered Sutradhar shield emblem watermark.
  * Framed by 4 L-shaped corner brackets (`border-t-2 border-l-2 border-primary`).
* **SMS Dispatch Notice**: Explicit notice confirming SMS delivery to `+91 98XXX-XX412`.
* **Arrival Verification (`REACH = TRUE`)**:
  * Clinician enters `SH-28491` or scans QR.
  * Dynamic confirmation banner reveals: *"Arrival Confirmed: Operational Handshake (REACH = TRUE) • Assigned to OPD Desk 2 (Dr. M. Verma) at CHC Bikrampur"*.

---

## 12. Offline & Sync User Experience

* **Persistent Header Indicator**: Displays `Cache Synced` with pulsing green dot when connected.
* **Sub-Banner Utility**: Informs user of offline caching: *"PROTOTYPE • SYNTHETIC DATA | Saved offline — will sync when connection is restored."*
* **Manual Force Sync CTA**: Allows manual sync retry with visual feedback.
* **Safe-Area Insets**: Uses `pt-safe` and `pb-safe` to avoid notch and home indicator clipping.
* **Scrollbar Suppression**: Native scrollbars suppressed (`::-webkit-scrollbar { display: none; }`) with `overscroll-behavior: none` for a native application feel.
