import { UserPersonaId } from "@/types/kavach";

export interface ScenarioLine {
  text: string;
  speaker: string;
  expectedThreatLevel?: "SAFE" | "CAUTION" | "CRITICAL";
  demonstrates?: string;
}

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  targetPersona: UserPersonaId;
  badge: string;
  description: string;
  lines: ScenarioLine[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: "digital_arrest_cbi",
    title: "Fake CBI Digital Arrest",
    subtitle: "TRAI & CBI Impersonation Escalation",
    targetPersona: "senior_citizen",
    badge: "Escalates: SAFE → CRITICAL",
    description:
      "A classic Digital Arrest multi-vector attack simulating fake TRAI telecom notice escalating to CBI arrest threats, WhatsApp video isolation, and RBI safe account extortion.",
    lines: [
      {
        text: "Hello, I am calling from TRAI Telecom Department regarding your mobile number.",
        speaker: "Scammer (TRAI)",
        expectedThreatLevel: "SAFE",
        demonstrates: "Initial benign authority setup",
      },
      {
        text: "Your Aadhaar was used to buy a SIM in Mumbai linked to a money laundering FIR. All your numbers will be disconnected within 2 hours.",
        speaker: "Scammer (TRAI)",
        expectedThreatLevel: "CAUTION",
        demonstrates: "Legal coercion & artificial urgency",
      },
      {
        text: "I am transferring you to Mumbai Cyber Crime CBI Officer. Do not disconnect the call or an arrest warrant will be issued immediately.",
        speaker: "Scammer (CBI Officer)",
        expectedThreatLevel: "CRITICAL",
        demonstrates: "Authority escalation & panic induction",
      },
      {
        text: "You are now under Digital Arrest. Lock your room, stay on WhatsApp video call, and do not tell anyone in your family—this is a national security matter.",
        speaker: "Scammer (CBI Officer)",
        expectedThreatLevel: "CRITICAL",
        demonstrates: "Physical isolation & secrecy coercion",
      },
      {
        text: "To prove your innocence, transfer your savings to the RBI verification account right now. Your funds will be refunded after verification.",
        speaker: "Scammer (CBI Officer)",
        expectedThreatLevel: "CRITICAL",
        demonstrates: "Financial extraction & safe-account trap",
      },
    ],
  },
  {
    id: "fedex_customs",
    title: "FedEx Illegal Parcel Trap",
    subtitle: "Customs Contraband & AnyDesk Screen Takeover",
    targetPersona: "college_student",
    badge: "Escalates: SAFE → CRITICAL",
    description:
      "Simulates an illegal parcel notification alleging seized MDMA drugs and fake passports, demonstrating live Aadhaar PII masking and remote-access hijacking.",
    lines: [
      {
        text: "Hi, this is FedEx Customer Support. A parcel booked in your name from Mumbai to Taiwan has been seized by Customs.",
        speaker: "Scammer (FedEx)",
        expectedThreatLevel: "SAFE",
        demonstrates: "Fake courier impersonation",
      },
      {
        text: "Customs officers found 5 fake passports and 200 grams of MDMA drugs inside the package linked to your Aadhaar 4829 1920 3841.",
        speaker: "Scammer (Customs)",
        expectedThreatLevel: "CRITICAL",
        demonstrates: "Live Aadhaar PII redaction & drug contraband charge",
      },
      {
        text: "Police have filed a non-bailable warrant. Stay on the line and install AnyDesk so our officer can verify your bank statement immediately.",
        speaker: "Scammer (Customs)",
        expectedThreatLevel: "CRITICAL",
        demonstrates: "AnyDesk remote screen-sharing takeover",
      },
    ],
  },
  {
    id: "upi_merchant_trap",
    title: "Fake UPI QR & PIN Trap",
    subtitle: "Canteen Order & PIN-to-Receive Deception",
    targetPersona: "small_merchant",
    badge: "Escalates: SAFE → CRITICAL",
    description:
      "Targets small store owners with fake defense canteen bulk orders, attempting to trick them into entering their UPI PIN to 'receive' advance payments.",
    lines: [
      {
        text: "Namaste bhaiya, I am calling from the army canteen. I want to order 50 boxes from your shop.",
        speaker: "Scammer (Fake Army Buyer)",
        expectedThreatLevel: "SAFE",
        demonstrates: "Flattering bulk order bait",
      },
      {
        text: "I am sending 25,000 rupees advance right now. Accept the payment request on PhonePe and enter your UPI PIN to receive the money.",
        speaker: "Scammer (Fake Army Buyer)",
        expectedThreatLevel: "CRITICAL",
        demonstrates: "UPI PIN reversal trap (PIN is only to send)",
      },
      {
        text: "Do it fast within 5 minutes or the voucher expires. Also tell me the 6-digit OTP 849201 so my payment clears.",
        speaker: "Scammer (Fake Army Buyer)",
        expectedThreatLevel: "CRITICAL",
        demonstrates: "Live OTP redaction & high-pressure timer",
      },
    ],
  },
  {
    id: "safe_bank_call",
    title: "Legitimate Bank Reminder",
    subtitle: "Annual KYC Branch Visit Notice (False-Positive Test)",
    targetPersona: "senior_citizen",
    badge: "Remains: SAFE",
    description:
      "A legitimate bank courtesy call advising the customer never to share OTPs and to visit their local branch, demonstrating false-positive suppression.",
    lines: [
      {
        text: "Hello, this is a courtesy reminder from your local bank branch regarding your annual KYC renewal.",
        speaker: "Legitimate Bank Rep",
        expectedThreatLevel: "SAFE",
        demonstrates: "Standard branch advisory",
      },
      {
        text: "Please note that our bank never asks for OTP, UPI PIN, or remote screen sharing over the phone.",
        speaker: "Legitimate Bank Rep",
        expectedThreatLevel: "SAFE",
        demonstrates: "Official bank anti-fraud disclaimer",
      },
      {
        text: "Whenever convenient this month, please visit your nearest branch with your ID or update it via our official website.",
        speaker: "Legitimate Bank Rep",
        expectedThreatLevel: "SAFE",
        demonstrates: "Benign marker dampening keeps score low",
      },
    ],
  },
];
