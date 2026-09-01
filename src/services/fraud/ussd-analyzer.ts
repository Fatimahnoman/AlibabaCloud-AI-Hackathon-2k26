export interface UssdAnalysis {
  code: string;
  risk: 'safe' | 'caution' | 'dangerous' | 'critical';
  category: string;
  description: string;
  descriptionUrdu: string;
  whatItDoes: string;
  whatItDoesUrdu: string;
  riskLevel: string;
  recommendation: string;
  recommendationUrdu: string;
}

const DANGEROUS_USSD: Array<{
  pattern: RegExp;
  risk: 'caution' | 'dangerous' | 'critical';
  category: string;
  description: string;
  descriptionUrdu: string;
  whatItDoes: string;
  whatItDoesUrdu: string;
  riskLevel: string;
  recommendation: string;
  recommendationUrdu: string;
}> = [
  {
    pattern: /^\*#21#$/,
    risk: 'critical',
    category: 'Call Forwarding',
    description: 'Check unconditional call forwarding status',
    descriptionUrdu: 'کال فارورڈنگ کی صورتحال چیک کریں',
    whatItDoes: 'Shows if your calls are being forwarded to another number without your knowledge. If a number appears, your calls are being intercepted.',
    whatItDoesUrdu: 'دکھاتا ہے کہ آپ کی کالز کسی اور نمبر پر فارورڈ ہو رہی ہیں۔ اگر کوئی نمبر نظر آئے تو آپ کی کالز دوسری جگہ جا رہی ہیں۔',
    riskLevel: 'CRITICAL: Call interception detected',
    recommendation: 'Dial *#21# to check, then dial ##21# to cancel all forwarding immediately',
    recommendationUrdu: 'چیک کرنے کے لیے *#21# ڈائل کریں، پھر فارورڈنگ روکنے کے لیے ##21# ڈائل کریں',
  },
  {
    pattern: /^\*#62#$/,
    risk: 'critical',
    category: 'Conditional Forwarding',
    description: 'Check call forwarding when phone is off/not reachable',
    descriptionUrdu: 'فون بند ہونے پر کال فارورڈنگ چیک کریں',
    whatItDoes: 'Shows where calls go when your phone is switched off or has no signal. Scammers use this to forward your missed calls to premium numbers.',
    whatItDoesUrdu: 'دکھاتا ہے آپ کا فون بند ہونے پر کالیں کہاں جاتی ہیں۔ دھوکہ دہنے والے اسے آپ کی چھوٹی کالز پریمیم نمبرز پر بھیجنے کے لیے استعمال کرتے ہیں۔',
    riskLevel: 'CRITICAL: Conditional call interception may be active',
    recommendation: 'Dial ##62# to cancel conditional forwarding',
    recommendationUrdu: 'شرطی فارورڈنگ روکنے کے لیے ##62# ڈائل کریں',
  },
  {
    pattern: /^\*#67#$/,
    risk: 'dangerous',
    category: 'Conditional Forwarding',
    description: 'Check call forwarding when line is busy',
    descriptionUrdu: 'لائن_BUSY ہونے پر کال فارورڈنگ چیک کریں',
    whatItDoes: 'Shows where calls go when your line is busy. Could be redirected to a scammer\'s number.',
    whatItDoesUrdu: 'دکھاتا ہے لائنBusy ہونے پر کالیں کہاں جاتی ہیں۔ یہ دھوکہ دہنے والے کے نمبر پر فارورڈ ہو سکتی ہیں۔',
    riskLevel: 'HIGH: Check if forwarding destination is your number',
    recommendation: 'Dial ##67# to cancel busy forwarding',
    recommendationUrdu: 'Busy فارورڈنگ روکنے کے لیے ##67# ڈائل کریں',
  },
  {
    pattern: /^\*#002#$/,
    risk: 'caution',
    category: 'Cancel All Forwarding',
    description: 'Cancel ALL call forwarding at once',
    descriptionUrdu: 'تمام کال فارورڈنگ ایک ساتھ روکیں',
    whatItDoes: 'This is actually a SAFETY code — it cancels all types of call forwarding on your phone.',
    whatItDoesUrdu: 'یہ دراصل ایک محفوظ کوڈ ہے — یہ آپ کے فون کی تمام قسم کی کال فارورڈنگ روک دیتا ہے۔',
    riskLevel: 'SAFE: This removes all call forwarding',
    recommendation: 'Dial this to clean up any suspicious forwarding that may have been set',
    recommendationUrdu: 'کسی بھی مشکوک فارورڈنگ صاف کرنے کے لیے یہ ڈائل کریں',
  },
  {
    pattern: /^\*2767\*3855#$/,
    risk: 'critical',
    category: 'Factory Reset',
    description: 'Factory reset (Samsung phones) — ALL DATA ERASED',
    descriptionUrdu: 'فیکٹری ری سیٹ (Samsung فونز) — تمام ڈیٹا حذف',
    whatItDoes: 'PERMANENTLY erases ALL data on Samsung phones. If someone sends you this code and you dial it, your phone will be completely wiped.',
    whatItDoesUrdu: 'Samsung فونز کا تمام ڈیٹا ہمیشہ کے لیے حذف کر دیتا ہے۔ اگر کوئی یہ کوڈ بھیجے اور آپ ڈائل کریں تو آپ کا فون مکمل طور پر صاف ہو جائے گا۔',
    riskLevel: 'CRITICAL: Phone will be completely wiped',
    recommendation: 'NEVER dial this code. If someone sent it to you, do NOT dial it',
    recommendationUrdu: 'یہ کوڈ کبھی ڈائل نہ کریں۔ اگر کسی نے بھیجا ہے تو ڈائل نہ کریں',
  },
  {
    pattern: /^\*#\*#7780#\*#\*$/,
    risk: 'critical',
    category: 'Factory Reset',
    description: 'Factory reset (Android) — data reset',
    descriptionUrdu: 'فیکٹری ری سیٹ (Android) — ڈیٹا ری سیٹ',
    whatItDoes: 'Resets phone to factory settings. Removes all apps, accounts, and data.',
    whatItDoesUrdu: 'فون کو فیکٹری سیٹنگز پر واپس کر دیتا ہے۔ تمام ایپس، اکاؤنٹس اور ڈیٹا ہٹا دیتا ہے۔',
    riskLevel: 'CRITICAL: Phone reset will occur',
    recommendation: 'NEVER dial this code from an unknown source',
    recommendationUrdu: 'نامعلوم ذریعے سے یہ کوڈ کبھی ڈائل نہ کریں',
  },
  {
    pattern: /^\*\*21\*\d+#$/,
    risk: 'critical',
    category: 'Call Forwarding Setup',
    description: 'Set unconditional call forwarding to a specific number',
    descriptionUrdu: 'کسی مخصوص نمبر پر کال فارورڈنگ سیٹ کریں',
    whatItDoes: 'FORWARDS ALL your calls to the specified number. If someone asks you to dial this, they are hijacking your calls.',
    whatItDoesUrdu: 'آپ کی تمام کالزpecified نمبر پر فارورڈ کر دیتا ہے۔ اگر کوئی آپ سے ڈائل کروائے تو وہ آپ کی کالز چرا رہا ہے۔',
    riskLevel: 'CRITICAL: All calls will be intercepted',
    recommendation: 'NEVER dial this. If already set, dial ##21# to cancel',
    recommendationUrdu: 'کبھی ڈائل نہ کریں۔ اگر سیٹ ہے تو ##21# ڈائل کریں',
  },
  {
    pattern: /^\*\*62\*\d+#$/,
    risk: 'critical',
    category: 'Conditional Forwarding Setup',
    description: 'Set conditional forwarding (when off) to a specific number',
    descriptionUrdu: 'شرطی فارورڈنگ (بند ہونے پر) کسی مخصوص نمبر پر سیٹ کریں',
    whatItDoes: 'Forwards calls to another number when your phone is off. Scammers ask victims to dial this.',
    whatItDoesUrdu: 'آپ کا فون بند ہونے پر کالز دوسرے نمبر پر فارورڈ کر دیتا ہے۔ دھوکہ دہنے والے زیر کار سے ڈائلوائتے ہیں۔',
    riskLevel: 'CRITICAL: Missed calls will be hijacked',
    recommendation: 'NEVER dial this. If already set, dial ##62# to cancel',
    recommendationUrdu: 'کبھی ڈائل نہ کریں۔ اگر سیٹ ہے تو ##62# ڈائل کریں',
  },
  {
    pattern: /^\*\*67\*\d+#$/,
    risk: 'dangerous',
    category: 'Conditional Forwarding Setup',
    description: 'Set busy call forwarding to a specific number',
    descriptionUrdu: 'Busy کال فارورڈنگ کسی مخصوص نمبر پر سیٹ کریں',
    whatItDoes: 'Forwards calls when your line is busy to another number.',
    whatItDoesUrdu: 'آپ کی لائن Busy ہونے پر کالز دوسرے نمبر پر فارورڈ کر دیتا ہے۔',
    riskLevel: 'HIGH: Busy calls will be redirected',
    recommendation: 'NEVER dial this from an unknown source. Cancel with ##67#',
    recommendationUrdu: 'نامعلوم ذریعے سے کبھی ڈائل نہ کریں۔ ##67# سے روکیں',
  },
  {
    pattern: /^\*#0\*#$/,
    risk: 'caution',
    category: 'Hardware Test',
    description: 'Samsung hardware test mode',
    descriptionUrdu: 'Samsung ہارڈویئر ٹیسٹ موڈ',
    whatItDoes: 'Opens Samsung\'s hardware diagnostic mode. While not malicious, it can reveal device information.',
    whatItDoesUrdu: 'Samsung کا ہارڈویئر تشخیصی موڈ کھولتا ہے۔',
    riskLevel: 'CAUTION: Diagnostic mode — no security risk but reveals device info',
    recommendation: 'Safe but be careful not to change settings accidentally',
    recommendationUrdu: 'محفوظ ہے لیکن غلطی سے سیٹنگز تبدیل نہ ہو جائیں',
  },
  {
    pattern: /^\*#8\*#$/,
    risk: 'caution',
    category: 'Hardware Test',
    description: 'Samsung touch screen test',
    descriptionUrdu: 'Samsung ٹچ اسکرین ٹیسٹ',
    whatItDoes: 'Opens touch screen diagnostic on Samsung devices.',
    whatItDoesUrdu: 'Samsung ڈیوائسز پر ٹچ اسکرین تشخیص کھولتا ہے۔',
    riskLevel: 'CAUTION: Diagnostic mode',
    recommendation: 'Safe for testing purposes',
    recommendationUrdu: 'ٹیسٹ کے لیے محفوظ',
  },
];

const SAFE_NETWORK_CODES = [
  { pattern: /^\*123#$/, description: 'Balance check (varies by network)', descriptionUrdu: 'بیلنس چیک' },
  { pattern: /^\*111#$/, description: 'Jazz service code', descriptionUrdu: 'Jazz سروس کوڈ' },
  { pattern: /^\*222#$/, description: 'Ufone service code', descriptionUrdu: 'Ufone سروس کوڈ' },
  { pattern: /^\*310#$/, description: 'Zong service code', descriptionUrdu: 'Zong سروس کوڈ' },
  { pattern: /^\*345#$/, description: 'Telenor service code', descriptionUrdu: 'Telenor سروس کوڈ' },
  { pattern: /^\*100#$/, description: 'Service code', descriptionUrdu: 'سروس کوڈ' },
  { pattern: /^\*555#$/, description: 'Service code', descriptionUrdu: 'سروس کوڈ' },
];

export function analyzeUssdCode(code: string): UssdAnalysis | null {
  const trimmed = code.trim();
  if (!/^\*[\d*#]+\#$/.test(trimmed)) return null;

  for (const entry of DANGEROUS_USSD) {
    if (entry.pattern.test(trimmed)) {
      return {
        code: trimmed,
        risk: entry.risk,
        category: entry.category,
        description: entry.description,
        descriptionUrdu: entry.descriptionUrdu,
        whatItDoes: entry.whatItDoes,
        whatItDoesUrdu: entry.whatItDoesUrdu,
        riskLevel: entry.riskLevel,
        recommendation: entry.recommendation,
        recommendationUrdu: entry.recommendationUrdu,
      };
    }
  }

  for (const safe of SAFE_NETWORK_CODES) {
    if (safe.pattern.test(trimmed)) {
      return {
        code: trimmed,
        risk: 'safe',
        category: 'Network Service',
        description: safe.description,
        descriptionUrdu: safe.descriptionUrdu,
        whatItDoes: 'Standard network service code',
        whatItDoesUrdu: 'معیاری نیٹ ورک سروس کوڈ',
        riskLevel: 'SAFE: Standard network service code',
        recommendation: 'Safe to dial',
        recommendationUrdu: 'ڈائل کرنا محفوظ ہے',
      };
    }
  }

  if (/^\*[\d*#]+\#$/.test(trimmed)) {
    const starCount = (trimmed.match(/\*/g) || []).length;
    const hashCount = (trimmed.match(/#/g) || []).length;
    const hasMixedStars = /\*#.*\*#/.test(trimmed) || /\*#/.test(trimmed);

    if (hasMixedStars && starCount >= 3 && hashCount >= 2) {
      return {
        code: trimmed,
        risk: 'caution',
        category: 'Unknown Service Code',
        description: 'Unknown USSD/diagnostic code',
        descriptionUrdu: 'نامعلوم USSD/تشخیصی کوڈ',
        whatItDoes: 'This appears to be a system-level code. Could be a diagnostic tool or potentially dangerous command. Do NOT dial unless you know exactly what it does.',
        whatItDoesUrdu: 'یہسسٹم لیول کا کوڈ لگتا ہے۔ یہ تشخیصی ٹول یا خطرناک حکم ہو سکتا ہے۔ جب تک یقین نہ ہو کبھی ڈائل نہ کریں۔',
        riskLevel: 'CAUTION: Unknown system-level code — do not dial without verification',
        recommendation: 'Do NOT dial this code. Verify it with your network operator first',
        recommendationUrdu: 'یہ کوڈ ڈائل نہ کریں۔ پہلے اپنے نیٹ ورک آپریٹر سے تصدیق کریں',
      };
    }

    if (/^\*\d{3,4}#$/.test(trimmed)) {
      return {
        code: trimmed,
        risk: 'safe',
        category: 'Network Service',
        description: 'Standard network service code',
        descriptionUrdu: 'معیاری نیٹ ورک سروس کوڈ',
        whatItDoes: 'This appears to be a standard network balance/service check code.',
        whatItDoesUrdu: 'یہ معیاری نیٹ ورک بیلنس/سروس چیک کوڈ لگتا ہے۔',
        riskLevel: 'SAFE: Standard 3-4 digit network code',
        recommendation: 'Safe to dial — standard network service code',
        recommendationUrdu: 'ڈائل کرنا محفوظ — معیاری نیٹ ورک سروس کوڈ',
      };
    }

    return {
      code: trimmed,
      risk: 'caution',
      category: 'Unknown Code',
      description: 'Unrecognized USSD code',
      descriptionUrdu: 'نامعلوم USSD کوڈ',
      whatItDoes: 'This code is not in our database. It could be safe or dangerous. Proceed with caution.',
      whatItDoesUrdu: 'یہ کوڈ ہماری ڈیٹابیس میں نہیں ہے۔ یہ محفوظ یا خطرناک ہو سکتا ہے۔ احتیاط سے عمل کریں۔',
      riskLevel: 'CAUTION: Unknown code — verify before dialing',
      recommendation: 'Do NOT dial this code unless you are sure it is safe. Check with your network operator',
      recommendationUrdu: 'یقین ہونے تک یہ کوڈ ڈائل نہ کریں۔ اپنے نیٹ ورک آپریٹر سے چیک کریں',
    };
  }

  return null;
}

export function extractUssdCodes(text: string): string[] {
  const matches = text.match(/\*[\d*#]+\#/g);
  return matches ? [...new Set(matches)] : [];
}

export function analyzeAllUssdCodes(text: string): UssdAnalysis[] {
  const codes = extractUssdCodes(text);
  return codes.map((code) => analyzeUssdCode(code)).filter((a): a is UssdAnalysis => a !== null);
}
