# Product Specification: Sutradhar AI

**System Identifier:** `SIH26133`  
**Working Title:** Sutradhar AI — Rural Care-Gap Intelligence & Triage Decision Support  
**Target Viewport:** Mobile-first (390px base / 780px canvas)  
**Visual Benchmark:** Connected Stitch Project `17303241276460966652`

---

## 1. Executive Purpose & SIH26133 Context

### 1.1 Problem Context
In rural Indian public healthcare delivery, frontline healthcare workers (Accredited Social Health Activists / ASHAs and Auxiliary Nurse Midwives / ANMs) capture vast volumes of vital screening data on paper registers or siloed portals. However, when a beneficiary develops high-risk clinical symptoms or misses a mandatory diagnostic window (e.g., ANC-3 ultrasound, Pentavalent-3 vaccination, quarterly NCD HbA1c check), the care continuum breaks down:
- **Care deficits go undetected** until emergencies arise.
- **Referrals are unguided paper slips** issued without verifying whether receiving facilities have functioning equipment or essential stock (e.g., Magnesium Sulfate).
- **Referral tracking is one-way**: Primary facilities have no visibility into whether a referred patient ever physically arrived or was lost in transit.

### 1.2 Purpose of Sutradhar AI
**Sutradhar AI** (`SIH26133`) bridges the primary-to-secondary care divide by providing **closed-loop Care-Gap Intelligence**. Acting as an intelligent digital coordinator ("Sutradhar"), it transforms static screening data into proactive triage, dynamically routes patients to facilities with verified inventory and personnel, and enforces closed-loop physical handshakes using two-sided digital arrival verification.

---

## 2. Core Methodologies & Paradigms

### 2.1 The Closed-Loop Care Paradigm
Sutradhar AI replaces unmonitored referrals with an accountable 5-phase care journey:

$$\text{SCREEN} \longrightarrow \text{REFER} \longrightarrow \text{REACH} \longrightarrow \text{RECEIVE} \longrightarrow \text{CLOSURE CONFIRMED}$$

1. **SCREEN**: Frontline worker (ASHA/ANM) captures patient vitals and obstetrical/clinical parameters during village home visits or sub-center clinics.
2. **REFER**: Algorithmic decision support stratifies risk, evaluates catchment road networks and real-time facility diagnostic stock, and issues a targeted digital referral with a unique tracking token (`REF-2026-00125`).
3. **REACH (Operational Handshake)**: Patient travels to the designated health facility. Physical arrival is verified via a 7-digit numerical passcode (`SH-28491`) or QR code scan. **`REACH = TRUE` acknowledges physical arrival only, explicitly separating transit verification from clinical diagnosis or cure.**
4. **RECEIVE**: Facility clinician (Medical Officer / Specialist) receives the pre-warmed clinical dossier, conducts diagnostic testing/procedures, and initiates emergency or routine protocol.
5. **CLOSURE CONFIRMED**: Care delivery or counter-referral is recorded, closing the loop. The frontline ASHA receives automated acknowledgement and scheduling instructions for subsequent home follow-up.

### 2.2 Care-Gap Intelligence Engine
Care gaps are managed through the **DETECT $\rightarrow$ PREDICT $\rightarrow$ EXPLAIN $\rightarrow$ CLOSE** loop:

* **DETECT**: Identifies overdue milestones (e.g., ANC-3 window breach $>14$ days past recommended 24–28w interval) and flag elevations (e.g., BP $\ge 140/90$ mmHg).
* **PREDICT**: Quantifies risk trajectories using assistive statistical indices (e.g., high probability of pre-eclampsia progression, eclamptic seizure risk, fetal distress).
* **EXPLAIN**: Generates transparent, human-readable operational root causes citing geographic, seasonal, and socioeconomic obstacles (e.g., 12 km transit barrier during monsoon, Tuesday bus schedule blackout, harvesting commitments).
* **CLOSE**: Equips frontline supervisors and clinicians with actionable intervention levers (home visits, transit passes, facility alternative routing, evidence verification).

---

## 3. Addressing the Three Delays Framework

Sutradhar AI is architected specifically to dismantle the **Three Delays** (Thaddeus and Maine maternal mortality model):

| Delay Phase | Real-World Failure Mode | Sutradhar AI Solution |
|---|---|---|
| **Delay 1: Deciding to Seek Care** | Patient/family unaware of danger signs; delayed recognition of pre-eclampsia or fetal jeopardy. | **Automated Care-Gap Detection & Explanations**: Flags severe risks immediately to frontline ASHAs; provides bilingual risk explainers for counseling families during home visits. |
| **Delay 2: Reaching Care / Transportation** | Patient sent to closest PHC only to find it out of stock, forcing secondary travel; transport unavailable. | **Stock-Aware Vector Routing**: Eliminates wasted transit by rerouting patients directly to facilities with active diagnostic consumables (e.g., CHC with MgSO4 vs PHC with stock deficit); triggers travel vouchers. |
| **Delay 3: Receiving Adequate Care** | Patient arrives unannounced at facility; records lost; long triage queues; delays in emergency drugs. | **Digital Handshake & Pre-Warmed Dossier**: Clinicians receive incoming transit alerts before patient arrival; QR/passcode verification routes patient directly to specialized triage desk (OPD Desk 2). |

---

## 4. Core Feature Set

1. **Operational Priority Matrix (Frontline Triage Ticker)**:
   - Real-time KPI matrix: *Need Attention*, *Active Referrals*, *Care Gaps*, *Field Follow-ups*, *Closures Today*.
   - Filterable by village sector and priority tier.
2. **Care Gap Analysis & Action Center**:
   - Deep-dive diagnostic view with chronological evidence trail and timeline audit.
   - Assistive AI hypotheses paired with human override levers.
3. **Catchment Vector Routing Simulator**:
   - Vector network map (40 km radius) displaying road corridor conditions, distance, and transit duration.
   - Real-time facility inventory matrix (medication availability, diagnostic reagents, specialist duty rosters).
4. **Digital Handshake & Token Engine**:
   - Cryptographically linked referral IDs (`REF-2026-00125`) and human-readable 7-digit passcodes (`SH-28491`).
   - High-contrast synthetic SVG QR matrix for rapid scanning in low-light rural clinics.
   - SMS dispatch fallback to beneficiary mobile numbers.
5. **Facility Intake & Handshake Verification**:
   - Receiving clinician dashboard with inbound queue telemetry and ETA countdowns.
   - Single-tap or camera-scan handshake verification setting `REACH = TRUE`.
6. **Offline-First Synchronization Shell**:
   - Local-first caching with deterministic state tags (`ONLINE`, `CACHE SYNCED`, `OFFLINE MODE`).
   - Manual sync trigger with retry queue management.

---

## 5. Golden Demo Journey: Sunita Devi

The reference workflow showcased in the frozen visual state follows beneficiary **Sunita Devi**:

1. **Initial Screening (Day 0 / 14 Sep)**:
   - Frontline ASHA Meena Bai logs routine screening for Sunita Devi (Age 26, Gravida 3 Para 2, 28 Weeks Gestation) in Kalyanpur Village.
   - Vitals: BP 142/92 mmHg (Grade 1 Hypertension), Hb 9.8 g/dL (Moderate Anemia).
2. **Referral Dispatch (Day 2 / 16 Sep)**:
   - Smart referral initiated. PHC Kalyanpur (6 km) is bypassed due to depleted Magnesium Sulfate and missing ultrasound technician.
   - Routing engine selects **CHC B Bikrampur** (12.4 km, dry metalled highway, MgSO4 confirmed, Sonologist on duty).
   - Referral generated: `REF-2026-00125` with Handshake Passcode `SH-28491`. Dispatch SMS sent to beneficiary.
3. **Care Gap Emergence (Day 10 / 24 Sep)**:
   - 7-day arrival window expires without facility handshake verification (`REACH = FALSE`).
   - Automated Care-Gap Flag raised: Priority 1 Severe Deficit.
4. **ASHA Follow-up & Intervention (Day 12 / 26 Sep)**:
   - ASHA Supervisor opens Care Gap Center. Root cause identified: transit barrier and seasonal harvesting commitments.
   - Follow-up initiated: Emergency auto-rickshaw arranged; arrival simulated.
5. **Facility Handshake & Triage (Day 12 / 26 Sep)**:
   - Sunita arrives at CHC Bikrampur ANM triage desk.
   - Dr. Arvind verifies token `SH-28491`. Operational arrival confirmed (`REACH = TRUE`).
   - Patient routed immediately to OPD Desk 2 (Dr. M. Verma) for Magnesium Sulfate administration and ultrasound.
   - Closure confirmation automatically synchronizes to ASHA Meena Bai's roster.

---

## 6. Failure & Recovery Journey

To prove resilience under rugged real-world conditions, Sutradhar AI models edge-case failures:

* **Scenario A: Facility Stock Depletion Post-Referral**:
  - *Trigger*: Primary facility runs out of reagents or clinician goes on emergency leave while patient is in transit.
  - *Recovery*: Dynamic Rerouting alert triggers on ASHA app with alternate destination (e.g. DH Sadar) and updated token without re-entering patient data.
* **Scenario B: Connectivity Loss in Remote Hamlets**:
  - *Trigger*: Village sub-center enters complete 2G/data blackout during home visit logging.
  - *Recovery*: System caches records locally in IndexedDB/localStorage, badges records as `PENDING LOCAL CACHE`, and displays an offline status bar. Actions queue in background and sync deterministically upon signal re-acquisition.
* **Scenario C: Missing Smartphone / Broken Screen at Triage**:
  - *Trigger*: Beneficiary drops smartphone or lacks internet access; cannot display the digital QR code.
  - *Recovery*: 7-digit alphanumeric passcode (`SH-28491`) delivered via standard carrier SMS or physical paper counterfoil allows manual numeric lookup at facility desk.

---

## 7. Prototype Boundaries & Compliance Safeguards

> [!IMPORTANT]
> The following boundaries are strictly enforced across the current prototype:
> 1. **Synthetic Data Only**: All beneficiary records (Sunita Devi, Ramesh Chandra, Anjali Soren), vitals, ABHA identifiers, and phone numbers are generated mock data. No Protected Health Information (PHI) is used.
> 2. **No Clinical Validation Claims**: Sutradhar AI is an operational triage decision-support prototype. It does not provide medical diagnoses, treatment prescriptions, or clinical validation.
> 3. **Assistive, Non-Prescriptive AI**: All algorithmic risk models are presented as assistive operational suggestions. Deterministic business rules and mandatory human-in-the-loop clinician overrides govern all workflow milestones.
> 4. **Simulated External Integrations**: ABDM (Ayushman Bharat Digital Mission), RCH (Reproductive and Child Health portal), and HMIS interfaces are implemented via modular simulation adapters at the prototype stage.
