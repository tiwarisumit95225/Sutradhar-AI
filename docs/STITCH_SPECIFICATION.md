# Stitch Screen Specification Reference

> **Frozen Source Project**: `projects/17303241276460966652`

This document indexes the five frozen screens in the connected Stitch project for future implementation loops:

### Screen 1: Frontline Worker Dashboard
* **Screen ID**: `1ec7806770124bf393fc96dca25ccaf6`
* **Resolution**: 780 × 4522 (Mobile)
* **Components**:
  * Top app bar with ASHA role switcher & cache sync status
  * Operational Priority Matrix (5 KPI cards)
  * Priority 1 Care Gap Alert card (Sunita Devi) with expand/collapse vitals
  * Verification Pending card (Ramesh Chandra)
  * Referral Dispatch Pending card (Anjali Soren)
  * Recent audit activity log
  * Persistent 5-tab bottom navigation bar

### Screen 2: Care Gap Center
* **Screen ID**: `3846fb86f99349ed8773bee86fba35e9`
* **Resolution**: 780 × 5684 (Mobile)
* **Components**:
  * Root cause reasoning: Detect $\rightarrow$ Predict $\rightarrow$ Explain
  * Chronological evidence & timestamp trail (14 Sep – 26 Sep)
  * Transit barrier and road constraint analysis
  * Follow-up protocol dispatch actions

### Screen 3: Smart Referral & Hospital Routing
* **Screen ID**: `45d8714988644cc796513534bd063375`
* **Resolution**: 780 × 3782 (Mobile)
* **Components**:
  * 40km Catchment Vector Map with SVG topography & transit animation
  * Live facility stock comparison (SC Rampur, PHC Kalyanpur, CHC B Bikrampur, DH Sadar)
  * Automated recommendation callout with stock provenance
  * Floating dispatch confirmation bar

### Screen 4: Facility & Clinician Dashboard
* **Screen ID**: `57797c22865041119bf3b2a9376b0fe1`
* **Resolution**: 780 × 3266 (Mobile)
* **Components**:
  * Clinician incoming intake roster (Sunita Devi, Vikas Kumar, Parvati Bai)
  * Real-time transit telemetry (ETA ~18 min, 4.2 km remaining)
  * Arrival Handshake Scanner Module (`SH-28491` input & camera scan trigger)
  * Arrival Success Banner (`REACH = TRUE`) & OPD Desk 2 routing

### Screen 5: Referral Details & Handshake Token
* **Screen ID**: `649a1991856d424287a7b14eb09d6473`
* **Resolution**: 780 × 3544 (Mobile)
* **Components**:
  * Visual care journey progress tracker (5 stages)
  * Hero Digital Handshake Token Card with passcode `SH-28491`
  * High-contrast SVG QR Matrix with corner framing brackets
  * SMS dispatch status confirmation
  * Patient clinical dossier
