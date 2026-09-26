# Architecture: Sutradhar AI

## 1. Executive Summary
**Sutradhar AI** (`SIH26133`) is an offline-first rural care-gap intelligence and triage decision support platform designed for public healthcare workforces (ASHA, ANM, and Primary Health Centre clinicians) operating in low-bandwidth, high-consequence environments.

## 2. Frozen Visual Source of Truth
The user interface and visual language are grounded in the connected **Stitch Project**:
- **Project ID**: `17303241276460966652` (`projects/17303241276460966652`)
- **Theme**: `Rural Care Orchestration`
- **Device Target**: Mobile (Viewport: 390px / Canvas: 780px)

## 3. Technology Stack Foundation
- **Core Framework**: React 18 + TypeScript (Strict typing enabled)
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3 (configured with Material 3 utilitarian semantic tokens)
- **Typography**: Public Sans (UI & labels) + JetBrains Mono (tokens, vitals, audit metrics)
- **Iconography**: Google Material Symbols Outlined
- **Client Routing**: React Router v6

## 4. Key Architectural Boundaries
1. **No Backend / Client-Side State Foundation**:
   Current milestone establishes the frontend architecture foundation and synthetic demo-data structures only. No live external backend or database is connected.
2. **Synthetic Data Isolation**:
   All patient names, vitals, ABHA IDs, RCH tokens, and coordinates are strictly synthetic and isolated under `src/data/synthetic/`.
3. **Deterministic Operational Handshake Principle**:
   Digital referral tokens (`REF-2026-00125`) and numeric passcodes (`SH-28491`) acknowledge physical facility arrival (`REACH = TRUE`), explicitly separating transit verification from clinical diagnosis or cure.

## 5. Folder Hierarchy
```
C:\projects\Sutradhar-AI\
├── docs/                      # Architectural & design system specifications
├── public/                    # Static assets & favicons
├── src/
│   ├── assets/                # Logos & graphics
│   ├── components/            # Reusable UI components
│   │   ├── common/            # Buttons, Badges, Modals, Cards
│   │   └── layout/            # App Header, Bottom Nav, Layout Shells
│   ├── data/
│   │   └── synthetic/         # Synthetic beneficiary, facility & gap models
│   ├── routes/                # Client routing configuration
│   ├── types/                 # TypeScript interfaces and contracts
│   ├── App.tsx                # Application root
│   ├── index.css              # Global styles & Tailwind base layers
│   └── main.tsx               # DOM mount entry point
├── index.html                 # HTML shell with Google Fonts & viewport
├── package.json               # Node dependencies & build scripts
├── tailwind.config.js         # Stitch design token mapping
└── tsconfig.json              # TypeScript compilation rules
```
