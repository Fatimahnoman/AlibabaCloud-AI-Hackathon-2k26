import type { PrivacyRule, UnifiedStudentProfile } from './types';

const PRIVACY_RULES: PrivacyRule[] = [
  { domain: 'identity', level: 'public', injectAlways: true, requiresExplicitMention: false, description: 'Name, email, basic info' },
  { domain: 'learning', level: 'education', injectAlways: true, requiresExplicitMention: false, description: 'Study profile, subjects, weak areas' },
  { domain: 'education', level: 'education', injectAlways: true, requiresExplicitMention: false, description: 'Saved courses, universities, applications' },
  { domain: 'finances', level: 'financial', injectAlways: false, requiresExplicitMention: true, description: 'Budget, income, savings — only when user asks about money/budget/affordability' },
  { domain: 'security', level: 'sensitive', injectAlways: false, requiresExplicitMention: true, description: 'Fraud reports, scans — only when user asks about safety/scams' },
  { domain: 'memory', level: 'public', injectAlways: true, requiresExplicitMention: false, description: 'User-stated preferences from chat memory' },
];

const FINANCIAL_KEYWORDS = ['budget', 'money', 'cost', 'afford', 'expensive', 'cheap', 'savings', 'income', 'expense', 'financial', 'fee', 'tuition', 'pay', 'salary', 'dollar', 'usd', '$'];
const SECURITY_KEYWORDS = ['fraud', 'scam', 'phishing', 'safe', 'legit', 'security', 'hack', 'password', 'otp', 'suspicious', 'malicious'];

export class PrivacyEngine {
  private rules: PrivacyRule[];

  constructor() {
    this.rules = PRIVACY_RULES;
  }

  filterProfile(profile: UnifiedStudentProfile, messageText: string): { filtered: Partial<UnifiedStudentProfile>; injectedDomains: string[] } {
    const lower = messageText.toLowerCase();
    const filtered: Partial<UnifiedStudentProfile> = {};
    const injectedDomains: string[] = [];

    for (const rule of this.rules) {
      if (rule.injectAlways) {
        (filtered as Record<string, unknown>)[rule.domain] = (profile as unknown as Record<string, unknown>)[rule.domain];
        injectedDomains.push(rule.domain);
      } else if (rule.requiresExplicitMention) {
        const keywords = rule.domain === 'finances' ? FINANCIAL_KEYWORDS : SECURITY_KEYWORDS;
        const mentionsFinancial = rule.domain === 'finances' && keywords.some(k => lower.includes(k));
        const mentionsSecurity = rule.domain === 'security' && keywords.some(k => lower.includes(k));
        if (mentionsFinancial || mentionsSecurity) {
          (filtered as Record<string, unknown>)[rule.domain] = (profile as unknown as Record<string, unknown>)[rule.domain];
          injectedDomains.push(rule.domain);
        }
      }
    }

    return { filtered, injectedDomains };
  }

  shouldInjectDomain(domain: string, messageText: string): boolean {
    const rule = this.rules.find(r => r.domain === domain);
    if (!rule) return false;
    if (rule.injectAlways) return true;
    const lower = messageText.toLowerCase();
    if (domain === 'finances') return FINANCIAL_KEYWORDS.some(k => lower.includes(k));
    if (domain === 'security') return SECURITY_KEYWORDS.some(k => lower.includes(k));
    return false;
  }

  formatFilteredContext(filtered: Partial<UnifiedStudentProfile>): string {
    const lines: string[] = [];
    lines.push('## Student Profile Context\n');

    if (filtered.identity) {
      const i = filtered.identity;
      lines.push(`**Student:** ${i.name} (${i.email})`);
      if (i.country) lines.push(`**Country:** ${i.country}`);
      if (i.educationLevel) lines.push(`**Education Level:** ${i.educationLevel}`);
      lines.push('');
    }

    if (filtered.learning) {
      const l = filtered.learning;
      lines.push('### Learning Profile');
      if (l.subjects.length > 0) lines.push(`**Subjects:** ${l.subjects.join(', ')}`);
      if (l.weakSubjects.length > 0) lines.push(`**Weak Areas:** ${l.weakSubjects.join(', ')}`);
      if (l.learningStyle) lines.push(`**Learning Style:** ${l.learningStyle}`);
      if (l.targetExam) lines.push(`**Target Exam:** ${l.targetExam}`);
      lines.push(`**Weekly Study:** ${l.totalStudyMinutesThisWeek} minutes`);
      lines.push(`**Topics Tracked:** ${l.topicsTracked} (avg mastery: ${l.avgMasteryLevel}%)`);
      lines.push('');
    }

    if (filtered.education) {
      const e = filtered.education;
      lines.push('### Education Goals');
      if (e.targetCountry) lines.push(`**Target Country:** ${e.targetCountry}`);
      if (e.targetField) lines.push(`**Target Field:** ${e.targetField}`);
      lines.push(`**Saved:** ${e.savedCourses} courses, ${e.savedUniversities} universities, ${e.savedScholarships} scholarships`);
      if (e.applicationChecklists.length > 0) {
        lines.push('**Applications:**');
        e.applicationChecklists.forEach(a => {
          lines.push(`  - ${a.title} (${a.status}) — ${a.progress}% complete`);
        });
      }
      lines.push('');
    }

    if (filtered.finances) {
      const f = filtered.finances;
      lines.push('### Financial Profile');
      if (f.hasProfile) {
        if (f.monthlyIncome) lines.push(`**Monthly Income:** ${f.currency || 'USD'} ${f.monthlyIncome}`);
        if (f.savingsGoal) lines.push(`**Savings Goal:** ${f.currency || 'USD'} ${f.savingsGoal}`);
        lines.push(`**Active Goals:** ${f.activeSavingsGoals}`);
        lines.push(`**Total Saved:** ${f.currency || 'USD'} ${f.totalSaved}`);
      } else {
        lines.push('*No financial profile set up*');
      }
      lines.push('');
    }

    if (filtered.security) {
      const s = filtered.security;
      lines.push('### Security Status');
      lines.push(`**Total Scans:** ${s.totalScans}`);
      if (s.recentRiskLevel) lines.push(`**Recent Risk Level:** ${s.recentRiskLevel}`);
      if (s.unresolvedReports > 0) lines.push(`**⚠️ Unresolved Reports:** ${s.unresolvedReports}`);
      lines.push('');
    }

    if (filtered.memory && Object.keys(filtered.memory).length > 0) {
      lines.push('### Known Preferences');
      Object.entries(filtered.memory).forEach(([k, v]) => {
        lines.push(`- **${k}:** ${v}`);
      });
    }

    return lines.join('\n');
  }
}

export const privacyEngine = new PrivacyEngine();
