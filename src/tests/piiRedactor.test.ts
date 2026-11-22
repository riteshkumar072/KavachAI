import { describe, it, expect } from "vitest";
import { redactPII } from "../core/security/piiRedactor";

describe("Pre-LLM PII Redaction Layer", () => {
  it("masks 12-digit Aadhaar numbers in spaced, hyphenated, and continuous formats", () => {
    const textSpaced = "My Aadhaar is 4829 1920 3841 for verification.";
    const textHyphenated = "Please verify 5621-8392-1029 immediately.";
    const textContinuous = "Linked to 928374615243 now.";

    const res1 = redactPII(textSpaced);
    expect(res1.sanitizedText).toBe("My Aadhaar is [REDACTED_AADHAAR] for verification.");
    expect(res1.sanitizedText).not.toContain("4829");

    const res2 = redactPII(textHyphenated);
    expect(res2.sanitizedText).toBe("Please verify [REDACTED_AADHAAR] immediately.");

    const res3 = redactPII(textContinuous);
    expect(res3.sanitizedText).toBe("Linked to [REDACTED_AADHAAR] now.");
  });

  it("masks Indian PAN card format (5 letters, 4 numbers, 1 letter)", () => {
    const input = "Your PAN card number ABCDE1234F is registered with IT Dept.";
    const result = redactPII(input);

    expect(result.sanitizedText).toBe(
      "Your PAN card number [REDACTED_PAN] is registered with IT Dept."
    );
    expect(result.sanitizedText).not.toContain("ABCDE1234F");
  });

  it("masks 10-digit Indian mobile numbers with and without +91 or 0 prefix", () => {
    const input = "Call me on 9876543210 or alternate +91 9123456789 or 08765432100.";
    const result = redactPII(input);

    expect(result.sanitizedText).toContain("[REDACTED_PHONE]");
    expect(result.sanitizedText).not.toContain("9876543210");
    expect(result.sanitizedText).not.toContain("9123456789");
    expect(result.sanitizedText).not.toContain("8765432100");
  });

  it("masks contextual OTPs near security keywords while preserving context", () => {
    const input1 = "Your verification OTP is 482910, do not share.";
    const res1 = redactPII(input1);
    expect(res1.sanitizedText).toBe("Your verification OTP is [REDACTED_OTP], do not share.");
    expect(res1.sanitizedText).not.toContain("482910");

    const input2 = "Share the 6-digit pin: 849201 right now.";
    const res2 = redactPII(input2);
    expect(res2.sanitizedText).toContain("[REDACTED_OTP]");
    expect(res2.sanitizedText).not.toContain("849201");
  });

  it("masks UPI IDs with common Indian banking handles", () => {
    const input = "Send payment to merchant.pay@okaxis or rahul99@ybl right away.";
    const result = redactPII(input);

    expect(result.sanitizedText).toBe(
      "Send payment to [REDACTED_UPI] or [REDACTED_UPI] right away."
    );
    expect(result.sanitizedText).not.toContain("merchant.pay@okaxis");
    expect(result.sanitizedText).not.toContain("rahul99@ybl");
  });

  it("does NOT corrupt normal harmless numbers such as time, quantity, or helpline numbers", () => {
    const input = "Disconnection in 2 hours. We need 50 boxes delivered to office 1930.";
    const result = redactPII(input);

    expect(result.sanitizedText).toBe(
      "Disconnection in 2 hours. We need 50 boxes delivered to office 1930."
    );
    expect(result.totalRedacted).toBe(0);
  });

  it("accurately reports totalRedacted and itemized breakdown of redacted entities", () => {
    const input =
      "Aadhaar 4829 1920 3841, PAN BKZPD9872A, phone 9876543210, and OTP is 998811.";
    const result = redactPII(input);

    expect(result.totalRedacted).toBe(4);
    expect(result.redactedItems).toHaveLength(4);

    const types = result.redactedItems.map((item) => item.type).sort();
    expect(types).toEqual(["AADHAAR", "OTP", "PAN", "PHONE"]);
  });
});
