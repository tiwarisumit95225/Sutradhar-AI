# Sutradhar AI (`SIH26133`)

> **Rural Care-Gap Intelligence & Triage Decision Support**  
> Visual Truth: Stitch Project `17303241276460966652` (`projects/17303241276460966652`)

---

## Foundation Scope
This repository houses the frontend foundation for **Sutradhar AI**:
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS configured with the frozen Stitch `Rural Care Orchestration` design system
- **Routing**: React Router DOM (Foundation routes established)
- **Data Layer**: Synthetic demo-data models and TypeScript contracts (No backend, no live PHI)
- **Current Milestone**: Project foundation created and verified. Feature UI screens remain unmounted for subsequent implementation loops.

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

---

## Directory Structure
- `docs/`: Architecture, Design System tokens, and Stitch Screen Specifications
- `src/components/`: Reusable component shells (`common/`, `layout/`)
- `src/data/synthetic/`: Strongly typed synthetic data models (beneficiaries, facilities, referrals, care gaps)
- `src/routes/`: Router configuration
- `src/types/`: Domain type definitions
- `src/App.tsx`: App root
- `src/index.css`: Global styles & safe area handling
