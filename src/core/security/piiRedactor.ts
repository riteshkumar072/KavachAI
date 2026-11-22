import { RedactionResult, RedactedItem } from "@/types/kavach";

export interface PIIRedactorOptions {
  maskAadhaar?: boolean;
  maskPan?: boolean;
  maskCard?: boolean;
  maskUPI?: boolean;
  maskPhone?: boolean;
  maskOTP?: boolean;
}

/**
 * Deterministic Pre-LLM Zero-Storage PII Redaction Layer.
 * Ensures Aadhaar, PAN, Card, UPI, Phone, and OTP values are masked locally
 * before any text leaves the device or is passed to the AI engine.
 */
export function redactPII(
  text: string,
  options: PIIRedactorOptions = {}
): RedactionResult {
  if (!text || typeof text !== "string") {
    return {
      sanitizedText: "",
      redactedItems: [],
      totalRedacted: 0,
    };
  }

  const counts: Record<RedactedItem["type"], number> = {
    PAN: 0,
    AADHAAR: 0,
    BANK_CARD: 0,
    UPI_ID: 0,
    PHONE: 0,
    OTP: 0,
  };

  let sanitized = text;

  // 1. PAN Card: 5 uppercase letters, 4 numbers, 1 letter (e.g., ABCDE1234F)
  if (options.maskPan !== false) {
    const panRegex = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/gi;
    sanitized = sanitized.replace(panRegex, () => {
      counts.PAN++;
      return "[REDACTED_PAN]";
    });
  }

  // 2. Aadhaar Number: 12 digits (starting with 2-9) with optional spaces or hyphens
  if (options.maskAadhaar !== false) {
    const aadhaarRegex = /\b[2-9][0-9]{3}[\s-]?[0-9]{4}[\s-]?[0-9]{4}\b/g;
    sanitized = sanitized.replace(aadhaarRegex, () => {
      counts.AADHAAR++;
      return "[REDACTED_AADHAAR]";
    });
  }

  // 3. Bank / Debit / Credit Card: 13-16 digits with optional spaces or hyphens
  if (options.maskCard !== false) {
    // Avoid matching already redacted tokens like [REDACTED_AADHAAR]
    const cardRegex = /\b(?:\d{4}[\s-]?){3}\d{1,4}\b|\b\d{13,16}\b/g;
    sanitized = sanitized.replace(cardRegex, () => {
      counts.BANK_CARD++;
      return "[REDACTED_CARD]";
    });
  }

  // 4. UPI ID: username@bankprovider
  if (options.maskUPI !== false) {
    const upiRegex = /\b[a-zA-Z0-9._-]{2,}@(?:okaxis|okhdfcbank|okicici|oksbi|ybl|ibl|axl|paytm|upi|apl|fbl)\b/gi;
    sanitized = sanitized.replace(upiRegex, () => {
      counts.UPI_ID++;
      return "[REDACTED_UPI]";
    });
  }

  // 5. Indian Mobile Number: 10 digits starting with 6, 7, 8, or 9 (with optional +91 or 0 prefix)
  if (options.maskPhone !== false) {
    const phoneRegex = /(?:(?:\+91[\s-]?|0)[6-9]\d{9}\b|\b[6-9]\d{9}\b)/g;
    sanitized = sanitized.replace(phoneRegex, () => {
      counts.PHONE++;
      return "[REDACTED_PHONE]";
    });
  }

  // 6. OTP: Contextual 4-8 digits near OTP/code/pin/passcode keywords
  if (options.maskOTP !== false) {
    const otpRegex = /\b(otp|code|pin|verification|passcode)(\s*(?:is|:|-|number)?\s*)(\d{4,8})\b/gi;
    sanitized = sanitized.replace(otpRegex, (_match, prefix, separator) => {
      counts.OTP++;
      return `${prefix}${separator}[REDACTED_OTP]`;
    });
  }

  const placeholderMap: Record<RedactedItem["type"], string> = {
    PAN: "[REDACTED_PAN]",
    AADHAAR: "[REDACTED_AADHAAR]",
    BANK_CARD: "[REDACTED_CARD]",
    UPI_ID: "[REDACTED_UPI]",
    PHONE: "[REDACTED_PHONE]",
    OTP: "[REDACTED_OTP]",
  };

  const redactedItems: RedactedItem[] = (
    Object.keys(counts) as Array<RedactedItem["type"]>
  )
    .filter((type) => counts[type] > 0)
    .map((type) => ({
      type,
      placeholder: placeholderMap[type],
      count: counts[type],
    }));

  const totalRedacted = redactedItems.reduce((acc, item) => acc + item.count, 0);

  return {
    sanitizedText: sanitized,
    redactedItems,
    totalRedacted,
  };
}
