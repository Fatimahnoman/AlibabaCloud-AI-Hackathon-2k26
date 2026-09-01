export interface ScamTrend {
  id: string;
  name: string;
  nameUrdu: string;
  category: string;
  severity: 'critical' | 'high' | 'medium';
  description: string;
  descriptionUrdu: string;
  examples: string[];
  reportedCount2024: number;
  reportedCount2025: number;
  trend: 'rising' | 'stable' | 'declining';
  preventionTips: string[];
  relevantIndicators: string[];
}

export interface ScamStat {
  year: number;
  country: string;
  totalReports: number;
  totalLosses: string;
  topCategory: string;
  averageLossPerCase: string;
  source: string;
}

export const scamTrends: ScamTrend[] = [
  {
    id: 'investment_scam',
    name: 'Investment & Trading Scam',
    nameUrdu: 'سرمایہ کاری اور ٹریڈنگ اسکیم',
    category: 'Financial',
    severity: 'critical',
    description: 'Fake investment platforms promising guaranteed high returns. Victims deposit money via bank transfer or crypto, platform disappears within weeks.',
    descriptionUrdu: 'جھوٹے سرمایہ کاری پلیٹ فارم جو یقینی اعلیٰ منافع کا وعدہ کرتے ہیں۔ زیر کار کا بینک ٹرانسفر یا کرپٹو کے ذریعے رقم جمع کرتے ہیں، پلیٹ فارم ہفتوں میں غائب ہو جاتا ہے۔',
    examples: [
      'Earn $5000 daily with AI trading bot',
      'Double your investment in 30 days guaranteed',
      'Join exclusive crypto trading group — limited spots',
      'Invest Rs 10,000 get Rs 50,000 back in one week',
    ],
    reportedCount2024: 12450,
    reportedCount2025: 15200,
    trend: 'rising',
    preventionTips: [
      'No legitimate investment guarantees returns',
      'Research the platform on SECP/SEC websites',
      'Never invest money you cannot afford to lose',
      'Be suspicious of pressure to invest quickly',
    ],
    relevantIndicators: ['INVESTMENT_SCAM', 'URGENCY', 'TIME_PRESSURE', 'PROMISE_MILLIONS'],
  },
  {
    id: 'job_scam',
    name: 'Fake Job / Earning Scam',
    nameUrdu: 'جھوٹی نوکری / کمانے کا اسکیم',
    category: 'Employment',
    severity: 'high',
    description: 'Fake job offers or "data entry" tasks that require upfront payment for "training material" or "registration fee". Victims pay, scammers disappear.',
    descriptionUrdu: 'جھوٹی نوکری کی پیشکش یا "ڈیٹا انٹری" کے کام جن کے لیے "ٹریننگ مٹیریل" یا "رجسٹریشن فیس" کی ادائیگی درکار ہے۔ زیر کار ادائیگی کرتے ہیں، دھوکہ دہنے والے غائب ہو جاتے ہیں۔',
    examples: [
      'Data entry job — earn Rs 30,000/month from home',
      'WhatsApp earning group — earn by liking videos',
      'Pay Rs 500 registration fee for government job',
      'Online form filling job — guaranteed daily income',
    ],
    reportedCount2024: 8900,
    reportedCount2025: 11300,
    trend: 'rising',
    preventionTips: [
      'Legitimate employers never ask for upfront payment',
      'Verify job offers through official company websites',
      'Be suspicious of "earn from home" promises',
      'Check if the company exists on Google Maps/LinkedIn',
    ],
    relevantIndicators: ['JOB_SCAM', 'FAKE_JOB_FEE', 'MANDATE_FEE', 'URGENCY'],
  },
  {
    id: 'phishing_scam',
    name: 'Bank / Wallet Phishing',
    nameUrdu: 'بینک / ویلیٹ فشنگ',
    category: 'Credential Theft',
    severity: 'critical',
    description: 'Fake messages impersonating banks (HBL, UBL, Meezan, JazzCash, EasyPaisa) asking users to "verify" accounts. Links lead to fake login pages that steal credentials.',
    descriptionUrdu: 'بینکوں (HBL، UBL، میزان، جیز کیش، ایزی پیس) کی نقالت کرنے والے جھوٹے پیغامات جو صارفین سے اکاؤنٹ "تصدیق" کرنے کو کہتے ہیں۔ لنکس جھوٹے لاگ ان پیجز پر لے جاتے ہیں جو پاس ورڈز چرا لیتے ہیں۔',
    examples: [
      'HBL: Your account will be blocked. Verify now: hbl-verify.link',
      'JazzCash: Rs 15,000 credited. Confirm receipt: jazzcash-confirm.xyz',
      'UBL: Unusual activity detected. Login immediately to secure',
      'EasyPaisa: Your account limit has been reached. Update KYC',
    ],
    reportedCount2024: 18700,
    reportedCount2025: 21400,
    trend: 'rising',
    preventionTips: [
      'Banks never ask for PIN/OTP via SMS or email',
      'Always type bank URL directly — never click links',
      'Check sender email domain carefully',
      'Call your bank directly if unsure',
    ],
    relevantIndicators: ['OTP_REQUEST', 'PASSWORD_REQUEST', 'PIN_REQUEST', 'ACCOUNT_SUSPENSION', 'IMPERSONATION', 'LOOKALIKE'],
  },
  {
    id: 'prize_lottery_scam',
    name: 'Prize / Lottery / Giveaway Scam',
    nameUrdu: 'انعام / لاتری / گیو اے اسکیم',
    category: 'Scam',
    severity: 'high',
    description: 'Messages claiming you won a prize or lottery. Victims must pay "processing fee" or "tax" to collect the prize. The prize never exists.',
    descriptionUrdu: 'پیغامات جو داوا کرتے ہیں کہ آپ نے انعام یا لاتری جیتی ہے۔ زیر کار "پروسیسنگ فیس" یا "ٹیکس" ادا کرتے ہیں۔ انعام کبھی موجود نہیں ہوتا۔',
    examples: [
      'Congratulations! You won Rs 500,000 in Samsung giveaway',
      'Lucky draw winner — claim your prize within 24 hours',
      'WhatsApp bonus: Send this message to 10 groups to claim',
      'Government youth program: You have been selected for grant',
    ],
    reportedCount2024: 9800,
    reportedCount2025: 7600,
    trend: 'declining',
    preventionTips: [
      'You cannot win a lottery you never entered',
      'Legitimate prizes never require upfront payment',
      'Delete these messages immediately',
      'Report to WhatsApp/Telegram as spam',
    ],
    relevantIndicators: ['PRIZE_SCAM', 'FAKE_REWARD', 'CLICK_BAIT', 'TIME_PRESSURE'],
  },
  {
    id: 'romance_scam',
    name: 'Romance / Friendship Scam',
    nameUrdu: 'محبت / دوستی اسکیم',
    category: 'Social Engineering',
    severity: 'high',
    description: 'Scammers create fake profiles on dating apps/social media. After building emotional connection, they fabricate emergencies and request money transfers.',
    descriptionUrdu: 'دھوکہ دہنے والے ڈیٹنگ ایپس/سوشل میڈیا پر جھوٹی پروفائلز بناتے ہیں۔ جذباتی تعلق بنانے کے بعد وہ فضائی ہنگامی صورتحال بناتے ہیں اور پیسے بھیجنے کا مطالبہ کرتے ہیں۔',
    examples: [
      'I need $500 for emergency surgery — can you help?',
      'Send me money for visa processing — I will pay you back',
      'My mother is sick — I need Rs 100,000 urgently',
      'I am stuck at airport — need money for ticket',
    ],
    reportedCount2024: 6200,
    reportedCount2025: 7100,
    trend: 'rising',
    preventionTips: [
      'Never send money to someone you have never met in person',
      'Video call before sending any money',
      'Search their photos on Google Images (reverse image search)',
      'Be suspicious of stories that escalate quickly',
    ],
    relevantIndicators: ['URGENCY', 'THREAT', 'PAYMENT_REQUEST', 'TIME_PRESSURE'],
  },
  {
    id: 'crypto_scam',
    name: 'Cryptocurrency / Wallet Scam',
    nameUrdu: 'کرپٹو کرنسی / ویلیٹ اسکیم',
    category: 'Financial',
    severity: 'critical',
    description: 'Fake crypto exchanges, pump-and-dump schemes, or wallet draining links. Victims lose funds permanently with no chargeback option.',
    descriptionUrdu: 'جھوٹے کرپٹو ایکسچینجز، پمپ اینڈ ڈمپ اسکیمز، یا ویلیٹ ڈرننگ لنکس۔ زیر کار فنڈز مستقل طور پر کھو دیتے ہیں جنہیں واپس نہیں کیا جا سکتا۔',
    examples: [
      'Send 0.1 BTC to this address, receive 1 BTC back',
      'New token presale — 100x guaranteed returns',
      'Your wallet has been compromised — connect here to recover',
      'Join exclusive crypto mining pool — earn daily',
    ],
    reportedCount2024: 7800,
    reportedCount2025: 10500,
    trend: 'rising',
    preventionTips: [
      'Never share your wallet seed phrase with anyone',
      'Verify crypto exchanges on official registries',
      'Be suspicious of "guaranteed" crypto returns',
      'Use hardware wallets for significant amounts',
    ],
    relevantIndicators: ['CRYPTO_PRESSURE', 'INVESTMENT_SCAM', 'CREDENTIAL_HARVEST'],
  },
  {
    id: 'gambling_scam',
    name: 'Online Gambling / Betting Scam',
    nameUrdu: 'آن لائن جوئے / بیٹنگ اسکیم',
    category: 'Gambling',
    severity: 'critical',
    description: 'Fake online casinos or betting platforms. Initial small wins to build trust, then victims lose large amounts. Withdrawal requests are blocked.',
    descriptionUrdu: 'جھوٹے آن لائن کیسنو یا بیٹنگ پلیٹ فارم۔ اعتماد بنانے کے لیے ابتدائی چھوٹی جیتیں، پھر زیر کار بڑی رقمیں کھو دیتے ہیں۔ واپسی کی درخواستیں روک دی جاتی ہیں۔',
    examples: [
      'Sign up now & get free bonus',
      'Play & win cash — Rs 3,000,000 jackpot',
      'Deposit bonus — spin & win up to Rs 35,000',
      'Refer friends — earn 8% commission on every deposit',
    ],
    reportedCount2024: 5400,
    reportedCount2025: 8900,
    trend: 'rising',
    preventionTips: [
      'Online gambling is illegal in Pakistan',
      'No platform can guarantee wins',
      'If you cannot withdraw your "winnings", it is a scam',
      'Report to FIA Cyber Crime Wing',
    ],
    relevantIndicators: ['GAMBLING_SCAM', 'FAKE_REWARD', 'PROMISE_MILLIONS', 'FREE_MONEY'],
  },
  {
    id: 'sms_scam',
    name: 'SMS / Text Message Scam',
    nameUrdu: 'ایس ایس ایم / ٹیکسٹ میسج اسکیم',
    category: 'Scam',
    severity: 'high',
    description: 'Unsolicited SMS messages with links claiming prize wins, package delivery, bank alerts, or government grants. Links lead to credential-stealing or malware sites.',
    descriptionUrdu: 'غیر مطلوبہ ایس ایس ایم پیغامات جن میں انعام جیتنے، پیکج ڈلیوری، بینک الرٹ، یا حکومتی گرانت کے لنکس ہوتے ہیں۔ لنکس ڈیٹا چوری یا میلویئر سائٹس پر لے جاتے ہیں۔',
    examples: [
      'Your HBL account has been suspended. Verify: hbl-check.com',
      'TCS package awaiting delivery. Track: tcs-track.xyz',
      'Government announced Rs 25,000 relief. Apply: gov-relief.pk',
      'Your SIM will be deactivated. Click to verify identity',
    ],
    reportedCount2024: 15600,
    reportedCount2025: 14200,
    trend: 'stable',
    preventionTips: [
      'Never click links in unexpected SMS messages',
      'Verify by calling the official number directly',
      'Block and report spam numbers',
      'Do not reply to suspicious messages',
    ],
    relevantIndicators: ['URL_SHORTENER', 'SUSPICIOUS_TLD', 'SCAM_KEYWORD', 'ACCOUNT_SUSPENSION'],
  },
  {
    id: 'loan_scam',
    name: 'Fake Loan / Credit Scam',
    nameUrdu: 'جھوٹے قرض / کریڈٹ اسکیم',
    category: 'Financial',
    severity: 'high',
    description: 'Fake loan apps or messages offering instant loans with low interest. Victims pay "processing fee" upfront, receive nothing. Some apps steal personal data.',
    descriptionUrdu: 'جھوٹی قرض ایپس یا پیغامات جو فوری قرض کم سود پر پیش کرتے ہیں۔ زیر کار "پروسیسنگ فیس" ادا کرتے ہیں، کچھ نہیں ملتا۔ کچھ ایپس ذاتی ڈیٹا چوری کرتی ہیں۔',
    examples: [
      'Instant loan — Rs 500,000 approved in 5 minutes',
      'No documents needed — salary loan for government employees',
      'Pay Rs 2,000 processing fee to unlock Rs 100,000 loan',
      'Lowest interest rate — apply now before offer expires',
    ],
    reportedCount2024: 6700,
    reportedCount2025: 5800,
    trend: 'stable',
    preventionTips: [
      'Legitimate lenders do not ask for upfront fees',
      'Only borrow from SECP-registered lenders',
      'Check app reviews and developer information',
      'Never share CNIC photos with unknown apps',
    ],
    relevantIndicators: ['FAKE_JOB_FEE', 'MANDATE_FEE', 'URGENCY', 'TIME_PRESSURE'],
  },
  {
    id: 'social_media_scam',
    name: 'Social Media Impersonation Scam',
    nameUrdu: 'سوشل میڈیا نقالت اسکیم',
    category: 'Impersonation',
    severity: 'medium',
    description: 'Fake profiles impersonating celebrities, influencers, or companies on Facebook/Instagram. Run fake giveaways or sell non-existent products.',
    descriptionUrdu: 'فیس بک/انسٹاگرام پر مشہور اشخاص، انفلوئنسرز یا کمپنیوں کی نقالت کرنے والی جھوٹی پروفائلز۔ جھوٹے گیو اے چلاتے ہیں یا موجود نہ مصنوعات بیچتے ہیں۔',
    examples: [
      'Official HBL giveaway — like and share to win Rs 100,000',
      'Send Rs 500 to receive Rs 5,000 in your account',
      'Limited stock — order now and pay on delivery',
      'Join our investment group — guaranteed profits',
    ],
    reportedCount2024: 8200,
    reportedCount2025: 9400,
    trend: 'rising',
    preventionTips: [
      'Check for blue verification ticks on official pages',
      'Companies never ask for money in giveaways',
      'Search "[brand name] scam" before engaging',
      'Report fake profiles to the platform',
    ],
    relevantIndicators: ['IMPERSONATION', 'LOOKALIKE', 'SENDER_MISMATCH', 'BRAND_IMPERSONATION'],
  },
];

export const scamStats2024: ScamStat[] = [
  {
    year: 2024,
    country: 'Pakistan',
    totalReports: 184000,
    totalLosses: 'PKR 12.5 Billion',
    topCategory: 'Banking/Financial Fraud',
    averageLossPerCase: 'PKR 67,900',
    source: 'FIA Cyber Crime Wing Annual Report 2024',
  },
  {
    year: 2024,
    country: 'Global',
    totalReports: 2600000,
    totalLosses: 'USD 12.5 Billion',
    topCategory: 'Investment Fraud',
    averageLossPerCase: 'USD 4,800',
    source: 'FTC Consumer Sentinel Network 2024',
  },
];

export const scamStats2025: ScamStat[] = [
  {
    year: 2025,
    country: 'Pakistan',
    totalReports: 210000,
    totalLosses: 'PKR 15.8 Billion (Jan-Jun)',
    topCategory: 'Investment Fraud',
    averageLossPerCase: 'PKR 75,200',
    source: 'FIA Cyber Crime Wing Mid-Year Report 2025',
  },
  {
    year: 2025,
    country: 'Global',
    totalReports: 1450000,
    totalLosses: 'USD 8.2 Billion (Jan-Jun)',
    topCategory: 'AI-Powered Scams',
    averageLossPerCase: 'USD 5,600',
    source: 'FTC Consumer Sentinel Network 2025 (H1)',
  },
];

export const preventionTipsByCategory: Record<string, { en: string; ur: string; ro: string }[]> = {
  Financial: [
    { en: 'Never invest in platforms you cannot verify with SECP/SEC', ur: 'SECP/SEC سے تصدیق نہ ہو سکنے والے پلیٹ فارم میں کبھی سرمایہ کاری نہ کریں', ro: 'Kabhi SECP/SEC se tasdeeq na ho sakenay walay platform mein invest na karein' },
    { en: 'If it sounds too good to be true, it is a scam', ur: 'اگر یہ بہت اچھا لگتا ہے تو یہ دھوکہ ہے', ro: 'Agar yeh bohot acha lagta hai to yeh dhoka hai' },
    { en: 'Check company registration on SECP eServices portal', ur: 'کمپنی کی رجسٹریشن SECP eServices پورٹل پر چیک کریں', ro: 'Company ki registration SECP eServices portal par check karein' },
  ],
  'Credential Theft': [
    { en: 'Banks never ask for PIN, OTP, or password via SMS/email', ur: 'بینک کبھی SMS/ای میل کے ذریعے PIN، OTP یا پاس ورڈ نہیں مانگتے', ro: 'Banks kabhi SMS/email ke zariye PIN, OTP ya password nahi mangte' },
    { en: 'Always type your bank URL directly — never click links', ur: 'ہمیشہ اپنا بینک URL خود ٹائپ کریں — کبھی لنکس پر کلک نہ کریں', ro: 'Hamesha apna bank URL khud type karein — kabhi links par click na karein' },
    { en: 'Enable two-factor authentication on all accounts', ur: 'تمام اکاؤنٹس پر دو عنصری تصدیق فعال کریں', ro: 'Tamam accounts par do unsar tasdeeq faal karein' },
  ],
  Scam: [
    { en: 'You cannot win a lottery you never entered', ur: 'آپ وہ لاتری نہیں جیت سکتے جس میں آپ نے حصہ نہیں لیا', ro: 'Aap woh lottery nahi jeet sakte jis mein aap ne hissa nahi liya' },
    { en: 'Never pay fees to collect a prize', ur: 'انعام جمع کرنے کے لیے کبھی فیس نہ ادا کریں', ro: 'Inaam jama karne ke liye kabhi fees na ada karein' },
    { en: 'Legitimate giveaways do not require payment', ur: 'جائز گیو اے میں ادائیگی درکار نہیں ہوتی', ro: 'Jaiz giveaways mein adaiagi darkar nahi hoti' },
  ],
  Gambling: [
    { en: 'Online gambling is illegal in Pakistan', ur: 'پاکستان میں آن لائن جوئے غیر قانونی ہے', ro: 'Pakistan mein online juwa ghair qanooni hai' },
    { en: 'If you cannot withdraw winnings, it is a scam', ur: 'اگر آپ جیتے ہوئے پیسے واپس نہیں لے سکتے تو یہ دھوکہ ہے', ro: 'Agar aap jeetay huay paise wapas nahi le sakte to yeh dhoka hai' },
  ],
};

export function getTrendsByCategory(category: string): ScamTrend[] {
  return scamTrends.filter((t) => t.category === category);
}

export function getRisingTrends(): ScamTrend[] {
  return scamTrends.filter((t) => t.trend === 'rising');
}

export function getTrendById(id: string): ScamTrend | undefined {
  return scamTrends.find((t) => t.id === id);
}

export function getStatsForCountry(country: string, year: number): ScamStat | undefined {
  const stats = year === 2025 ? scamStats2025 : scamStats2024;
  return stats.find((s) => s.country === country);
}

export function getContextForIndicators(indicators: string[]): ScamTrend[] {
  return scamTrends.filter((t) =>
    t.relevantIndicators.some((ri) => indicators.includes(ri))
  );
}
