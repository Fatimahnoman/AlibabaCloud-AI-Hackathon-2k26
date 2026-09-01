'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CountryInfo {
  name: string;
  overview: string;
  visaRequirements: string[];
  estimatedCosts: { category: string; amount: string }[];
  tips: string[];
}

const countries: Record<string, CountryInfo> = {
  'United States': {
    name: 'United States',
    overview: 'Home to many top-ranked universities, the US offers diverse programs and research opportunities. Popular for STEM, business, and liberal arts.',
    visaRequirements: [
      'Valid passport',
      'Form I-20 from accepted university',
      'SEVIS fee payment (I-901)',
      'DS-160 nonimmigrant visa application',
      'Visa interview at US Embassy/Consulate',
      'Proof of financial support',
      'English proficiency test scores (TOEFL/IELTS)',
    ],
    estimatedCosts: [
      { category: 'Tuition (public, in-state)', amount: '$10,000 - $25,000/year' },
      { category: 'Tuition (private)', amount: '$30,000 - $60,000/year' },
      { category: 'Living Expenses', amount: '$12,000 - $18,000/year' },
      { category: 'Health Insurance', amount: '$1,500 - $3,000/year' },
    ],
    tips: [
      'Apply early — deadlines are typically 6-12 months before the program starts',
      'Look for assistantships and on-campus work opportunities',
      'Many universities offer merit-based scholarships for international students',
      'Join student organizations to build your network',
    ],
  },
  'United Kingdom': {
    name: 'United Kingdom',
    overview: 'The UK has a rich academic tradition with world-renowned universities like Oxford, Cambridge, and Imperial College London.',
    visaRequirements: [
      'Valid passport',
      'Confirmation of Acceptance for Studies (CAS)',
      'Student visa application (formerly Tier 4)',
      'Proof of English proficiency (IELTS/TOEFL)',
      'Proof of financial support',
      'TB test certificate (for some countries)',
      'ATAS certificate (for certain courses)',
    ],
    estimatedCosts: [
      { category: 'Tuition (undergraduate)', amount: '£10,000 - £38,000/year' },
      { category: 'Tuition (postgraduate)', amount: '£12,000 - £45,000/year' },
      { category: 'Living Expenses (London)', amount: '£12,000 - £15,000/year' },
      { category: 'Living Expenses (outside London)', amount: '£9,000 - £12,000/year' },
    ],
    tips: [
      'Post-study work visa (Graduate Route) allows 2 years of work after graduation',
      'Apply through UCAS for undergraduate programs',
      'Check for Chevening and Commonwealth scholarships',
      'NHS healthcare is included with your visa fee',
    ],
  },
  'Canada': {
    name: 'Canada',
    overview: 'Canada is known for high-quality education, multicultural campuses, and favorable immigration pathways after graduation.',
    visaRequirements: [
      'Valid passport',
      'Letter of Acceptance from a Designated Learning Institution (DLI)',
      'Study permit application',
      'Proof of financial support',
      'Biometrics enrollment',
      'Immigration medical examination (if required)',
      'Police clearance certificate',
    ],
    estimatedCosts: [
      { category: 'Tuition (undergraduate)', amount: 'CAD 20,000 - 45,000/year' },
      { category: 'Tuition (postgraduate)', amount: 'CAD 15,000 - 50,000/year' },
      { category: 'Living Expenses', amount: 'CAD 10,000 - 15,000/year' },
      { category: 'Health Insurance', amount: 'CAD 600 - 900/year' },
    ],
    tips: [
      'Post-Graduation Work Permit (PGWP) allows you to work for up to 3 years',
      'Express Entry system offers a pathway to permanent residency',
      'Many provinces have their own immigration programs (PNP)',
      'Work up to 20 hours/week off-campus during studies',
    ],
  },
  'Australia': {
    name: 'Australia',
    overview: 'Australia offers a high standard of living, excellent universities, and a welcoming environment for international students.',
    visaRequirements: [
      'Valid passport',
      'Confirmation of Enrolment (CoE)',
      'Student visa (subclass 500)',
      'Genuine Temporary Entrant (GTE) statement',
      'Proof of financial capacity',
      'English proficiency test scores',
      'Overseas Student Health Cover (OSHC)',
    ],
    estimatedCosts: [
      { category: 'Tuition (undergraduate)', amount: 'AUD 20,000 - 45,000/year' },
      { category: 'Tuition (postgraduate)', amount: 'AUD 22,000 - 50,000/year' },
      { category: 'Living Expenses', amount: 'AUD 21,041/year (minimum)' },
      { category: 'Health Insurance (OSHC)', amount: 'AUD 500 - 700/year' },
    ],
    tips: [
      'Temporary Graduate visa (subclass 485) allows post-study work',
      'Apply for scholarships from Australian Government (Australia Awards)',
      'Most universities accept 3-year bachelor degrees for master entry',
      'Part-time work (48 hours per fortnight) is allowed during studies',
    ],
  },
  'Germany': {
    name: 'Germany',
    overview: 'Germany offers tuition-free education at public universities and is a leader in engineering, science, and technology.',
    visaRequirements: [
      'Valid passport',
      'University admission letter (Zulassungsbescheid)',
      'Blocked account (Sperrkonto) with ~€11,208',
      'Health insurance coverage',
      'APS certificate (for some countries)',
      'German or English language proficiency (depending on program)',
      'Visa application at German Embassy',
    ],
    estimatedCosts: [
      { category: 'Tuition (public universities)', amount: '€0 - €1,500/semester (mostly admin fees)' },
      { category: 'Tuition (private universities)', amount: '€5,000 - €30,000/year' },
      { category: 'Living Expenses', amount: '€8,000 - €12,000/year' },
      { category: 'Health Insurance', amount: '€1,200 - €1,800/year' },
    ],
    tips: [
      'Many master programs are taught entirely in English',
      'Apply through uni-assist for international applications',
      '18-month job-seeking visa after graduation',
      'Learn German even for English-taught programs — it helps with daily life and job prospects',
    ],
  },
  'Türkiye': {
    name: 'Türkiye',
    overview: 'Türkiye offers affordable, quality education with many English-taught programs. Home to historic universities and a bridge between Europe and Asia.',
    visaRequirements: [
      'Valid passport',
      'University acceptance letter',
      'Student visa (type D) from Turkish Embassy',
      'Proof of financial means (~$6,000/year bank statement)',
      'Health insurance (valid in Turkey)',
      'Turkish language proficiency (TÖMER) for Turkish programs',
      'Residence permit application within 30 days of arrival',
    ],
    estimatedCosts: [
      { category: 'Tuition (public universities)', amount: '$300 - $1,500/year (varies by program)' },
      { category: 'Tuition (private/vakıf universities)', amount: '$3,000 - $15,000/year' },
      { category: 'Living Expenses', amount: '$3,600 - $6,000/year' },
      { category: 'Health Insurance', amount: '$100 - $300/year (public)' },
    ],
    tips: [
      'Apply through Türkiye Scholarships (turkiyeburslari.gov.tr) for fully-funded programs',
      'YÖS exam required by many public universities for international students',
      'Learn basic Turkish — daily life is much easier',
      'IST (Istanbul) and AÜ (Ankara) are among the most popular universities',
    ],
  },
  'Malaysia': {
    name: 'Malaysia',
    overview: 'Malaysia is a rising education hub with affordable tuition, English-medium instruction, and branch campuses of top UK/Australian universities.',
    visaRequirements: [
      'Valid passport',
      'University offer letter',
      'Student visa (Student Pass) via EMGS',
      'Proof of financial means',
      'Medical examination report',
      'English proficiency (IELTS/TOEFL) for English programs',
      'Visa approval letter (VAL) before travel',
    ],
    estimatedCosts: [
      { category: 'Tuition (public universities)', amount: 'MYR 5,000 - 15,000/year ($1,100 - $3,300)' },
      { category: 'Tuition (private universities)', amount: 'MYR 20,000 - 60,000/year ($4,400 - $13,200)' },
      { category: 'Living Expenses', amount: 'MYR 12,000 - 24,000/year ($2,600 - $5,300)' },
      { category: 'Health Insurance', amount: 'MYR 500 - 1,500/year' },
    ],
    tips: [
      'Branch campuses: Monash Malaysia, Nottingham Malaysia, Heriot-Watt — same degree as UK/AU at lower cost',
      'UM (University of Malaya) is the top-ranked public university',
      'Part-time work (20 hrs/week) allowed during semester breaks',
      'MM2H program available for long-term stay after studies',
    ],
  },
  'Italy': {
    name: 'Italy',
    overview: 'Italy offers affordable public education with rich cultural heritage. Home to some of the world\'s oldest universities and strong programs in design, engineering, and arts.',
    visaRequirements: [
      'Valid passport',
      'University enrollment confirmation',
      'Type D student visa from Italian Embassy',
      'Proof of financial means (~€6,000/year)',
      'Health insurance coverage',
      'Accommodation proof (dichiarazione di ospitalità)',
      'Italian language proficiency (B1/B2) for Italian programs',
    ],
    estimatedCosts: [
      { category: 'Tuition (public universities)', amount: '€900 - €4,000/year (ISEE-based)' },
      { category: 'Tuition (private universities)', amount: '€6,000 - €35,000/year' },
      { category: 'Living Expenses', amount: '€8,000 - €14,000/year' },
      { category: 'Health Insurance', amount: '€150 - €500/year (SSN registration)' },
    ],
    tips: [
      'Tuition based on family income (ISEE) — low-income students pay very little',
      'DSU scholarships available in every region for food, housing, and tuition waivers',
      'Politecnico di Milano and Bologna are top-ranked for engineering and architecture',
      'Apply through Universitaly portal for pre-enrollment',
    ],
  },
  'Japan': {
    name: 'Japan',
    overview: 'Japan offers world-class education in technology, science, and engineering. Known for cutting-edge research, safety, and unique cultural experience.',
    visaRequirements: [
      'Valid passport',
      'Certificate of Eligibility (CoE) from immigration',
      'Student visa from Japanese Embassy/Consulate',
      'University admission letter',
      'Proof of financial support (~¥2,000,000/year)',
      'Health insurance enrollment',
      'Japanese language proficiency (JLPT N2/N1 for Japanese programs)',
    ],
    estimatedCosts: [
      { category: 'Tuition (national universities)', amount: '¥535,800/year (~$3,600)' },
      { category: 'Tuition (private universities)', amount: '¥800,000 - ¥2,000,000/year ($5,400 - $13,500)' },
      { category: 'Living Expenses', amount: '¥1,200,000 - ¥1,800,000/year ($8,100 - $12,100)' },
      { category: 'Health Insurance', amount: '¥200,000 - ¥300,000/year (NHI)' },
    ],
    tips: [
      'MEXT Scholarship covers tuition, living expenses, and airfare — apply through Japanese Embassy',
      'National universities have standardized low tuition regardless of program',
      'Part-time work (28 hrs/week) allowed with permission',
      'Tokyo, Kyoto, Osaka have the most universities; Tohoku and Hokkaido are strong in research',
    ],
  },
  'South Korea': {
    name: 'South Korea',
    overview: 'South Korea is a technology powerhouse with SKY universities (Seoul National, Korea, Yonsei) ranked among Asia\'s best. Strong in IT, engineering, and business.',
    visaRequirements: [
      'Valid passport',
      'University admission letter',
      'D-2 Student Visa from Korean Embassy',
      'Proof of financial capacity (~$10,000+ bank statement)',
      'Korean language proficiency (TOPIK) for Korean programs',
      'Medical examination',
      'Alien Registration Card (ARC) within 90 days of arrival',
    ],
    estimatedCosts: [
      { category: 'Tuition (national universities)', amount: '₩3,000,000 - 5,000,000/semester ($2,200 - $3,700)' },
      { category: 'Tuition (private universities)', amount: '₩5,000,000 - 10,000,000/semester ($3,700 - $7,400)' },
      { category: 'Living Expenses', amount: '₩6,000,000 - 12,000,000/year ($4,400 - $8,900)' },
      { category: 'Health Insurance', amount: 'Included in NHIS for students' },
    ],
    tips: [
      'GKS (Global Korea Scholarship) fully funds international students — tuition, living, airfare, language training',
      'SKY universities: Seoul National University, Korea University, Yonsei University — most prestigious',
      'KAIST and POSTECH are top for science and engineering (fully funded for many grad students)',
      'Part-time work allowed after 6 months with D-2 visa (20-30 hrs/week)',
    ],
  },
  'China': {
    name: 'China',
    overview: 'China offers rapidly improving universities with generous scholarships. Home to C9 League universities and strong programs in engineering, technology, and business.',
    visaRequirements: [
      'Valid passport',
      'University admission letter (JW201/JW202 form)',
      'X1 Student Visa from Chinese Embassy',
      'Proof of financial support',
      'Medical examination (specific form required)',
      'Health insurance',
      'Residence permit within 30 days of arrival',
    ],
    estimatedCosts: [
      { category: 'Tuition (public universities)', amount: '¥15,000 - ¥40,000/year ($2,100 - $5,500)' },
      { category: 'Tuition (top universities like Tsinghua/PKU)', amount: '¥26,000 - ¥100,000/year ($3,600 - $13,800)' },
      { category: 'Living Expenses', amount: '¥24,000 - ¥60,000/year ($3,300 - $8,300)' },
      { category: 'Health Insurance', amount: '¥400 - ¥800/year' },
    ],
    tips: [
      'CSC Scholarship (China Scholarship Council) covers full tuition, living, and insurance',
      'Tsinghua and Peking University are global top 20 — extremely competitive',
      'Many English-taught programs available, especially at graduate level',
      'Learn Mandarin (HSK) — essential for daily life and job prospects in China',
    ],
  },
};

export default function StudyAbroadPage() {
  const [selected, setSelected] = useState<string>('');
  const info = selected ? countries[selected] : null;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <a href="/education" className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mb-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Education Center
        </a>
        <h1 className="text-2xl font-bold text-gray-100">Study Abroad Guide</h1>
        <p className="text-gray-500 mt-1">Everything you need to know about studying in another country</p>
      </div>

      <div className="card">
        <label className="block text-sm font-medium text-gray-300 mb-2">Select a Country</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="input-field"
        >
          <option value="">Choose a country...</option>
          {Object.keys(countries).map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {!info && (
        <div className="card text-center py-12">
          <span className="text-4xl">✈️</span>
          <p className="text-gray-500 mt-3">Select a country above to see information about studying abroad.</p>
        </div>
      )}

      {info && (
        <div className="space-y-4">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-100">{info.name}</h2>
            <p className="text-sm text-gray-400 mt-2">{info.overview}</p>
          </div>

          <div className="card">
            <h2 className="font-semibold text-gray-100 mb-3">Visa Requirements</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
              {info.visaRequirements.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>

          <div className="card">
            <h2 className="font-semibold text-gray-100 mb-3">Estimated Costs</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 font-medium text-gray-400">Category</th>
                    <th className="text-left py-2 font-medium text-gray-400">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {info.estimatedCosts.map((c, i) => (
                    <tr key={i} className="border-b border-white/10 last:border-0">
                      <td className="py-2 text-gray-300">{c.category}</td>
                      <td className="py-2 text-gray-300">{c.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-gray-100 mb-3">Tips for Studying in {info.name}</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
              {info.tips.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>

          <div className="card">
            <h2 className="font-semibold text-gray-100 mb-3">Related Scholarships</h2>
            <Link href={`/education/scholarships?country=${encodeURIComponent(info.name)}`} className="text-sm text-primary-600 hover:underline">
              Find scholarships in {info.name} &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
