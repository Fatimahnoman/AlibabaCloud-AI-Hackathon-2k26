export type ChatIntent =
  | 'general'
  | 'education'
  | 'university'
  | 'course'
  | 'scholarship'
  | 'admission'
  | 'visa'
  | 'career'
  | 'fraud'
  | 'url_scan'
  | 'document_scan'
  | 'budget'
  | 'study_plan'
  | 'student'
  | 'teacher'
  | 'voice'
  | 'account'
  | 'help'
  | 'orchestration';

interface IntentRule {
  intent: ChatIntent;
  patterns: RegExp[];
  priority: number;
}

const INTENT_RULES: IntentRule[] = [
  {
    intent: 'education',
    priority: 7,
    patterns: [
      /\b(education|career|career.guide|career.counsel|guidance|counseling|study.abroad)\b/i,
      /\b(taleem|parhai|career|guidance|counseling)\b/i,
      /\b(marks|percentage|gpa|grades?|score|ielts|toefl|sat|act|gre|gmat|a.levels|o.levels|matric|intermediate|fsc|f.a|ics|hssc|ssc|higher.secondary|senior.secondary|ATAR)\b/i,
      /\b(percentage|kitne.marks|kitna.marks|marks.chahiye|kitni.percentage|kitna.percentage)\b/i,
      /\b(punjab.se|sindh.se|kpk.se|balochistan.se|gb.se|islamabad.se|lahore.se|karachi.se)\b/i,
      /\b(jaana|jana|karna|apply|admission|entry|join|enroll)\b/i,
    ],
  },
  {
    intent: 'scholarship',
    priority: 10,
    patterns: [
      /\b(scholarship|scholarships|fully.funded|financial.aid|tuition.waiver|fee.waiver)\b/i,
      /\b(اسکالرشپ|سکالرشپ|uadaar|muft|tehseelee|scholarship)\b/i,
      /\b(scholarship|fully.funded|fee.waiver)\b/i,
      /\b(NTHP|STHP|SEEF|BEEF|PEEF|Ehsaas|Fulbright|Chevening|DAAD|Commonwealth|Erasmus|DAAD|MEXT|KGSP|CSC|Holland|Swedish|Vanier|UKAA|Bait-ul-Mal|GB.Scholarship)\b/i,
      /\b(hec|higher.education.commission|need.based|merit.based)\b/i,
      /\b(provincial|province|district|city.specific)\b/i,
    ],
  },
  {
    intent: 'university',
    priority: 9,
    patterns: [
      /\b(university|universities|college|institute|campus|admission)\b/i,
      /\b(یونیورسٹی|کالج|انسٹیٹیوٹ)\b/i,
      /\b(top.universities?|best.universit|ranked.universit)\b/i,
      /\b(Oxford|Cambridge|MIT|Stanford|Harvard|Yale|Princeton|Caltech|Imperial|ETH|LSE|UCL|Toronto|UBC|Melbourne|Sydney|ANU|TU.Munich|LMU|Heidelberg|Freie|King's|UCL|Edinburgh|Manchester|Bristol)\b/i,
      /\b(lahore|karachi|islamabad|peshawar|faisalabad|hyderabad|multan|rawalpindi|munich|berlin|hamburg|london|manchester|birmingham|oxford|cambridge|toronto|vancouver|montreal|sydney|melbourne|canberra|new.york|boston|california|tokyo|seoul|beijing|istanbul|budapest|kuala.lumpur|wellington|auckland)\b/i,
    ],
  },
  {
    intent: 'course',
    priority: 8,
    patterns: [
      /\b(course|courses|degree|bachelors|masters|phd|diploma|programme|program)\b/i,
      /\b(computer.science|engineering|medicine|business|mba|data.science|ai|machine.learning)\b/i,
    ],
  },
  {
    intent: 'admission',
    priority: 8,
    patterns: [
      /\b(admission|apply|application|enrollment|enrolment|entrance|eligibility)\b/i,
      /\b(اعلان|درخواست|داخلہ|ادعائیہ)\b/i,
      /\b(tuition.fee|fee.structure|semester.fee|annual.fee|total.cost|cost.of)\b/i,
    ],
  },
  {
    intent: 'visa',
    priority: 8,
    patterns: [
      /\b(visa|passport|immigration|work.permit|student.visa|travel.visa|visa.status)\b/i,
      /\b(ویزا|پاسپورٹ)\b/i,
      /\b(accommodation|hostel|dorm|living.cost|rent|transport)\b/i,
    ],
  },
  {
    intent: 'career',
    priority: 9,
    patterns: [
      /\b(career|job|profession|become|work.as|employment|salary|role)\b/i,
      /\b(after.*(degree|bs|bachelor|master|mba|phd))\b/i,
      /\b(what.can.i.do|kya.ban.sakta|career.path|job.role)\b/i,
      /\b(roadmap|guide|guidance|counseling)\b/i,
    ],
  },
  {
    intent: 'fraud',
    priority: 10,
    patterns: [
      /\b(fraud|scam|phishing|fake|suspicious|cheat|deceit|bogus)\b/i,
      /\b(fraudulent|phishing|spoofing|impersonat)\b/i,
      /\b(is.this.safe|is.this.real|is.this.legit|is.this.authentic)\b/i,
      /\b(kya.ye.fake|ye.scam|dhoka|bewakoof|jaalsaazi)\b/i,
      /\b(grami|जालसाज़ी|धोखा|बेवकूफ|फ़्रॉड|डाकू)\b/i,
      /\b(suspicious.message|suspicious.email|suspicious.link|suspicious.sms)\b/i,
      /\b(pishing|smishing|vishing|social.engineering|identity.theft)\b/i,
      /\b(scan.this|check.this|verify.this|analyze.this)\b/i,
      /\b(report|scan|check.message|check.url)\b/i,
    ],
  },
  {
    intent: 'url_scan',
    priority: 9,
    patterns: [
      /\b(is.this.link|scan.this.url|check.this.link|is.this.safe|verify.url|check.url)\b/i,
      /\b(ye.link|is.link|check.karo|scan.karo)\b/i,
      /https?:\/\/\S+/i,
    ],
  },
  {
    intent: 'document_scan',
    priority: 8,
    patterns: [
      /\b(scan.document|check.document|analyze.document|verify.document|pdf.check|document.check)\b/i,
      /\b(ye.document|is.paper|check.karo.document)\b/i,
    ],
  },
  {
    intent: 'budget',
    priority: 9,
    patterns: [
      /\b(budget|salary|income|expense|spending|savings|saving|money|financial.plan|monthly.budget)\b/i,
      /\b(paisa|paise|rupees|rupay|kharcha|kamai|bachat|salary|tankhwah|maahtana)\b/i,
      /\b(budget.banao|expense.track|income.track|financial)\b/i,
      /\b(budget.analysis|analyze.budget|financial.analysis|expense.report|spending.report)\b/i,
      /\b(debt|loan|credit.card|bank.balance|net.worth|invest|investment|compound.interest)\b/i,
      /\b(cost.of.living|inflation|interest.rate|paycheck|take.home|net.pay)\b/i,
    ],
  },
  {
    intent: 'study_plan',
    priority: 8,
    patterns: [
      /\b(study.plan|study.schedule|study.timetable|revision|exam.prep|exam.preparation)\b/i,
      /\b(padhai.ka.plan|time.table|exam.ki.taiyari)\b/i,
      /\b(create.study.plan|make.study.schedule|plan.my.studies|weekly.study|daily.study)\b/i,
      /\b(pomodoro|spaced.repetition|active.recall|study.technique|study.method)\b/i,
      /\b(focus|concentration|study.hours|study.time|break.schedule)\b/i,
    ],
  },
  {
    intent: 'student',
    priority: 5,
    patterns: [
      /\b(i.am.student|i'm.student|i.am.in|student.here|currently.studying)\b/i,
      /\b(mai.student|student.hoon|padhai kar raha|padhai kar rahi)\b/i,
    ],
  },
  {
    intent: 'teacher',
    priority: 5,
    patterns: [
      /\b(teacher|instructor|professor|educator|lesson.plan|teaching)\b/i,
      /\b(استاد|معلم|teach|padhana|lesson)\b/i,
      /\b(lesson.plan|teaching.plan|class.plan|lecture.plan|syllabus)\b/i,
      /\b(assessment|quiz|exam.paper|rubric|grading|grading.rubric|homework)\b/i,
      /\b(classroom|curriculum|pedagogy|differentiated.instruction|learning.objectives)\b/i,
      /\b(student.progress|grade.book|attendance|parent.teacher|report.card)\b/i,
    ],
  },
  {
    intent: 'voice',
    priority: 3,
    patterns: [
      /\b(voice|speak|speech|microphone|audio|listen|talk)\b/i,
    ],
  },
  {
    intent: 'account',
    priority: 4,
    patterns: [
      /\b(account|profile|settings|password|email|logout|sign.out|delete.account)\b/i,
      /\b(اکاؤنٹ|پروفائل|سیٹنگ|پاسورڈ)\b/i,
    ],
  },
  {
    intent: 'help',
    priority: 2,
    patterns: [
      /\b(help|what.can.you|how.to|guide|tutorial|features|options|menu)\b/i,
      /\b(madad|kya.kar.sakte|help|sahayata)\b/i,
    ],
  },
  {
    intent: 'orchestration',
    priority: 12,
    patterns: [
      /\b(education.plan|education.roadmap|complete.plan|full.plan|complete.roadmap)\b/i,
      /\b(study.abroad.with.scholarship|universities.and.scholarships|scholarship.and.budget)\b/i,
      /\b(find.*universities.*scholarships|find.*scholarships.*universities)\b/i,
      /\b(education.budget|budget.for.study|limited.budget.*scholarship)\b/i,
      /\b(plan.my.education|education.goals|my.education.plan)\b/i,
      /\b(roadmap.with.budget|plan.with.scholarship|plan.with.financial.aid)\b/i,
      /\b(education.abroad.with.financial.aid|study.abroad.with.budget)\b/i,
      /\b(complete.education.plan|education.plan.for)\b/i,
    ],
  },
];

export interface IntentResult {
  intent: ChatIntent;
  confidence: number;
}

export function detectIntent(text: string): IntentResult {
  if (!text || text.trim().length === 0) {
    return { intent: 'general', confidence: 0.5 };
  }

  const trimmed = text.trim();
  const scores: Map<ChatIntent, number> = new Map();

  for (const rule of INTENT_RULES) {
    let matches = 0;
    for (const pattern of rule.patterns) {
      const m = trimmed.match(pattern);
      if (m) matches += m.length;
    }
    if (matches > 0) {
      const score = matches * rule.priority;
      const existing = scores.get(rule.intent) || 0;
      scores.set(rule.intent, existing + score);
    }
  }

  if (scores.size === 0) {
    return { intent: 'general', confidence: 0.5 };
  }

  let bestIntent: ChatIntent = 'general';
  let bestScore = 0;

  for (const [intent, score] of scores) {
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  const orchestrationScore = scores.get('orchestration') || 0;
  if (orchestrationScore > 0) {
    return { intent: 'orchestration' as ChatIntent, confidence: Math.min(0.95, 0.7 + orchestrationScore * 0.05) };
  }

  const confidence = Math.min(0.95, 0.6 + bestScore * 0.05);

  return { intent: bestIntent, confidence };
}

export function orchestrate(text: string): IntentResult {
  const lower = text.toLowerCase();
  const domainHits: string[] = [];

  const domainPatterns: Record<string, RegExp[]> = {
    education: [/\b(study|education|university|college|degree|course|programme|bachelors|masters|phd)\b/i],
    scholarship: [/\b(scholarship|scholarships|financial.aid|tuition.waiver|fully.funded|grant)\b/i],
    budget: [/\b(budget|cost|afford|expensive|cheap|money|expense|limited.budget|price|paisa|paise)\b/i],
    career: [/\b(career|job|profession|employment|salary|work|after.degree)\b/i],
    visa: [/\b(visa|passport|immigration|travel|work.permit|student.visa)\b/i],
  };

  for (const [domain, patterns] of Object.entries(domainPatterns)) {
    const matched = patterns.some((p) => p.test(lower));
    if (matched) domainHits.push(domain);
  }

  if (domainHits.length >= 2) {
    return { intent: 'orchestration', confidence: Math.min(0.95, 0.7 + domainHits.length * 0.1) };
  }

  return detectIntent(text);
}

export function getIntentLabel(intent: ChatIntent): string {
  const labels: Record<ChatIntent, string> = {
    general: 'General',
    education: 'Education',
    university: 'University',
    course: 'Course',
    scholarship: 'Scholarship',
    admission: 'Admission',
    visa: 'Visa',
    career: 'Career',
    fraud: 'Fraud',
    url_scan: 'URL Scan',
    document_scan: 'Document Scan',
    budget: 'Budget',
    study_plan: 'Study Plan',
    student: 'Student',
    teacher: 'Teacher',
    voice: 'Voice',
    account: 'Account',
    help: 'Help',
    orchestration: 'Orchestration',
  };
  return labels[intent] || 'General';
}
