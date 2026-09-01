'use client';

import { useState, useEffect, useCallback } from 'react';

interface Authority {
  name: string;
  type: string;
  website: string;
  reportingUrl: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
}

interface ComplaintProcedure {
  title: string;
  steps: string[];
  url?: string;
  requiredDocuments?: string;
}

type Lang = 'en' | 'ur' | 'ro';

const countries = [
  'Pakistan', 'India', 'United States', 'United Kingdom', 'Canada',
  'Australia', 'Germany', 'France', 'Japan', 'China',
  'Brazil', 'Nigeria', 'South Africa', 'United Arab Emirates', 'Saudi Arabia',
  'Turkey', 'Indonesia', 'Mexico', 'Russia', 'Other',
];

// Map display names to database country names
const countryNameMap: Record<string, string> = {
  'UAE': 'United Arab Emirates',
  'United Arab Emirates': 'United Arab Emirates',
};

function getDbCountryName(displayName: string): string {
  return countryNameMap[displayName] || displayName;
}

const evidenceTips: Record<Lang, string[]> = {
  en: [
    'Take screenshots of all communications, websites, and transactions immediately',
    'Save original emails with full headers (do not forward — forward strips headers)',
    'Record dates, times, and details of all interactions with the scammer',
    'Preserve any files, attachments, or documents received',
    'Keep records of financial transactions including bank statements and receipts',
    'Do not delete text messages or call logs — back them up first',
    'Write down a timeline of events while your memory is fresh',
    'If possible, note IP addresses, phone numbers, and account names used by the scammer',
  ],
  ur: [
    'تمام مواصلات، ویب سائٹوں اور لین دین کی فوری طور پر اسکرین شوٹ لیں',
    'اصل ای میلز کو مکمل ہیڈرز کے ساتھ محفوظ کریں (فارورڈ نہ کریں — فارورڈ ہیڈرز ہٹا دیتا ہے)',
    'دھوکہ دہنے والے کے ساتھ تمام ملاقاتوں کی تاریخیں، اوقات اور تفصیلات ریکارڈ کریں',
    'مولیے فائلز، منسلکات یا وصول شدہ دستاویزات محفوظ رکھیں',
    'بینک اسٹیٹمنٹس اور رسیدوں سمیت مالی لین دین کے ریکارڈ رکھیں',
    'ٹیکسٹ میسجز یا کال لاگز حذف نہ کریں — پہلے بیک اپ لیں',
    'یادداشت تازہ ہونے پر واقعات کی ٹائم لائن لکھ لیں',
    'اگر ممکن ہو تو دھوکہ دہنے والے کے IP ایڈریس، فون نمبر اور اکاؤنٹ نام نوٹ کریں',
  ],
  ro: [
    'Tamam communications, websites aur transactions ki foran screenshots lein',
    'Asli emails ko mukammal headers ke sath save karein (forward na karein — forward headers hata deta hai)',
    'Dhokha dene wale ke sath tamam mulaqaton ki dates, waqt aur tafseelaat record karein',
    'Mooli files, attachments ya wasool shuda dastavezat mehfooz rakhein',
    'Bank statements aur receipts samait mali transactions ke records rakhein',
    'Text messages ya call logs delete na karein — pehle backup lein',
    'Yaad-daasht taza hone par waqiat ki timeline likh lein',
    'Agar mumkin ho to dhokha dene wale ke IP address, phone number aur account name note karein',
  ],
};

const moneyLostSteps: Record<Lang, string[]> = {
  en: [
    'Contact your bank or financial institution immediately to freeze or reverse the transaction',
    'File a police report at your nearest station — get a copy of the report',
    'Report to your national cybercrime authority using the contacts above',
    'If you used a credit card, contact your card issuer to initiate a chargeback',
    'If you sent money via wire transfer (Western Union, MoneyGram), contact them to try to reverse',
    'Change all passwords for accounts that may have been compromised',
    'Enable two-factor authentication on all financial accounts',
    'Do not send any more money — scammers often ask for additional payments',
    'Seek legal advice if significant amounts are involved',
    'Report to consumer protection agencies in your country',
  ],
  ur: [
    'فوراً اپنے بینک یا مالی ادارے سے رابطہ کریں تاکہ لین دین روکا یا واپس کیا جا سکے',
    'نزدیکی تھانے میں پولیس رپورٹ درج کریں — رپورٹ کی کاپی حاصل کریں',
    'اوپر دیے گئے روابط کا استعمال کرتے ہوئے اپنے قومی سائبر کرائم ادارے کو رپورٹ کریں',
    'اگر آپ نے کریٹ کارڈ استعمال کیا ہے تو چارج بیک شروع کرنے کے لیے اپنے کارڈ جاری کرنے والے سے رابطہ کریں',
    'اگر آپ نے وائر ٹرانسفر (Western Union, MoneyGram) کے ذریعے پیسے بھیجے ہیں تو واپس کرنے کی کوشش کے لیے ان سے رابطہ کریں',
    'ان اکاؤنٹس کے تمام پاس ورڈز تبدیل کریں جو متاثر ہو سکتے ہیں',
    'تمام مالی اکاؤنٹس پر دو عنصری تصدیق (2FA) فعال کریں',
    'مزید پیسے نہ بھیجیں — دھوکہ دہنے والے اکثر اضافی ادائیگیاں مانگتے ہیں',
    'اگر بڑی رقم شامل ہو تو قانونی مشورہ حاصل کریں',
    'اپنے ملک میں صارفین کے تحفظ کے اداروں کو رپورٹ کریں',
  ],
  ro: [
    'Foran apne bank ya maali idaaray se rabta karein taake transaction roka ya wapas kiya ja sake',
    'Qareebi thanay mein police report darj karein — report ki copy haasil karein',
    'Upar diye gaye raabton ka istemaal karte hue apne qaumi cybercrime idaaray ko report karein',
    'Agar aap ne credit card istemaal kiya hai to chargeback shuru karne ke liye apne card jaari karne wale se rabta karein',
    'Agar aap ne wire transfer (Western Union, MoneyGram) ke zariye paise bheje hain to wapas karne ki koshish ke liye un se rabta karein',
    'Un accounts ke tamam passwords tabdeel karein jo mutasir ho sakte hain',
    'Tamam maali accounts par do unsar tasdeeq (2FA) fa’al karein',
    'Mazeed paise na bhejein — dhokha dene wale aksar izafi adaiagiyan mangte hain',
    'Agar bari raqam shamil ho to qanooni mashwara haasil karein',
    'Apne mulk mein saari’in ke tahaffuz ke idaaray ko report karein',
  ],
};

const complaintRequirements: Record<Lang, { title: string; items: string[] }> = {
  en: {
    title: 'What You Need to File a Complaint',
    items: [
      'Valid CNIC / Passport / Government ID',
      'Screenshots of fraudulent messages, emails, or websites',
      'Bank transaction records and receipts',
      'Phone call recordings (if available)',
      'SMS screenshots and call log records',
      'Written complaint letter stating what happened',
      'Any communication with the fraudster (emails, chats, letters)',
      'Transaction reference numbers and amounts',
      'Date and time of the incident',
      'Contact details of the scammer (phone, email, account)',
    ],
  },
  ur: {
    title: 'شکایت درج کرنے کے لیے کیا درکار ہے',
    items: [
      'درست شناختی کارڈ / پاسپورٹ / حکومتی شناخت',
      'دھوکہ دہنے والے پیغامات، ای میلز یا ویب سائٹوں کے اسکرین شوٹ',
      'بینک لین دین کے ریکارڈ اور رسیدیں',
      'فون کال کی ریکارڈنگ (اگر دستیاب ہو)',
      'ایس ایس ایم ایس کے اسکرین شوٹ اور کال لاگز',
      'تفصیلی شکایت نامہ جس میں واقعہ بیان ہو',
      'دھوکہ دہنے والے کے ساتھ کوئی بھی مواصلت (ای میلز، چیٹ، خطوط)',
      'لین دین کے حوالہ نمبر اور رقم',
      'واقعے کی تاریخ اور وقت',
      'دھوکہ دہنے والے کے رابطے کی تفصیلات (فون، ای میل، اکاؤنٹ)',
    ],
  },
  ro: {
    title: 'Shikayat darj karne ke liye kya darkar hai',
    items: [
      'Durust shinahti card / passport / hukumati shinahti',
      'Dhokha dene wale paighamat, emails ya websites ke screenshots',
      'Bank transactions ke records aur receipts',
      'Phone call ki recordings (agar dastyab ho)',
      'SMS ke screenshots aur call logs',
      'Tafseeli shikayat naamah jis mein waqiya bayaan ho',
      'Dhokha dene wale ke sath koi bhi mawaakilat (emails, chats, khatoot)',
      'Transaction ke reference numbers aur raqam',
      'Waqiye ki tarikh aur waqt',
      'Dhokha dene wale ke rabtay ki tafseelaat (phone, email, account)',
    ],
  },
};

const langLabels: Record<Lang, { label: string; flag: string }> = {
  en: { label: 'English', flag: 'EN' },
  ur: { label: 'اردو', flag: 'UR' },
  ro: { label: 'Roman Urdu', flag: 'RO' },
};

function parseSteps(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((s): s is string => typeof s === 'string');
  try {
    const parsed = JSON.parse(String(raw));
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

export default function ReportingPage() {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [authorities, setAuthorities] = useState<Authority[]>([]);
  const [complaints, setComplaints] = useState<ComplaintProcedure[]>([]);
  const [loadingAuthorities, setLoadingAuthorities] = useState(false);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>('en');

  const fetchAuthorities = useCallback(async (country: string) => {
    setLoadingAuthorities(true);
    setAuthorities([]);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const dbCountry = getDbCountryName(country);
      const res = await fetch(`/api/fraud/authorities?country=${encodeURIComponent(dbCountry)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to load authorities');
      const data = await res.json();
      const list = Array.isArray(data.data) ? data.data : data.authorities;
      setAuthorities(Array.isArray(list) ? list : []);
    } catch {
      setError('Failed to load authorities');
    } finally {
      setLoadingAuthorities(false);
    }
  }, []);

  const fetchComplaints = useCallback(async (country: string) => {
    setLoadingComplaints(true);
    setComplaints([]);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const dbCountry = getDbCountryName(country);
      const res = await fetch(`/api/fraud/authorities/complaints?country=${encodeURIComponent(dbCountry)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to load complaint procedures');
      const data = await res.json();
      const rows = Array.isArray(data.data) ? data.data : data.procedures;
      setComplaints(
        (Array.isArray(rows) ? rows : []).map((row) => {
          const categoryLabel = String(row.category || '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c: string) => c.toUpperCase());
          return {
            title: [row.authority?.name, categoryLabel].filter(Boolean).join(' – '),
            steps: parseSteps(row.procedureSteps ?? row.steps),
            url: row.sourceUrl || row.url || undefined,
            requiredDocuments: row.requiredDocuments || undefined,
          };
        })
      );
    } catch {
      setError('Failed to load complaint procedures');
    } finally {
      setLoadingComplaints(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      setError(null);
      fetchAuthorities(selectedCountry);
      fetchComplaints(selectedCountry);
    }
  }, [selectedCountry, fetchAuthorities, fetchComplaints]);

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <a href="/fraud" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Fraud Center
          </a>
          <h1 className="text-2xl font-bold text-gray-100">Report & Authorities</h1>
          <p className="text-gray-500 mt-1">Find cybercrime authorities and learn how to report fraud in your country</p>
        </div>
        <div className="flex bg-white/5 rounded-lg p-0.5">
          {(Object.keys(langLabels) as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                lang === l
                  ? 'bg-white/10 text-gray-100 shadow-sm'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {langLabels[l].flag}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1">
          Select Your Country
        </label>
        <select
          id="country"
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="input-field"
        >
          <option value="">Choose a country...</option>
          {countries.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {!selectedCountry && (
        <div className="card bg-blue-500/10 border border-blue-500/30">
          <p className="text-sm text-blue-300">
            Select your country above to view relevant cybercrime authorities, reporting procedures, and emergency contacts.
          </p>
        </div>
      )}

      {error && (
        <div className="card bg-red-500/10 border border-red-500/30">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {selectedCountry && (
        <div className="space-y-6 animate-slide-up">
          <div>
            <h2 className="text-lg font-semibold text-gray-100 mb-3">Cyber Authorities</h2>
            {loadingAuthorities ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="card animate-pulse space-y-2">
                    <div className="h-5 skeleton rounded w-1/2" />
                    <div className="h-4 skeleton rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : authorities.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-gray-500">No authorities found for this country</p>
              </div>
            ) : (
              <div className="space-y-3">
                {authorities.map((auth, i) => (
                  <div key={i} className="card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-100">{auth.name}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{auth.type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</p>
                      </div>
                      {auth.reportingUrl && (
                        <a
                          href={auth.reportingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-red-600/20 text-red-300 text-xs font-semibold hover:bg-red-600/30 transition-colors"
                        >
                          Report Now \u2197
                        </a>
                      )}
                    </div>
                    {auth.description && (
                      <p className="text-sm text-gray-400 mt-2">{auth.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 pt-3 border-t border-border/30">
                      {auth.phone && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-500">Helpline:</span>
                          <a href={`tel:${auth.phone}`} className="text-sm text-green-400 font-semibold hover:underline">
                            {auth.phone}
                          </a>
                        </div>
                      )}
                      {auth.email && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-500">Email:</span>
                          <a href={`mailto:${auth.email}`} className="text-xs text-blue-400 hover:underline">
                            {auth.email}
                          </a>
                        </div>
                      )}
                      {auth.website && (
                        <a
                          href={auth.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:underline"
                        >
                          Website \u2197
                        </a>
                      )}
                    </div>
                    {auth.address && (
                      <p className="text-xs text-gray-600 mt-2">{auth.address}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-100 mb-3">Complaint Procedures</h2>
            {loadingComplaints ? (
              <div className="card animate-pulse space-y-2">
                <div className="h-5 skeleton rounded w-1/2" />
                <div className="h-4 skeleton rounded w-full" />
                <div className="h-4 skeleton rounded w-3/4" />
              </div>
            ) : complaints.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-gray-500">No complaint procedures found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {complaints.map((proc, i) => (
                  <div key={i} className="card">
                    <h3 className="font-semibold text-gray-100 mb-2">{proc.title}</h3>
                    <ol className="list-decimal list-inside space-y-1">
                      {proc.steps.map((step, j) => (
                        <li key={j} className="text-sm text-gray-400">{step}</li>
                      ))}
                    </ol>
                    {proc.requiredDocuments && (
                      <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <p className="text-xs font-semibold text-amber-300 mb-1">Required Documents:</p>
                        <p className="text-xs text-gray-300">{proc.requiredDocuments}</p>
                      </div>
                    )}
                    {proc.url && (
                      <a
                        href={proc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-sm text-blue-400 hover:text-blue-300 underline"
                      >
                        File Complaint Online ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-100 mb-3">
              {lang === 'en' ? 'Evidence Preservation Tips' : lang === 'ur' ? 'ثبوت محفوظ کرنے کے تجاویز' : 'Evidence Mehfooz Karne Ke Taweezaat'}
            </h2>
            <div className="space-y-2">
              {evidenceTips[lang].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-gray-400">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-100 mb-3">
              {complaintRequirements[lang].title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {complaintRequirements[lang].items.map((item, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-white/5 rounded-lg">
                  <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-300">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card bg-red-500/10 border border-red-500/30">
            <h2 className="text-lg font-semibold text-red-300 mb-3">
              {lang === 'en' ? 'What to Do If You Lost Money' : lang === 'ur' ? 'اگر آپ نے پیسے کھوائے ہیں تو کیا کریں' : 'Agar Aap Ne Paise Khoaye Hain To Kya Karein'}
            </h2>
            <div className="space-y-2">
              {moneyLostSteps[lang].map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-sm font-bold text-red-400 flex-shrink-0">{i + 1}.</span>
                  <p className="text-sm text-gray-300">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
