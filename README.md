# KavachAI — Real-Time Context-Aware Shield Against Digital Arrest & Social Engineering Scams

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%204-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-24%20Tests%20Passed-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![Security](https://img.shields.io/badge/Security-Zero--Storage%20PII%20Masking-success?style=for-the-badge)](https://github.com/riteshkumar072/KavachAI)

> **KavachAI** is an intelligent, context-aware defensive AI assistant that protects Indian citizens from **"Digital Arrest" extortion**, fake Police/CBI/TRAI impersonation, coercive isolation tactics, and malicious UPI traps in real time. It operates with a **zero-storage privacy guarantee**, masking sensitive Indian PII locally before any cloud AI processing, and features an **autonomous offline fallback** that delivers full protection even without an API key.

---

## 1. Chosen Vertical

* **Category:** Defensive Cybersecurity & Real-Time Risk Prevention
* **Target Threat Vectors:**
  1. **Digital Arrest Coercion:** Scammers posing as CBI/Police/Customs claiming the victim's Aadhaar or SIM was linked to money laundering or narcotics, ordering them to lock their room and stay on video call.
  2. **Coercive Urgency & Disconnection Threats:** "TRAI will block your SIM within 2 hours", "Arrest warrant on the way", forcing panicky decisions.
  3. **Isolation Manipulation:** "Do not tell your family", "Desh ki suraksha / confidential investigation", isolating elderly or naive victims.
  4. **Financial Extraction & Reversal Traps:** "Transfer money to RBI verification account for temporary deposit", "Enter UPI PIN to receive money", "Install AnyDesk/TeamViewer".
  5. **Contraband Blackmail:** Fake FedEx courier alerts claiming MDMA drugs or fake passports found in customer parcels.

---

## 2. Architecture & Decision Logic

### High-Level Architecture Diagram
```text
  [ User Input Streams ]
  ├── 1-Click Call Simulator (4 Scenarios)
  ├── Live Microphone (Web Speech STT)
  └── Custom SMS / Transcript Paste
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Zero-Storage Pre-LLM PII Redaction Layer (piiRedactor.ts)│
│    • Aadhaar (12-digit) ──> [REDACTED_AADHAAR]              │
│    • Indian PAN Card    ──> [REDACTED_PAN]                  │
│    • Phone Numbers (+91)──> [REDACTED_PHONE]                │
│    • Bank / Card (16d)  ──> [REDACTED_CARD]                 │
│    • UPI IDs (@okaxis)  ──> [REDACTED_UPI]                  │
│    • OTPs near keywords ──> [REDACTED_OTP]                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ Sanitized Text
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Tier-1 Deterministic Heuristic Scorer (heuristicScorer)  │
│    • 5 Scam Vector Dictionaries (< 5ms execution)           │
│    • Compound Manipulation Synergy Bonus (+12 / +25 pts)    │
│    • False-Positive Dampening (Factor D = 0.35 on advisories│
│    • Exact substring span indexing for UI highlights        │
└──────────────────────────┬──────────────────────────────────┘
                           │
            Score < 25 &   │   Score >= 25 OR
            No Isolation   │   Extraction Signals
            ┌──────────────┴──────────────┐
            ▼                             ▼
┌───────────────────────┐   ┌─────────────────────────────────┐
│ TIER_1_LOCAL Response │   │ 3. Tier-2 Deep AI Assistant     │
│ • Zero API cost       │   │    • LRU Hash Cache (50 entries)│
│ • < 5ms instant score │   │    • Gemini 2.5 Flash / fallback│
│ • Local Exit Scripts  │   │    • Strict Zod Schema Parsing  │
└───────────────────────┘   └────────────────┬────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Active Defense & Inclusive UI (Next.js Dashboard)        │
│    • Animated SVG Semicircular Risk Meter (0-100)           │
│    • Inline Highlighted Transcript with PII Badges          │
│    • Explainable AI (XAI) Manipulation Vectors Breakdown    │
│    • Contextual "Say This & Hang Up" Script (EN/HI)         │
│    • Web Speech TTS Spoken Warnings (Audio Accessibility)   │
│    • 1-Click Silent Family WhatsApp SOS Alert               │
│    • Senior High-Contrast Mode (Thick borders, 48px targets)│
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 2-Tier Hybrid Decision Pipeline

| Pipeline Stage | Engine | Latency | Cost | Function |
| :--- | :--- | :---: | :---: | :--- |
| **Tier-1** | Deterministic Regex & Keyword Matrices | **< 5 ms** | **$0** | Scans 5 scam vector dictionaries, scores compound synergy, tracks exact string offsets, and calculates false-positive dampening. |
| **Escalation Gate** | Conditional Gating Rules | **< 1 ms** | **$0** | Evaluates whether Tier-2 LLM is needed. If text is benign (Score < 25 and no isolation/extraction), LLM is skipped. **Saves ~75% API calls**. |
| **Tier-2** | Gemini 2.5 Flash (or Offline Heuristic Synthesis) | **200–500 ms** | Minimal | Provides deep psychological manipulation diagnosis, nuanced Hindi/English safe exit scripts, and handles edge cases. If API key is absent, **Tier-1 Fallback operates seamlessly with zero crashes**. |

---

## 4. Context-Aware Persona Engine

Scammers exploit different psychological triggers depending on who answers the call. KavachAI dynamically adjusts sensitivity multipliers ($M_p$), alert thresholds, and exit scripts:

| Persona ID | Multiplier ($M_p$) | Caution Level | Critical Level | Primary Vulnerability & Tailored Defense |
| :--- | :---: | :---: | :---: | :--- |
| **Senior Citizen** (`senior_citizen`) | **$1.25\times$** | **30** | **60** | Vulnerable to Digital Arrest, fake CBI intimidation, pension/KYC block threats, and isolation coercion. Emphasizes calm reassurance, refusing video calls, and alerting family members immediately. |
| **College Student** (`college_student`) | **$1.00\times$** | **35** | **70** | Vulnerable to fake job/internship deposits, FedEx customs parcel traps, part-time task scams, and blackmail threats. Emphasizes swift critical disengagement and checking official university/police portals. |
| **Small Merchant** (`small_merchant`) | **$1.15\times$** | **32** | **65** | Vulnerable to fake UPI "receive payment" PIN traps, QR refund schemes, urgent bulk orders from fake armed forces personnel, and remote desktop takeover (AnyDesk). Emphasizes that UPI PIN is **only to send, never to receive**. |

---

## 5. Pre-LLM Zero-Storage PII Redaction

Before any user text or speech transcript touches the AI engine or network, KavachAI sanitizes all Indian sensitive identifiers in local client memory:

```typescript
// Example: Live Redaction Transformation
const rawInput = "Drugs found in parcel linked to Aadhaar 4829 1920 3841, PAN ABCDE1234F. Share OTP 849201.";

const result = redactPII(rawInput);
// Result: "Drugs found in parcel linked to Aadhaar [REDACTED_AADHAAR], PAN [REDACTED_PAN]. Share OTP [REDACTED_OTP]."
```

* **Aadhaar Number:** 12 digits (spaced/hyphenated/continuous) starting with `2-9` -> `[REDACTED_AADHAAR]`
* **PAN Card:** 5 uppercase letters, 4 numbers, 1 letter -> `[REDACTED_PAN]`
* **Indian Mobile Numbers:** 10 digits starting with `6-9` (with optional `+91` or `0`) -> `[REDACTED_PHONE]`
* **Contextual OTP:** 4-8 digits near `otp`, `code`, `pin`, `verification` keywords -> `[REDACTED_OTP]`
* **UPI IDs:** Common Indian PSPs (`@okaxis`, `@okhdfcbank`, `@ybl`, `@paytm`, `@upi`, etc.) -> `[REDACTED_UPI]`
* **Bank / Debit Cards:** 13-16 digits -> `[REDACTED_CARD]`

---

## 6. False-Positive Dampening System

Legitimate bank advisories and casual conversations frequently mention words like *"police"*, *"CBI"*, or *"OTP"* (e.g. *"Our bank will never ask for your OTP"* or *"I saw a CBI movie with my friend"*).

KavachAI implements **benign context detection**:
* Detects markers such as: `visit your nearest branch`, `official website`, `never share otp`, `saw in the news`, `movie`, `awareness session`.
* Uses negative lookbehind in extraction regexes (`/(?<!\b(?:never|do not|don't)\s+)share\s+otp/i`) so safety warnings are never misclassified as extraction demands.
* If benign markers exist without malicious isolation or financial extraction, a dampening factor $D = 0.35$ is applied, keeping risk scores securely in the `SAFE` green tier.

---

## 7. 30-Second Judge Walkthrough

Evaluate KavachAI in 5 simple steps:

1. **Select Persona:** In the top header bar, select **Senior Citizen** (वरिष्ठ नागरिक).
2. **Start Scam Simulator:** In the **1-Click Scam Simulator** tab, click the **Play** button on the *"Fake CBI Digital Arrest"* scenario card.
3. **Observe Real-Time Stream:**
   * Watch the lines stream in every 1.9s.
   * Notice the Risk Meter escalate from `SAFE` (0%) to `CAUTION` (35%) to `CRITICAL` (95%).
   * See exact inline color-coded threat phrase highlights (`Digital Arrest`, `RBI verification account`, `Lock your room`).
   * See live PII masking (`[REDACTED_AADHAAR]`, `[REDACTED_OTP]`).
4. **Trigger Active Defense:**
   * Click **Speak Script Aloud** to hear the calm, firm exit script synthesized in Hindi or English.
   * Click **1-Click WhatsApp SOS** to view the auto-generated privacy-safe family alert.
5. **Verify False-Positive Suppression & Accessibility:**
   * Select the *"Legitimate Bank Reminder"* scenario card. Verify that the score stays in `SAFE` despite mentioning *"bank"* and *"OTP"*.
   * Click **Senior View** in the top bar to toggle Senior High-Contrast Mode (pure black, large fonts, 48px touch targets).

---

## 8. Quick Start & Setup

### Prerequisites
* Node.js v18.0.0 or higher
* npm v9.0.0 or higher

### Installation & Execution
```bash
# 1. Clone repository
git clone https://github.com/riteshkumar072/KavachAI.git
cd KavachAI

# 2. Install dependencies
npm install

# 3. Run automated test suite (24 unit & integration tests)
npm test

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Optional: Tier-2 Gemini API Key
KavachAI runs **100% offline in Local Heuristic Mode** by default. To enable Tier-2 Gemini Deep AI analysis:
```bash
cp .env.example .env.local
# Add your Gemini API key in .env.local:
# GEMINI_API_KEY=your_key_here
```

---

## 9. Automated Testing Suite (`Vitest`)

Run the automated test suite with:
```bash
npm test
```

### Test Breakdown (24 Tests Passing)
* **`src/tests/piiRedactor.test.ts` (7 Tests):**
  * Spaced, hyphenated, and continuous 12-digit Aadhaar masking.
  * Indian PAN card format masking.
  * 10-digit Indian phone number masking (with/without `+91` and `0`).
  * Contextual OTP masking near security keywords.
  * Banking handle UPI ID masking.
  * Harmless number preservation ("2 hours", "50 boxes", "1930").
  * Accurate itemized entity counters and total redaction reports.
* **`src/tests/heuristicScorer.test.ts` (8 Tests):**
  * Flags Fake CBI Digital Arrest with compound synergy bonus as `CRITICAL`.
  * Flags FedEx Customs + AnyDesk remote access as `CRITICAL`.
  * Flags fake merchant UPI PIN-to-receive as `CRITICAL`.
  * Suppresses false positives on legitimate bank KYC reminders.
  * Suppresses false positives on casual conversational police/movie mentions.
  * Accurate `startIndex` and `endIndex` substring span tracking.
  * Deterministic heuristic scoring execution in under 25ms.
  * Graceful handling of empty and whitespace-only text with score 0.
* **`src/tests/hybridDecision.test.ts` (6 Tests):**
  * Applies higher risk multiplier for Senior Citizen ($1.25\times$) than Student ($1.0\times$).
  * Triggers `CAUTION` earlier for Senior Citizen (threshold 30) than Student (threshold 35).
  * Conserves tokens by skipping Tier-2 LLM on benign safe messages.
  * Escalates to Tier-2 on `ISOLATION_SECRECY` or `FINANCIAL_EXTRACTION`.
  * Seamless fallback to `TIER_1_FALLBACK` with complete exit scripts when API key is missing.
  * Strict Zod schema validation and graceful fallback on malformed AI output.
* **`src/tests/accessibility.test.ts` (3 Tests):**
  * Verifies bilingual persona labels and accessibility vulnerability descriptions.
  * Verifies full bilingual fallback exit scripts across all 5 threat categories.
  * Verifies simulation scenario metadata, line steps, and demonstration objectives.

---

## 10. Assumptions & Responsible AI Principles

1. **Strictly Defensive Design:** KavachAI never performs counter-attacks, offensive probing, call interception, or network denial-of-service against callers. It exclusively analyzes incoming communication in client memory and guides the human user.
2. **Zero-Storage Privacy Architecture:** Audio and transcripts are processed transiently in memory. No speech recordings, transcripts, or personal identifiers are written to disks, databases, or external telemetry servers.
3. **Graceful Offline Fallback:** Even during total network disconnection or absent LLM credentials, the local deterministic heuristic engine provides full threat detection, explainability, exit scripts, and family alerts.
4. **Browser Compatibility:** Web Speech STT is supported on Chromium browsers (Google Chrome, Microsoft Edge). When evaluated on unsupported browsers, KavachAI surfaces a clear informative badge directing the user to the built-in 1-Click Simulator and Paste tabs.
5. **National Cyber Crime Helpline Integration:** All emergency alerts and UI footers directly integrate with India's official National Cyber Crime Reporting Portal (`1930` and [cybercrime.gov.in](https://cybercrime.gov.in)).

---

## 11. Git Commit History (Single Branch `main`)

Every phase was developed sequentially on `main` with atomic commits:

1. `chore: init Next.js TypeScript project, Zod contracts, and Vitest setup`
2. `feat(security): add pre-LLM zero-storage PII redaction layer with unit tests`
3. `feat(engine): implement persona context rules and Tier-1 heuristic threat scorer`
4. `feat(ai): add Tier-2 gated LLM analyzer with Zod validation, caching, and offline fallback`
5. `feat(ui): build live call simulator, Web Speech input, and explainable threat dashboard`
6. `feat(a11y): add Senior High-Contrast mode, ARIA live threat alerts, and EN/HI voice warnings`
7. `docs: add architecture diagram, hybrid decision logic, judge guide, and assumptions`
