export interface ComplaintContact {
  name: string;
  nameUrdu: string;
  phone: string;
  website: string;
  address?: string;
  hours?: string;
}

export interface ComplaintPath {
  scamType: string;
  scamTypeUrdu: string;
  immediateActions: string[];
  immediateActionsUrdu: string[];
  complaintContacts: ComplaintContact[];
  requiredDocuments: string[];
  requiredDocumentsUrdu: string[];
  onlineComplaintUrl: string;
  timeframe: string;
  timeframeUrdu: string;
  additionalTips: string[];
  additionalTipsUrdu: string[];
}

const FIA_CONTACT: ComplaintContact = {
  name: 'NCCIA Cybercrime Wing (Helpline 1991)',
  nameUrdu: 'این سی سی آئی اے سائبر کرائم ونگ (ہیلپ لائن 1991)',
  phone: '1991',
  website: 'https://complaint.nccia.gov.pk',
  address: 'NCCIA Headquarters, Sector G-9/4, Islamabad',
  hours: 'Helpline available 24/7',
};

const SBP_CONTACT: ComplaintContact = {
  name: 'State Bank of Pakistan – Sunwai Portal',
  nameUrdu: 'اسٹیٹ بینک آف پاکستان – سنوائی پورٹل',
  phone: '0800-222-78',
  website: 'https://sunwai.sbp.org.pk',
  address: 'I.I. Chundrigar Road, Karachi',
  hours: 'Monday to Friday, 9am to 5pm',
};

const SECP_CONTACT: ComplaintContact = {
  name: 'Securities and Exchange Commission of Pakistan (SECP)',
  nameUrdu: 'سیکیورٹیز اینڈ ایکسچینج کمیشن آف پاکستان (ایس ای سی پی)',
  phone: '+92-51-111-111-472',
  website: 'https://sdms.secp.gov.pk',
  address: 'NIC Building, Jinnah Avenue, Blue Area, Islamabad',
  hours: 'Monday to Friday, 9am to 5pm',
};

const MINISTRY_OVERSEAS_CONTACT: ComplaintContact = {
  name: 'Overseas Pakistanis Foundation – Complaint Portal',
  nameUrdu: 'اوورسیز پاکستانیز فاؤنڈیشن – شکایت پورٹل',
  phone: '+92-51-111-040-040',
  website: 'https://opf.pitb.gov.pk',
  address: 'Block C, Pak Secretariat, Islamabad',
  hours: 'Monday to Friday, 9am to 5pm',
};

const PTA_CONTACT: ComplaintContact = {
  name: 'Pakistan Telecommunication Authority (PTA)',
  nameUrdu: 'پاکستان ٹیلی کامونیکیشن اتھارٹی (پی ٹی اے)',
  phone: '0800-55055',
  website: 'https://complaint.pta.gov.pk/RegisterComplaint.aspx',
  address: 'PTA Headquarters, Sector F-5/1, Islamabad',
  hours: 'Monday to Sunday, 9am to 9pm',
};

const POLICE_15_CONTACT: ComplaintContact = {
  name: 'Police Emergency (Rescue 15)',
  nameUrdu: 'پولیس ایمرجنسی (ریسکیو 15)',
  phone: '15',
  website: 'https://www.punjabpolice.gov.pk',
  address: 'Nearest local police station',
  hours: '24/7',
};

const BANK_FRAUD_DEPT_CONTACT: ComplaintContact = {
  name: 'Your Bank Fraud Department',
  nameUrdu: 'آپ کے بینک کا فراڈ ڈیپارٹمنٹ',
  phone: 'Number printed on your ATM card or bank statement',
  website: 'Use your bank official website or mobile app',
  hours: 'Most banks offer 24/7 phone banking',
};

const JAZZ_CONTACT: ComplaintContact = {
  name: 'Jazz Network Operator',
  nameUrdu: 'جاز نیٹ ورک آپریٹر',
  phone: '111',
  website: 'https://www.jazz.com.pk',
  hours: '24/7 helpline',
};

const ZONG_CONTACT: ComplaintContact = {
  name: 'Zong Network Operator',
  nameUrdu: 'زونگ نیٹ ورک آپریٹر',
  phone: '310',
  website: 'https://www.zong.com.pk',
  hours: '24/7 helpline',
};

const TELENOR_CONTACT: ComplaintContact = {
  name: 'Telenor Network Operator',
  nameUrdu: 'ٹیلینور نیٹ ورک آپریٹر',
  phone: '345',
  website: 'https://www.telenor.com.pk',
  hours: '24/7 helpline',
};

const UFONE_CONTACT: ComplaintContact = {
  name: 'Ufone Network Operator',
  nameUrdu: 'یوفون نیٹ ورک آپریٹر',
  phone: '333',
  website: 'https://www.ufone.com.pk',
  hours: '24/7 helpline',
};

export const complaintPaths: ComplaintPath[] = [
  {
    scamType: 'Bank/Wallet Phishing',
    scamTypeUrdu: 'بینک/والیٹ فشنگ',
    immediateActions: [
      'Call your bank immediately and block your card or account',
      'Never share OTP, PIN or password - real banks never ask for these',
      'Change your banking and mobile app passwords right away',
      'Transfer remaining funds to a safe account if possible',
      'Report to NCCIA Cybercrime Wing within 24 hours',
    ],
    immediateActionsUrdu: [
      'فوری طور پر اپنے بینک کو کال کریں اور اپنا کارڈ یا اکاؤنٹ بلاک کروائیں',
      'کسی کو بھی او ٹی پی، پی آئی این یا پاس ورڈ نہ بتائیں - حقیقی بینک یہ معلومات کبھی نہیں مانگتا',
      'اپنے بیننگ اور موبائل ایپ کے پاس ورڈ فوراً تبدیل کریں',
      'اگر ممکن ہو تو باقی رقم کسی محفوظ اکاؤنٹ میں منتقل کریں',
      '24 گھنٹوں کے اندر ایف آئی اے سائبر کرائم ونگ میں شکایت درج کروائیں',
    ],
    complaintContacts: [FIA_CONTACT, SBP_CONTACT, BANK_FRAUD_DEPT_CONTACT],
    requiredDocuments: [
      'Screenshots of the fraudulent SMS, email or WhatsApp message',
      'Phone number or email used by the scammer',
      'Bank statement showing unauthorized transactions',
      'Transaction receipt or reference numbers',
      'Copy of your CNIC',
    ],
    requiredDocumentsUrdu: [
      'جعلی ایس ایم، ای میل یا واٹس ایپ میسج کے اسکرین شاٹس',
      'فراڈی کے استعمال کردہ فون نمبر یا ای میل ایڈریس',
      'غیر مجاز لین دین ظاہر کرنے والا بینک اسٹیٹمنٹ',
      'ٹرانزیکشن رسید یا ریفرنس نمبرز',
      'شناختی کارڈ (سی این آئی سی) کی نقل',
    ],
    onlineComplaintUrl: 'https://complaint.nccia.gov.pk',
    timeframe: 'Report within 24 hours - fast reporting helps freeze stolen funds before withdrawal',
    timeframeUrdu: '24 گھنٹوں کے اندر شکایت کریں - فوری رپورٹنگ سے چوری شدہ رقم نکلنے سے پہلے منجمد کرانے کا موقع بنتا ہے',
    additionalTips: [
      'Never trust caller ID alone - scammers can fake bank numbers',
      'Real banks never ask for OTP or PIN over call or SMS',
      'Enable SMS and email alerts for every transaction',
      'Always get a complaint reference number from your bank and keep it safe',
    ],
    additionalTipsUrdu: [
      'صرف کالر آئی ڈی پر بھروسہ نہ کریں - فراڈی بینک کے نمبر بھی نقلی بنا سکتے ہیں',
      'حقیقی بینک کال یا ایس ایم پر کبھی او ٹی پی یا پی آئی این نہیں مانگتا',
      'ہر لین دین کے لیے ایس ایم اور ای میل الرٹس فعال کروائیں',
      'اپنے بینک سے شکایت کا ریفرنس نمبر ضرور لیں اور محفوظ رکھیں',
    ],
  },
  {
    scamType: 'Investment Scam',
    scamTypeUrdu: 'سرمایہ کاری اسکیم',
    immediateActions: [
      'Stop sending more money immediately even if they promise returns',
      'Take screenshots of the app, website, group chats and payment receipts',
      'Demand withdrawal of your funds in writing and save their response',
      'Report the receiving bank account or wallet to your bank',
      'File complaints with SECP and NCCIA Cybercrime Wing',
    ],
    immediateActionsUrdu: [
      'فوری طور پر مزید رقم بھیجنا بند کریں، چاہے وہ منافع کا وعدہ ہی کریں',
      'سرمایہ کاری ایپ، ویب سائٹ، گروپ چیٹس اور ادائیگی کی رسیدوں کے اسکرین شاٹس محفوظ کریں',
      'تحریری طور پر اپنی رقم واپس لینے کا مطالبہ کریں اور ان کے جوابات محفوظ رکھیں',
      'فراڈی کے بینک اکاؤنٹ یا والٹ کی اطلاع اپنے بینک کو دیں',
      'ایس ای سی پی اور ایف آئی اے سائبر کرائم ونگ میں شکایت درج کروائیں',
    ],
    complaintContacts: [FIA_CONTACT, SECP_CONTACT, SBP_CONTACT],
    requiredDocuments: [
      'Proof of all payments such as bank slips and EasyPaisa/JazzCash receipts',
      'Screenshots of investment app or dashboard showing promised profits',
      'Chat history with agents or promoters on WhatsApp or Telegram',
      'Company name, website link and account numbers used',
      'Copy of your CNIC and your contact details',
    ],
    requiredDocumentsUrdu: [
      'تمام ادائیگیوں کے ثبوت جیسے بینک سلپس اور ایزی پیسہ/جاز کیش کی رسیدیں',
      'سرمایہ کاری ایپ یا ڈیش بورڈ کے اسکرین شاٹس جن میں وعدہ شدہ منافع دکھایا گیا ہو',
      'ایجنٹوں یا پرموٹرز کے ساتھ چیٹ ہسٹری (واٹس ایپ یا ٹیلی گرام)',
      'کمپنی کا نام، ویب سائٹ لنک اور استعمال شدہ اکاؤنٹ نمبرز',
      'شناختی کارڈ کی نقل اور اپنے رابطے کی تفصیلات',
    ],
    onlineComplaintUrl: 'https://sdms.secp.gov.pk',
    timeframe: 'Report within 3 to 7 days while fraudster accounts are still active',
    timeframeUrdu: '3 سے 7 دنوں کے اندر رپورٹ کریں جبکہ فراڈی کے اکاؤنٹس ابھی فعال ہیں',
    additionalTips: [
      'Check the list of licensed companies on secp.gov.pk before investing anywhere',
      'Guaranteed high returns are always a sign of fraud',
      'Beware of Ponzi schemes that pay old members from new members money',
      'Never invest through personal bank accounts or unregistered apps',
    ],
    additionalTipsUrdu: [
      'سرمایہ کاری سے پہلے secp.gov.pk پر لائسنس یافتہ کمپنیوں کی فہرست چیک کریں',
      'ضمانت کے ساتھ بہت زیادہ منافع کا وعدہ ہمیشہ فراڈ کی نشانی ہے',
      'پرانے ممبروں کو نئے ممبروں کی رقم سے منافع دینے والی پونزی اسکیموں سے خبردار رہیں',
      'ذاتی بینک اکاؤنٹس یا غیر رجسٹرڈ ایپس میں کبھی سرمایہ کاری نہ کریں',
    ],
  },
  {
    scamType: 'Job Scam',
    scamTypeUrdu: 'جھوٹی نوکری اسکیم',
    immediateActions: [
      'Stop all payments immediately - genuine employers never charge fees',
      'Block the recruiter number and report the job ad to the platform',
      'Verify whether the company is registered with SECP or registrar of companies',
      'For overseas jobs confirm the agency is licensed by Bureau of Emigration',
      'Report to NCCIA with full chat and payment records',
    ],
    immediateActionsUrdu: [
      'فوری طور پر تمام ادائیگیاں بند کریں - حقیقی آجر کبھی فیس وصول نہیں کرتا',
      'ریکروٹر کا نمبر بلاک کریں اور جاب ایڈ کو متعلقہ پلیٹ فارم پر رپورٹ کریں',
      'تصدیق کریں کہ کمپنی ایس ای سی پی یا رجسٹرار آف کمپنیز میں رجسٹرڈ ہے',
      'بیرونِ ملک ملازمت کی صورت میں بیورو آف ایمیگریشن سے لائسنس یافتہ ایجنسی کی تصدیق کریں',
      'مکمل چیٹ ریکارڈ اور ادائیگی کے ثبوات کے ساتھ ایف آئی اے میں شکایت کریں',
    ],
    complaintContacts: [FIA_CONTACT, MINISTRY_OVERSEAS_CONTACT],
    requiredDocuments: [
      'Screenshot and link of the job advertisement',
      'All chat records with the recruiter',
      'Payment receipts of registration or processing fees',
      'Offer letter or appointment email if received',
      'Copy of your CNIC',
    ],
    requiredDocumentsUrdu: [
      'نوکری کے اشتہار کا اسکرین شاٹ اور لنک',
      'ریکروٹر کے ساتھ تمام چیٹ ریکارڈ',
      'رجسٹریشن یا پروسیسنگ فیس کی ادائیگی کی رسیدیں',
      'آفر لیٹر یا تقرری کی ای میل اگر موصول ہوئی ہو',
      'شناختی کارڈ کی نقل',
    ],
    onlineComplaintUrl: 'https://complaint.nccia.gov.pk',
    timeframe: 'Report immediately - money sent abroad or across multiple accounts rarely comes back',
    timeframeUrdu: 'فوری شکایت کریں - بیرونِ ملک یا مختلف اکاؤنٹس میں بھیجی گئی رقم کبھی کبھار واپس آتی ہے',
    additionalTips: [
      'No legitimate company asks for money for interviews or training',
      'Use only licensed recruiting agencies listed by the Bureau of Emigration for overseas jobs',
      'Be suspicious of very high salaries offered for little work',
      'Never share CNIC photos or documents before verifying the employer',
    ],
    additionalTipsUrdu: [
      'کوئی جائز کمپنی انٹرویو یا ٹریننگ کے لیے پیسے نہیں لیتی',
      'بیرونِ ملک نوکری صرف بیورو آف ایمیگریشن کی فہرست میں شامل لائسنس یافتہ بھرتی ایجنسیوں سے حاصل کریں',
      'کم محنت پر بہت زیادہ تنخواہ کی پیشکش پر شک کریں',
      'آجر کی تصدیق سے پہلے شناختی کارڈ کی تصویر یا دستاویزات شیئر نہ کریں',
    ],
  },
  {
    scamType: 'Prize/Lottery Scam',
    scamTypeUrdu: 'انعام/لاتری اسکیم',
    immediateActions: [
      'Do not send any fee or tax money - real prizes never require payment',
      'Do not share CNIC or bank details and do not open links in the message',
      'Block the sender number immediately',
      'Forward the scam SMS to 9000 so PTA can act against the sender',
      'If you already sent money file a complaint with NCCIA right away',
    ],
    immediateActionsUrdu: [
      'کوئی فیس یا ٹیکس نہ بھیجیں - حقیقی انعام کے لیے کبھی ادائیگی ضروری نہیں ہوتی',
      'شناختی کارڈ یا بینک کی تفصیلات شیئر نہ کریں اور میسج کے لنکس نہ کھولیں',
      'بھیجنے والے کا نمبر فوری بلاک کریں',
      'اسپیم ایس ایم کو 9000 پر فارورڈ کریں تاکہ پی ٹی اے کارروائی کر سکے',
      'اگر پہلے ہی رقم بھیج چکے ہیں تو فوری طور پر ایف آئی اے میں شکایت کریں',
    ],
    complaintContacts: [FIA_CONTACT, PTA_CONTACT],
    requiredDocuments: [
      'Screenshot of the prize or lottery SMS and call log details',
      'Phone number of the sender',
      'Payment receipts if any money was sent',
      'Copy of your CNIC',
    ],
    requiredDocumentsUrdu: [
      'انعام یا لاری والے ایس ایم کا اسکرین شاٹ اور کال لاگ کی تفصیلات',
      'بھیجنے والے کا فون نمبر',
      'اگر رقم بھیجی ہو تو ادائیگی کی رسیدیں',
      'شناختی کارڈ کی نقل',
    ],
    onlineComplaintUrl: 'https://complaint.pta.gov.pk/RegisterComplaint.aspx',
    timeframe: 'Report within 48 hours if any payment was made',
    timeframeUrdu: 'اگر کوئی ادائیگی ہوئی ہو تو 48 گھنٹوں کے اندر رپورٹ کریں',
    additionalTips: [
      'You cannot win a lottery or prize draw you never entered',
      'Telecom easyload prizes come only through official channels like 111, 310, 345 and 333',
      'Never pay a processing fee or tax to receive a prize',
      'Forward suspicious prize messages to 9000 so senders get blocked',
    ],
    additionalTipsUrdu: [
      'جس لاری یا انعامی ڈرا میں حصہ نہیں لیا اس جیتنا ممکن نہیں',
      'ٹیلی کم ایزلوڈ انعامات صرف سرکاری نمبروں جیسے 111، 310، 345 اور 333 سے آتے ہیں',
      'انعام لینے کے لیے پروسیسنگ فیس یا ٹیکس کبھی نہ دیں',
      'مشکوک انعامی میسجز 9000 پر فارورڈ کریں تاکہ بھیجنے والے بلاک ہو سکیں',
    ],
  },
  {
    scamType: 'Gambling Scam',
    scamTypeUrdu: 'جوئے/بیٹنگ اسکیم',
    immediateActions: [
      'Stop betting and depositing money immediately',
      'Try to withdraw your remaining balance and keep proof of withdrawal requests',
      'Take screenshots of the betting site or app and all your transactions',
      'Remember gambling and betting are illegal in Pakistan - avoid further involvement',
      'Report the platform and related accounts to NCCIA Cybercrime Wing',
    ],
    immediateActionsUrdu: [
      'جوئے اور رقم جمع کرنا فوری طور پر بند کریں',
      'اپنا بچا ہوا بیلنس نکلوانے کی کوشش کریں اور درخواستوں کا ثبوت محفوظ رکھیں',
      'بیٹنگ سائٹ یا ایپ اور تمام لین دین کے اسکرین شاٹس لیں',
      'یاد رکھیں پاکستان میں جوا اور بیٹنگ غیر قانونی ہے - مزید ملوث ہونے سے بچیں',
      'پلیٹ فارم اور متعلقہ اکاؤنٹس کی شکایت ایف آئی اے سائبر کرائم ونگ میں کریں',
    ],
    complaintContacts: [FIA_CONTACT, POLICE_15_CONTACT],
    requiredDocuments: [
      'Website or app link and screenshots',
      'Deposit proofs through bank, EasyPaisa or JazzCash',
      'Chats with agents or admins promising commissions',
      'Copy of your CNIC',
    ],
    requiredDocumentsUrdu: [
      'ویب سائٹ یا ایپ کا لنک اور اسکرین شاٹس',
      'بینک، ایزی پیسہ یا جاز کیش سے جمع کرانے کے ثبوت',
      'ایجنٹوں یا ایڈمنز کے ساتھ کمیشن کے وعدوں والی چیٹ',
      'شناختی کارڈ کی نقل',
    ],
    onlineComplaintUrl: 'https://complaint.nccia.gov.pk',
    timeframe: 'Report as soon as withdrawals are blocked - delays make recovery impossible',
    timeframeUrdu: 'جیسے ہی واپسی روکی جائے فوری رپورٹ کریں - تاخیر سے وصولی ناممکن ہو جاتی ہے',
    additionalTips: [
      'Betting apps that block withdrawals after big deposits are common frauds',
      'Guaranteed win tip groups on WhatsApp or Telegram are run by scammers',
      'Gambling is illegal in Pakistan and losses usually cannot be recovered legally',
      'Never invite friends into betting groups - you could be blamed for their losses',
    ],
    additionalTipsUrdu: [
      'بڑی رقم جمع کرانے کے بعد واپسی روک دینے والی بیٹنگ ایپس عام فراڈ ہیں',
      'واٹس ایپ یا ٹیلی گرام پر ضمانت شدہ جیت والے ٹپ گروپ فراڈی چلاتے ہیں',
      'پاکستان میں جوا غیر قانونی ہے اور نقصان عام طور پر قانونی طریقے سے واپس نہیں ملتا',
      'دوسروں کو بیٹنگ گروپس میں دعوت نہ دیں - ان کے نقصان کا الزام آپ پر آ سکتا ہے',
    ],
  },
  {
    scamType: 'SMS/Text Scam',
    scamTypeUrdu: 'ایس ایس ایم/ٹیکسٹ اسکیم',
    immediateActions: [
      'Do not reply to the message or call back on the number',
      'Do not open links or download files attached in the message',
      'Forward the scam SMS to 9000 to report spam to PTA',
      'Block and delete the conversation',
      'Warn family members especially elders about this number',
    ],
    immediateActionsUrdu: [
      'اس نمبر پر جواب نہ دیں اور واپس کال نہ کریں',
      'میسیج میں موجود لنکس نہ کھولیں اور فائلیں ڈاؤن لوڈ نہ کریں',
      'پی ٹی اے کو سپام کی اطلاع دینے کے لیے میسج کو 9000 پر فارورڈ کریں',
      'گفتگو بلاک کر کے ڈیلیٹ کریں',
      'خاندان کے افراد خصوصاً بزرگ افراد کو اس نمبر سے آگاہ کریں',
    ],
    complaintContacts: [FIA_CONTACT, PTA_CONTACT, JAZZ_CONTACT, ZONG_CONTACT, TELENOR_CONTACT, UFONE_CONTACT],
    requiredDocuments: [
      'Full screenshot of the SMS showing sender number and date time',
      'The link contained in the message - copy text only and never open it',
      'Proof of any payment made if you replied to the message',
      'Copy of your CNIC',
    ],
    requiredDocumentsUrdu: [
      'ایس ایم کا مکمل اسکرین شاٹ جس میں بھیجنے والا نمبر اور تاریخ وقت شامل ہو',
      'میسیج میں شامل لنک - صرف متن کاپی کریں اور کبھی نہ کھولیں',
      'اگر آپ نے جواب دیا یا رقم بھیجی تو ادائیگی کا ثبوت',
      'شناختی کارڈ کی نقل',
    ],
    onlineComplaintUrl: 'https://complaint.pta.gov.pk/RegisterComplaint.aspx',
    timeframe: 'Report within 24 hours so the number gets blocked before others become victims',
    timeframeUrdu: '24 گھنٹوں کے اندر رپورٹ کریں تاکہ دوسرے لوگ متاثر ہونے سے پہلے یہ نمبر بلاک ہو جائے',
    additionalTips: [
      'Forward suspicious SMS to 9000 so operators can block the sender',
      'Government departments never send prize or fine messages from private numbers',
      'Shortened links often hide fake websites behind them',
      'Keep your operator helpline saved: Jazz 111, Zong 310, Telenor 345, Ufone 333',
    ],
    additionalTipsUrdu: [
      'مشکوک ایس ایم 9000 پر فارورڈ کریں تاکہ آپریٹر بھیجنے والے کو بلاک کرے',
      'سرکاری محکمے نجی نمبروں سے انعام یا جرمانے کے پیغامات نہیں بھیجتے',
      'شارٹنڈ لنکس کے پیچھے اکثر جعلی ویب سائٹس چھپی ہوتی ہیں',
      'اپنی ہیلپ لائن محفوظ رکھیں: جاز 111، زونگ 310، ٹیلینور 345، یوفون 333',
    ],
  },
  {
    scamType: 'Romance Scam',
    scamTypeUrdu: 'محبت اسکیم',
    immediateActions: [
      'Stop sending money or gifts immediately',
      'Ask for a video call to verify identity and firmly refuse excuses',
      'Run a reverse image search on their profile pictures',
      'Cut off contact and block them on all platforms',
      'Save all chat and payment records before blocking',
    ],
    immediateActionsUrdu: [
      'فوری طور پر رقم یا تحائف بھیجنا بند کریں',
      'شناخت کی تصدیق کے لیے ویڈیو کال کا مطالبہ کریں اور بہانوں پر سختی سے انکار کریں',
      'ان کی پروفایل تصاویر کی ریورس امیج سرچ کریں',
      'تمام پلیٹ فارمز پر رابطہ کاٹ کر انہیں بلاک کریں',
      'بلاک کرنے سے پہلے تمام چیٹ اور ادائیگی کا ریکارڈ محفوظ کریں',
    ],
    complaintContacts: [FIA_CONTACT],
    requiredDocuments: [
      'Complete chat transcripts from WhatsApp or Messenger',
      'Their profile links, photos and phone numbers',
      'Money transfer receipts such as Western Union, bank or EasyPaisa',
      'Screenshots of the stories and excuses they used to ask for money',
    ],
    requiredDocumentsUrdu: [
      'واٹس ایپ یا میسنجر کی مکمل چیٹ ہسٹری',
      'ان کی پروفائلز کے لنکس، تصاویر اور فون نمبرز',
      'منی ٹرانسفر کی رسیدیں جیسے ویسٹرن یونین، بینک یا ایزی پیسہ',
      'پیسے مانگنے کے بہانوں اور کہانیوں کے اسکرین شاٹس',
    ],
    onlineComplaintUrl: 'https://complaint.nccia.gov.pk',
    timeframe: 'Report at the first request for money - repeated payments only deepen losses',
    timeframeUrdu: 'رقم کی پہلی درخواست پر ہی رپورٹ کریں - بار بار ادائیگی نقصان کو مزید بڑھا دیتی ہے',
    additionalTips: [
      'Online friends asking money for emergencies, tickets or customs fees are almost always scammers',
      'Avoiding video calls and in person meetings is a major red flag',
      'Never borrow or send money for someone you have never met face to face',
      'Talk to family or a trusted friend before making any decision',
    ],
    additionalTipsUrdu: [
      'آن لائن دوست جو ایمرجنسی، ٹکٹ یا کسٹم فیس کے لیے پیسے مانگیں تقریباً ہمیشہ فراڈی ہوتے ہیں',
      'ویڈیو کال اور ذاتی ملاقات سے گریز خطرے کی بڑی علامت ہے',
      'جس شخص سے کبھی سامنے ملے بغیر قرض لے کر یا رقم نہ بھیجیں',
      'کوئی فیصلہ کرنے سے پہلے خاندان یا قابلِ اعتماد دوست سے مشورہ کریں',
    ],
  },
  {
    scamType: 'Crypto Scam',
    scamTypeUrdu: 'کرپٹو اسکیم',
    immediateActions: [
      'Stop transferring crypto or money immediately',
      'Screenshot wallet addresses, transaction hashes and exchange profiles',
      'Report the scammer wallet addresses to the exchange or platform',
      'Never pay a release fee or tax to withdraw funds - it is another layer of the same scam',
      'File a complaint with NCCIA Cybercrime Wing',
    ],
    immediateActionsUrdu: [
      'کرپٹو یا رقم منتقل کرنا فوری طور پر بند کریں',
      'والٹ ایڈریسز، ٹرانزیکشن ہیشز اور ایکسچینج پروفائلز کے اسکرین شاٹس لیں',
      'فراڈی والٹ ایڈریسز کی اطلاع متعلقہ ایکسچینج یا پلیٹ فارم کو دیں',
      'رقم نکالنے کے لیے ریلیز فیس یا ٹیکس کبھی نہ دیں - یہی فراڈ کی اگلی تہہ ہے',
      'ایف آئی اے سائبر کرائم ونگ میں شکایت درج کروائیں',
    ],
    complaintContacts: [FIA_CONTACT, SBP_CONTACT],
    requiredDocuments: [
      'Wallet addresses involved including yours and the scammers',
      'Transaction hash or ID from the blockchain explorer',
      'Exchange account screenshots and chats with the advisors',
      'Bank or EasyPaisa receipts for rupee transfers',
      'Copy of your CNIC',
    ],
    requiredDocumentsUrdu: [
      'متعلقہ والٹ ایڈریسز بشمول آپ کے اور فراڈی کے',
      'بلاک چین ایکسپلورر سے ٹرانزیکشن ہیش یا آئی ڈی',
      'ایکسچینج اکاؤنٹ کے اسکرین شاٹس اور مشیروں کے ساتھ چیٹ',
      'روپے منتقل کرنے کی بینک یا ایزی پیسہ رسیدیں',
      'شناختی کارڈ کی نقل',
    ],
    onlineComplaintUrl: 'https://sunwai.sbp.org.pk',
    timeframe: 'Report within 24 hours - early blockchain tracing offers the best chance of action',
    timeframeUrdu: '24 گھنٹوں کے اندر رپورٹ کریں - جلد بلاک چین ٹریسنگ سے کارروائی کا بہترین موقع ملتا ہے',
    additionalTips: [
      'Crypto transactions cannot be reversed - caution is the only protection',
      'Offers to double your Bitcoin are always scams',
      'Fake exchanges show fake profits that can never be withdrawn',
      'SBP has not authorized any crypto trading platform in Pakistan',
    ],
    additionalTipsUrdu: [
      'کرپٹو ٹرانزیکشنز واپس نہیں ہو سکتیں - احتیاط ہی واحد حفاظت ہے',
      'آپ کا بٹ کوائن دگنا کرنے کی پیشکشیں ہمیشہ فراڈ ہوتی ہیں',
      'جعلی ایکسچینجز نقلی منافع دکھاتے ہیں جو کبھی نہیں نکل سکتا',
      'اسٹیٹ بینک آف پاکستان نے پاکستان میں کسی بھی کرپٹو ٹریڈنگ پلیٹ فارم کو اجازت نہیں دی ہے',
    ],
  },
  {
    scamType: 'Social Media Scam',
    scamTypeUrdu: 'سوشل میڈیا اسکیم',
    immediateActions: [
      'Report and block the fake account on Facebook, Instagram or WhatsApp',
      'Alert friends and family whose identity was impersonated',
      'Never share your OTP or login code with anyone',
      'Secure your own accounts with two factor authentication',
      'Collect evidence like profile links and screenshots before reporting to authorities',
    ],
    immediateActionsUrdu: [
      'فیس بک، انسٹاگرام یا واٹس ایپ پر جعلی اکاؤنٹ کو رپورٹ اور بلاک کریں',
      'جن لوگوں کی شناخت استعمال ہو رہی ہے انہیں فوری آگاہ کریں',
      'کسی کو بھی اپنا او ٹی پی یا لاگ ان کوڈ نہ دیں',
      'اپنے اکاؤنٹس پر ٹو فیکٹر آتھنٹیکیشن فعال کریں',
      'اداروں کو رپورٹ کرنے سے پہلے پروفائل لنکس اور اسکرین شاٹس جیسے ثبوت جمع کریں',
    ],
    complaintContacts: [FIA_CONTACT, PTA_CONTACT],
    requiredDocuments: [
      'URL or link of the fake profile or page',
      'Screenshots of scam messages or posts',
      'Proof of payment if money was sent',
      'Details of your affected account',
      'Copy of your CNIC since platforms may ask for verification',
    ],
    requiredDocumentsUrdu: [
      'جعلی پروفائل یا پیج کا یو آر ایل یا لنک',
      'فراڈ میسجز یا پوسٹس کے اسکرین شاٹس',
      'اگر رقم بھیجی ہو تو ادائیگی کا ثبوت',
      'اپنے متاثرہ اکاؤنٹ کی تفصیلات',
      'شناختی کارڈ کی نقل کیونکہ پلیٹ فارمز تصدیق کے لیے مانگ سکتے ہیں',
    ],
    onlineComplaintUrl: 'https://complaint.pta.gov.pk/RegisterComplaint.aspx',
    timeframe: 'Report within 24 to 48 hours before the fake account harms more people',
    timeframeUrdu: '24 سے 48 گھنٹوں کے اندر رپورٹ کریں اس سے پہلے کہ جعلی اکاؤنٹ مزید لوگوں کو نقصان پہنچائے',
    additionalTips: [
      'Hacked accounts of relatives urgently asking for money are very common - verify by calling them directly',
      'Enable two factor authentication on all social media accounts',
      'Facebook and Instagram have built in impersonation report options - use them',
      'Never share OTP codes even with people claiming to be officials',
    ],
    additionalTipsUrdu: [
      'رشتہ داروں کے ہیک شدہ اکاؤنٹس سے فوری پیسے مانگنا بہت عام ہے - براہِ راست کال کر کے تصدیق کریں',
      'تمام سوشل میڈیا اکاؤنٹس پر ٹو فیکٹر آتھنٹیکیشن فعال رکھیں',
      'فیس بک اور انسٹاگرام میں امپرسونیشن رپورٹ کا آپشن موجود ہے - اسے استعمال کریں',
      'دفتری افسر ہونے کا دعویٰ کرنے والوں کو بھی او ٹی پی کوڈ نہ دیں',
    ],
  },
  {
    scamType: 'Generic Scam',
    scamTypeUrdu: 'عام دھوکہ',
    immediateActions: [
      'Stop all communication and payments with the suspected scammer',
      'Save all messages, numbers and receipts as evidence',
      'Block the scammer on calls, SMS and social media',
      'Inform your bank if any account details were shared',
      'File a complaint with NCCIA Cybercrime Wing',
    ],
    immediateActionsUrdu: [
      'مشکوک فراڈی سے تمام رابطہ اور ادائیگی فوری طور پر بند کریں',
      'تمام میسیجز، نمبرز اور رسیدیں بطور ثبوت محفوظ کریں',
      'کالز، ایس ایم اور سوشل میڈیا پر فراڈی کو بلاک کریں',
      'اگر اکاؤنٹ کی تفصیلات شیئر ہوئی ہوں تو اپنے بینک کو مطلع کریں',
      'ایف آئی اے سائبر کرائم ونگ میں شکایت درج کروائیں',
    ],
    complaintContacts: [FIA_CONTACT, POLICE_15_CONTACT],
    requiredDocuments: [
      'Screenshots of all conversations and messages',
      'Scammer phone numbers and account numbers',
      'Transaction or payment receipts',
      'Copy of your CNIC',
    ],
    requiredDocumentsUrdu: [
      'تمام گفتگو اور میسیجز کے اسکرین شاٹس',
      'فراڈی کے فون نمبر اور اکاؤنٹ نمبرز',
      'ٹرانزیکشن یا ادائیگی کی رسیدیں',
      'شناختی کارڈ کی نقل',
    ],
    onlineComplaintUrl: 'https://complaint.nccia.gov.pk',
    timeframe: 'File the complaint within 72 hours while evidence is still fresh',
    timeframeUrdu: 'ثبوت ابھی تازہ ہونے کی صورت میں 72 گھنٹوں کے اندر شکایت درج کروائیں',
    additionalTips: [
      'If an offer sounds too good to be true it is most likely a scam',
      'Never share OTP, PIN, passwords or CNIC copies with unknown persons',
      'Always verify by calling official helplines before taking action',
      'Educate elderly family members about common scam patterns',
    ],
    additionalTipsUrdu: [
      'اگر کوئی پیشکش حد سے زیادہ فائدہ مند لگے تو غالباً وہ فراڈ ہے',
      'نامعلوم افراد کو کبھی او ٹی پی، پی آئی این، پاس ورڈ یا شناختی کارڈ کی نقل نہ دیں',
      'کوئی اقدام کرنے سے پہلے سرکاری ہیلپ لائن پر کال کر کے تصدیق ضرور کریں',
      'بزرگ خاندان کے افراد کو عام فراڈ کے پیٹرنز سے آگاہ کریں',
    ],
  },
];

const INDICATOR_TO_SCAM_TYPE: Record<string, string> = {
  OTP_REQUEST: 'Bank/Wallet Phishing',
  PASSWORD_REQUEST: 'Bank/Wallet Phishing',
  PIN_REQUEST: 'Bank/Wallet Phishing',
  CVV_REQUEST: 'Bank/Wallet Phishing',
  CREDENTIAL_HARVEST: 'Bank/Wallet Phishing',
  ACCOUNT_SUSPENSION: 'Bank/Wallet Phishing',
  INVESTMENT_SCAM: 'Investment Scam',
  CRYPTO_PRESSURE: 'Investment Scam',
  JOB_SCAM: 'Job Scam',
  FAKE_JOB_FEE: 'Job Scam',
  MANDATE_FEE: 'Job Scam',
  PRIZE_SCAM: 'Prize/Lottery Scam',
  FAKE_REWARD: 'Prize/Lottery Scam',
  GAMBLING_SCAM: 'Gambling Scam',
  SCAM_KEYWORD: 'SMS/Text Scam',
  CLICK_BAIT: 'SMS/Text Scam',
  URL_SHORTENER: 'SMS/Text Scam',
  SUSPICIOUS_TLD: 'SMS/Text Scam',
  URGENCY: 'Romance Scam',
  THREAT: 'Romance Scam',
  TIME_PRESSURE: 'Romance Scam',
  PAYMENT_REQUEST: 'Romance Scam',
  IMPERSONATION: 'Social Media Scam',
  LOOKALIKE: 'Social Media Scam',
  SENDER_MISMATCH: 'Social Media Scam',
  BRAND_IMPERSONATION: 'Social Media Scam',
  FREE_MONEY: 'Prize/Lottery Scam',
  CASH_PRIZE: 'Prize/Lottery Scam',
  CASH_GRANT: 'Prize/Lottery Scam',
  FREE_RUPEES: 'Prize/Lottery Scam',
  SCAM_AMOUNT: 'Prize/Lottery Scam',
};

export function getComplaintPathForIndicators(indicatorIds: string[]): ComplaintPath | undefined {
  const safeIndicators = new Set(['NETWORK_PROMO']);
  const hasScamIndicator = indicatorIds.some((id) => !safeIndicators.has(id.trim().toUpperCase()));
  if (!hasScamIndicator) return undefined;

  for (const indicatorId of indicatorIds) {
    const normalizedId = indicatorId.trim().toUpperCase();
    const scamType = INDICATOR_TO_SCAM_TYPE[normalizedId];
    if (!scamType) continue;
    const matchedPath = complaintPaths.find((path) => path.scamType === scamType);
    if (matchedPath) return matchedPath;
  }
  return getComplaintPathForType('Generic Scam');
}

export function getComplaintPathForType(scamType: string): ComplaintPath | undefined {
  const query = scamType.trim();
  return complaintPaths.find(
    (path) => path.scamType.toLowerCase() === query.toLowerCase() || path.scamTypeUrdu === query
  );
}
