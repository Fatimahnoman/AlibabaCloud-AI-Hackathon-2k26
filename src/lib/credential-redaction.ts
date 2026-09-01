export const REDACTED = "[REDACTED]";

export function redactSensitiveData(text: string): string {
  let result = text;

  result = result.replace(
    /\b(?:otp|OTP)\s*(?:is\s*)?[:=]?\s*\d{4,8}\b/g,
    REDACTED
  );

  result = result.replace(
    /\bcode\s+is\s+\d{4,8}\b/gi,
    REDACTED
  );

  result = result.replace(
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}(?:[\s-]?\d{1,3})?\b/g,
    (match) => {
      const digitsOnly = match.replace(/[\s-]/g, "");
      if (digitsOnly.length >= 13 && digitsOnly.length <= 19) {
        return REDACTED;
      }
      return match;
    }
  );

  result = result.replace(
    /\bcvv\s*[:=]?\s*\d{3,4}\b/gi,
    REDACTED
  );

  result = result.replace(
    /\b(?:password|passwd|pwd)\s*[:=]\s*\S+/gi,
    (match) => {
      const eqIndex = match.search(/[:=]/);
      return match.slice(0, eqIndex + 1) + " " + REDACTED;
    }
  );

  result = result.replace(
    /\b(?:password|passwd|pwd)\s+(?:is\s+)?\S+/gi,
    (match) => {
      const words = match.split(/\s+/);
      return words[0] + " " + REDACTED;
    }
  );

  result = result.replace(
    /\bpin\s*(?:code\s*)?[:=]?\s*\d{4,6}\b/gi,
    REDACTED
  );

  result = result.replace(
    /\b(?:account|acct|a\/c)\s*(?:number|no|#)?\s*[:=]?\s*\d{9,18}\b/gi,
    REDACTED
  );

  result = result.replace(
    /\b[A-Z]{2}\d{2}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4,13}\b/g,
    REDACTED
  );

  result = result.replace(
    /\b\d{3}[\s-]?\d{2}[\s-]?\d{5}\b/g,
    REDACTED
  );

  result = result.replace(
    /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g,
    REDACTED
  );

  result = result.replace(
    /\b\+?\d{1,4}[\s-]?\(?\d{1,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}\b/g,
    (match) => {
      const digits = match.replace(/\D/g, "");
      if (digits.length >= 7) return REDACTED;
      return match;
    }
  );

  return result;
}

export function containsSensitiveData(text: string): {
  hasSensitive: boolean;
  types: string[];
} {
  const types: string[] = [];

  if (/\b(?:otp|OTP)\s*(?:is\s*)?[:=]?\s*\d{4,8}\b/.test(text) ||
      /\bcode\s+is\s+\d{4,8}\b/i.test(text)) {
    types.push("otp");
  }

  if (/\bpin\s*(?:code\s*)?[:=]?\s*\d{4,6}\b/gi.test(text)) {
    types.push("pin");
  }

  if (/\bcvv\s*[:=]?\s*\d{3,4}\b/gi.test(text)) {
    types.push("cvv");
  }

  if (/\b(?:password|passwd|pwd)\s*[:=]\s*\S+/gi.test(text) ||
      /\b(?:password|passwd|pwd)\s+(?:is\s+)?\S+/gi.test(text)) {
    types.push("password");
  }

  const cardMatches = text.match(
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}(?:[\s-]?\d{1,3})?\b/g
  );
  if (cardMatches) {
    for (const match of cardMatches) {
      const digitsOnly = match.replace(/[\s-]/g, "");
      if (digitsOnly.length >= 13 && digitsOnly.length <= 19) {
        types.push("card_number");
        break;
      }
    }
  }

  if (/\b(?:account|acct|a\/c)\s*(?:number|no|#)?\s*[:=]?\s*\d{9,18}\b/gi.test(text)) {
    types.push("bank_account");
  }

  if (/\b[A-Z]{2}\d{2}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{0,4}\b/.test(text)) {
    types.push("iban");
  }

  if (/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/.test(text)) {
    types.push("email");
  }

  if (/\b\+?\d{1,4}[\s-]?\(?\d{1,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}\b/.test(text)) {
    const digits = text.replace(/\D/g, "");
    if (digits.length >= 7) types.push("phone");
  }

  return {
    hasSensitive: types.length > 0,
    types,
  };
}

export function redactForLogging(text: string): string {
  let result = redactSensitiveData(text);

  result = result.replace(
    /\b\d{6,}\b/g,
    REDACTED
  );

  return result;
}
