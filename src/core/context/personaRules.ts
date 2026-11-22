import {
  UserPersonaId,
  ThreatVectorCategory,
  ThreatLevel,
} from "@/types/kavach";

export interface PersonaConfig {
  id: UserPersonaId;
  label: string;
  hindiLabel: string;
  multiplier: number;
  cautionThreshold: number;
  criticalThreshold: number;
  vulnerabilityFocus: string;
  defaultActionGuidance: {
    en: string;
    hi: string;
  };
  fallbackExitScripts: Record<
    ThreatVectorCategory,
    { en: string; hi: string }
  >;
}

export const PERSONA_CONFIGS: Record<UserPersonaId, PersonaConfig> = {
  senior_citizen: {
    id: "senior_citizen",
    label: "Senior Citizen",
    hindiLabel: "वरिष्ठ नागरिक",
    multiplier: 1.25,
    cautionThreshold: 30,
    criticalThreshold: 60,
    vulnerabilityFocus:
      "Vulnerable to Digital Arrest, fake Police/CBI intimidation, pension or bank KYC block threats, and isolation coercion. Emphasizes calm reassurance, refusing video calls, and alerting family members immediately.",
    defaultActionGuidance: {
      en: "Do not panic or stay on video call alone. Hang up immediately, talk to your children or trusted family, and report to Cyber Crime Helpline 1930.",
      hi: "घबराएं नहीं और अकेले वीडियो कॉल पर न रहें। तुरंत फोन काटें, अपने बच्चों या परिवार से बात करें और 1930 हेल्पलाइन पर सूचित करें।",
    },
    fallbackExitScripts: {
      AUTHORITY_IMPERSONATION: {
        en: "I am noting your name and department. I am hanging up now and verifying this directly through my local police station and family.",
        hi: "मैं आपका नाम और विभाग नोट कर रहा हूँ। मैं अभी फोन काटकर अपने नजदीकी पुलिस स्टेशन और परिवार से जांच करवाऊंगा।",
      },
      ISOLATION_SECRECY: {
        en: "I do not attend any official matters alone in isolation. I am ending this call and consulting my family right now.",
        hi: "मैं अकेले कमरे में कोई सरकारी बात नहीं करता। मैं अभी फोन काटकर अपने परिवार को बता रहा हूँ।",
      },
      FINANCIAL_EXTRACTION: {
        en: "The Reserve Bank of India never asks anyone to transfer money to a safe account. I will not transfer a single rupee and am hanging up.",
        hi: "आरबीआई कभी भी किसी सुरक्षित खाते में पैसे भेजने को नहीं कहता। मैं एक भी रुपया नहीं भेजूंगा और कॉल समाप्त कर रहा हूँ।",
      },
      COERCIVE_URGENCY: {
        en: "Legitimate government agencies do not demand immediate action over the phone. I will visit the official office in person tomorrow.",
        hi: "कोई भी असली सरकारी विभाग फोन पर ऐसी जल्दबाजी नहीं करता। मैं कल खुद दफ्तर जाकर बात करूंगा।",
      },
      LEGAL_FEAR_MONGERING: {
        en: "Send any legal notice to my registered postal address in writing. I do not entertain legal threats on unverified calls.",
        hi: "कोई भी कानूनी नोटिस मेरे घर के पते पर डाक से भेजें। फोन पर मैं कोई कानूनी बात नहीं करूंगा।",
      },
    },
  },

  college_student: {
    id: "college_student",
    label: "College Student",
    hindiLabel: "कॉलेज छात्र",
    multiplier: 1.0,
    cautionThreshold: 35,
    criticalThreshold: 70,
    vulnerabilityFocus:
      "Vulnerable to fake job/internship deposits, FedEx illegal parcel traps, part-time task scams, and blackmail threats. Emphasizes swift critical disengagement and checking official university/police portals.",
    defaultActionGuidance: {
      en: "Stop engaging. Never pay registration or verification fees, never install screen-sharing software, and report the caller immediately.",
      hi: "तुरंत बात बंद करें। किसी भी जॉब या वेरिफिकेशन के लिए पैसे न दें, AnyDesk जैसे ऐप इंस्टॉल न करें और तुरंत ब्लॉक करें।",
    },
    fallbackExitScripts: {
      AUTHORITY_IMPERSONATION: {
        en: "I am recording this call. I will verify your credentials through the official National Cyber Crime Portal before continuing any discussion.",
        hi: "मैं यह कॉल रिकॉर्ड कर रहा हूँ। मैं आधिकारिक साइबर क्राइम पोर्टल पर जांच करने के बाद ही आगे बात करूंगा।",
      },
      ISOLATION_SECRECY: {
        en: "No legitimate investigator asks students to stay alone on Skype or WhatsApp video. I am terminating this call immediately.",
        hi: "कोई भी असली जांच अधिकारी व्हाट्सएप या स्काइप वीडियो पर अकेले रहने को नहीं कहता। मैं यह कॉल काट रहा हूँ।",
      },
      FINANCIAL_EXTRACTION: {
        en: "Genuine government bodies and employers never ask for advance verification funds or OTPs. I will not pay anything.",
        hi: "कोई भी सरकारी विभाग या कंपनी वेरिफिकेशन के लिए एडवांस पैसे या ओटीपी नहीं मांगती। मैं कुछ भी पे नहीं करूंगा।",
      },
      COERCIVE_URGENCY: {
        en: "High-pressure deadlines are classic scam tactics. I am disconnecting and reporting this number to 1930.",
        hi: "ऐसी समय सीमा स्कैम की पहचान होती है। मैं कॉल काटकर 1930 पर शिकायत दर्ज कर रहा हूँ।",
      },
      LEGAL_FEAR_MONGERING: {
        en: "If a parcel or warrant is officially filed, send formal communication via the official police liaison. Goodbye.",
        hi: "यदि कोई आधिकारिक वारंट है, तो लिखित में भेजें। फोन पर धमकी देना बंद करें।",
      },
    },
  },

  small_merchant: {
    id: "small_merchant",
    label: "Small Business / Merchant",
    hindiLabel: "छोटा व्यापारी / दुकानदार",
    multiplier: 1.15,
    cautionThreshold: 32,
    criticalThreshold: 65,
    vulnerabilityFocus:
      "Vulnerable to fake UPI 'receive payment' PIN traps, QR refund schemes, urgent bulk orders from fake armed forces/canteen personnel, and remote desktop takeover (AnyDesk).",
    defaultActionGuidance: {
      en: "Remember: You NEVER need to enter a UPI PIN or scan a QR code to receive money. Disconnect immediately and notify your bank.",
      hi: "याद रखें: पैसे प्राप्त करने के लिए कभी भी यूपीआई पिन डालने या क्यूआर कोड स्कैन करने की आवश्यकता नहीं होती। तुरंत कॉल काटें।",
    },
    fallbackExitScripts: {
      AUTHORITY_IMPERSONATION: {
        en: "I do not process business orders or government contracts over unverified phone calls. Provide official GST purchase order in person.",
        hi: "मैं फोन पर किसी सरकारी विभाग या कैंटीन का ऑर्डर नहीं लेता। दुकान पर आकर औपचारिक जीएसटी बिल के साथ बात करें।",
      },
      ISOLATION_SECRECY: {
        en: "All merchant transactions in my shop are recorded and handled publicly. I will not conduct secretive remote sessions.",
        hi: "मेरी दुकान के सभी लेन-देन पारदर्शी होते हैं। मैं अकेले या गुप्त रूप से कोई प्रक्रिया नहीं करूंगा।",
      },
      FINANCIAL_EXTRACTION: {
        en: "UPI PIN is ONLY entered to SEND money, NEVER to receive payment. I know this scam and will not enter my PIN or scan your QR.",
        hi: "यूपीआई पिन सिर्फ पैसे भेजने के लिए होता है, लेने के लिए नहीं। मुझे आपकी चाल समझ आ गई है, मैं पिन नहीं डालूंगा।",
      },
      COERCIVE_URGENCY: {
        en: "I do not rush business transactions under threats of cancellation. I am cancelling this order and ending the call.",
        hi: "जल्दबाजी के चक्कर में मैं कोई गलत कदम नहीं उठाऊंगा। मुझे यह सौदा रद्द करना मंजूर है, फोन काटिए।",
      },
      LEGAL_FEAR_MONGERING: {
        en: "Threatening to freeze my merchant account is illegal harassment. I am reporting this call to the cyber cell immediately.",
        hi: "व्यापार खाता फ्रीज करने की धमकी देना गैरकानूनी है। मैं अभी साइबर सेल 1930 में शिकायत कर रहा हूँ।",
      },
    },
  },
};

export function getPersonaConfig(personaId: UserPersonaId): PersonaConfig {
  return PERSONA_CONFIGS[personaId] || PERSONA_CONFIGS.senior_citizen;
}

export function calculateThreatLevel(
  score: number,
  persona: PersonaConfig
): ThreatLevel {
  if (score >= persona.criticalThreshold) {
    return "CRITICAL";
  }
  if (score >= persona.cautionThreshold) {
    return "CAUTION";
  }
  return "SAFE";
}
