# Design System: Rural Care Orchestration

## 1. Design Philosophy
- **High-Sunlight Contrast**: Optimized for low-cost displays in harsh outdoor ambient sunlight.
- **Deterministic Color Semantics**: Color is functional, never decorative. Encodes urgency, verification, and attention.
- **Touch-Safe Field Footprint**: Interactive triggers maintain a minimum `48px` touch target for one-handed operation.
- **Dual Typography**: Public Sans for administrative clarity; JetBrains Mono for audit logs, tokens, and numerical precision.

## 2. Palette Architecture
- **Primary Action Blue (`#0037b0` / `#1d4ed8`)**: Core interactive workflows and navigation anchors.
- **Institutional Navy (`#0b1c30`)**: Deep slate typography and dominant structural frames.
- **Resolution Green (`#005022` / Fixed `#95f8a7`)**: Confirmed handshakes, verified closures, local cache synced.
- **Care-Gap Crimson (`#ba1a1a` / Container `#ffdad6`)**: High-risk pregnancy escalation, breached intervals.
- **Pending Amber / In-Transit (`#d97706` / Container `#dae2fd`)**: Scheduled follow-ups, patient in transit.
- **Surfaces**:
  - Canvas Base: `#f8f9ff`
  - Base Card: `#ffffff`
  - Inset Well: `#eff4ff`

## 3. Typography Tokens
- `headline-xl` (32px / 40px, Bold)
- `headline-xl-mobile` (24px / 32px, Bold)
- `headline-lg` (24px / 32px, Semibold)
- `headline-md` (20px / 28px, Semibold)
- `headline-sm` (16px / 24px, Semibold)
- `body-lg` (16px / 24px, Regular)
- `body-md` (14px / 20px, Regular)
- `body-sm` (12px / 16px, Regular)
- `label-lg` (14px / 20px, Semibold)
- `label-md` (12px / 16px, Semibold)
- `label-sm` (11px / 14px, Medium)
- `code-sm` (12px / 16px, JetBrains Mono)
- `code-xs` (10px / 14px, JetBrains Mono)

## 4. Spacing Scale
- `space-xs`: `0.25rem` (4px)
- `space-sm`: `0.5rem` (8px)
- `space-md`: `1rem` (16px)
- `space-lg`: `1.5rem` (24px)
- `space-xl`: `2rem` (32px)
- `px-margin`: `1rem` (16px)
