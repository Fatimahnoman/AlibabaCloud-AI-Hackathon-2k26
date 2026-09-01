import prisma from '@/lib/prisma';
import { UrlAnalyzer } from './url-analyzer';
import { TextAnalyzer } from './text-analyzer';
import { DocumentProcessor } from './document-processor';
import { RiskScorer } from './risk-scorer';
import { AiExplainer } from './ai-explainer';
import { redactSensitiveData } from '@/lib/credential-redaction';
import { validateFile } from '@/lib/file-validation';
import { isSafeUrl } from '@/lib/ssrf-protection';

interface FallbackAuthority {
  name: string;
  country: string;
  type: string;
  category: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  reportingUrl: string | null;
  description: string;
}

const FALLBACK_AUTHORITIES: Record<string, FallbackAuthority[]> = {
  'Pakistan': [
    { name: 'NCCIA Cybercrime Wing (Helpline 1991)', country: 'Pakistan', type: 'law_enforcement', category: 'cyber_cell', website: 'https://complaint.nccia.gov.pk', phone: '1991', email: 'cybercrime@nccia.gov.pk', address: 'NCCIA HQ, Islamabad', reportingUrl: 'https://complaint.nccia.gov.pk', description: 'Pakistan\'s primary cybercrime reporting center. Operates 24/7 helpline 1991.' },
    { name: 'Pakistan Telecommunication Authority (PTA)', country: 'Pakistan', type: 'government', category: 'telecom_regulator', website: 'https://www.pta.gov.pk', phone: '0800-55055', email: 'complaint@pta.gov.pk', address: 'PTA HQ, Islamabad', reportingUrl: 'https://complaint.pta.gov.pk/RegisterComplaint.aspx', description: 'Telecom regulator handling spam, fraudulent SMS, and telecom fraud complaints.' },
    { name: 'FIA Cyber Crime Wing', country: 'Pakistan', type: 'law_enforcement', category: 'cyber_cell', website: 'https://www.fia.gov.pk', phone: '+92-51-9269111', email: 'info@fia.gov.pk', address: 'FIA HQ, G-5/2, Islamabad', reportingUrl: 'https://complaint.fia.gov.pk', description: 'Federal Investigation Agency cyber crime wing for online fraud, identity theft, and electronic crimes under PECA 2016.' },
  ],
  'India': [
    { name: 'National Cyber Crime Reporting Portal', country: 'India', type: 'law_enforcement', category: 'cyber_cell', website: 'https://cybercrime.gov.in', phone: '1930', email: null, address: 'Ministry of Home Affairs, New Delhi', reportingUrl: 'https://cybercrime.gov.in', description: 'India\'s national portal for reporting cyber crimes including online fraud, identity theft, and cyberstalking.' },
    { name: 'CERT-In (Indian Computer Emergency Response Team)', country: 'India', type: 'government', category: 'cyber_cell', website: 'https://www.cert-in.org.in', phone: '+91-11-24368572', email: 'incident@cert-in.org.in', address: 'CERT-In, CDAC Building, Pune', reportingUrl: 'https://www.cert-in.org.in/reportincident', description: 'India\'s national nodal agency for cybersecurity incident response.' },
  ],
  'United States': [
    { name: 'Federal Trade Commission (FTC)', country: 'United States', type: 'government', category: 'consumer_protection', website: 'https://www.ftc.gov', phone: '+1-877-382-4357', email: null, address: '600 Pennsylvania Ave NW, Washington DC', reportingUrl: 'https://reportfraud.ftc.gov', description: 'US consumer protection agency handling fraud reports and scam complaints.' },
    { name: 'Internet Crime Complaint Center (IC3)', country: 'United States', type: 'law_enforcement', category: 'cyber_cell', website: 'https://www.ic3.gov', phone: null, email: null, address: 'FBI, Washington DC', reportingUrl: 'https://www.ic3.gov', description: 'FBI\'s center for reporting internet-enabled fraud and cybercrime.' },
    { name: 'CISA (Cybersecurity & Infrastructure Security Agency)', country: 'United States', type: 'government', category: 'cyber_cell', website: 'https://www.cisa.gov', phone: '+1-888-282-0870', email: null, address: 'Arlington, VA', reportingUrl: 'https://www.cisa.gov/report', description: 'US cybersecurity agency for critical infrastructure protection and incident reporting.' },
  ],
  'United Kingdom': [
    { name: 'Action Fraud', country: 'United Kingdom', type: 'law_enforcement', category: 'cyber_cell', website: 'https://www.actionfraud.police.uk', phone: '0300 123 2040', email: null, address: 'City of London Police', reportingUrl: 'https://www.actionfraud.police.uk/report-a-fraud-or-cyber-crime', description: 'UK\'s national reporting center for fraud and cybercrime.' },
    { name: 'National Cyber Security Centre (NCSC)', country: 'United Kingdom', type: 'government', category: 'cyber_cell', website: 'https://www.ncsc.gov.uk', phone: '+44-20-7946-9782', email: 'incidents@ncsc.gov.uk', address: 'GCHQ, Cheltenham', reportingUrl: 'https://www.ncsc.gov.uk/report-an-incident', description: 'UK\'s technical authority for cybersecurity and cyber threat response.' },
  ],
  'Canada': [
    { name: 'Canadian Anti-Fraud Centre (CAFC)', country: 'Canada', type: 'government', category: 'consumer_protection', website: 'https://www.antifraudcentre-centreantifraude.ca', phone: '+1-888-495-8501', email: null, address: 'Pembroke, ON, Canada', reportingUrl: 'https://www.antifraudcentre-centreantifraude.ca/scams-fraudes/report-declarer-eng.aspx', description: 'Canada\'s central agency for reporting fraud and cybercrime.' },
  ],
  'Australia': [
    { name: 'Australian Cyber Security Centre (ACSC)', country: 'Australia', type: 'government', category: 'cyber_cell', website: 'https://www.cyber.gov.au', phone: '1300 292 371', email: null, address: 'GPO Box 3208, Canberra', reportingUrl: 'https://www.cyber.gov.au/report-and-recover/report', description: 'Australia\'s cybersecurity hub for reporting cybercrime and incidents.' },
    { name: 'Scamwatch (ACCC)', country: 'Australia', type: 'government', category: 'consumer_protection', website: 'https://www.scamwatch.gov.au', phone: null, email: null, address: 'ACCC, Canberra', reportingUrl: 'https://www.scamwatch.gov.au/report-a-scam', description: 'Australia\'s scam reporting platform by the ACCC.' },
  ],
  'Germany': [
    { name: 'Federal Office for Information Security (BSI)', country: 'Germany', type: 'government', category: 'cyber_cell', website: 'https://www.bsi.bund.de', phone: '+49-228-99-9582-5959', email: 'info@bsi.bund.de', address: 'Godesberger Allee 188-196, Bonn', reportingUrl: 'https://www.bsi.bund.de', description: 'Germany\'s federal cybersecurity agency.' },
    { name: 'Bundeskriminalamt (BKA) - Cyber Crime Division', country: 'Germany', type: 'law_enforcement', category: 'cyber_cell', website: 'https://www.bka.de', phone: '+49-611-55-0', email: null, address: 'Wiesbaden, Germany', reportingUrl: 'https://www.bka.de/EN/CurrentInformation/Cybercrime/cybercrime_node.html', description: 'Germany\'s Federal Criminal Police cyber crime unit.' },
  ],
  'France': [
    { name: 'PHAROS Platform', country: 'France', type: 'law_enforcement', category: 'cyber_cell', website: 'https://www.interieur.gouv.fr', phone: null, email: null, address: 'Ministere de lInterieur, Paris', reportingUrl: 'https://www.internet-signalement.gouv.fr', description: 'France\'s national platform for reporting cybercrime and illegal online content.' },
    { name: 'Cybermalveillance.gouv.fr', country: 'France', type: 'government', category: 'cyber_cell', website: 'https://www.cybermalveillance.gouv.fr', phone: null, email: null, address: 'SGDSN, Paris', reportingUrl: 'https://www.cybermalveillance.gouv.fr', description: 'French government assistance platform for cyberattack victims.' },
  ],
  'Japan': [
    { name: 'National Police Agency - Cybercrime Division', country: 'Japan', type: 'law_enforcement', category: 'cyber_cell', website: 'https://www.npa.go.jp', phone: '#9110', email: null, address: 'Kasumigaseki, Tokyo', reportingUrl: 'https://www.npa.go.jp', description: 'Japan\'s national police cybercrime investigation unit.' },
    { name: 'JPCERT/CC', country: 'Japan', type: 'government', category: 'cyber_cell', website: 'https://www.jpcert.or.jp', phone: '+81-3-5280-7111', email: 'info@jpcert.or.jp', address: 'Chiyoda-ku, Tokyo', reportingUrl: 'https://www.jpcert.or.jp/english/', description: 'Japan\'s computer emergency response team.' },
  ],
  'China': [
    { name: 'Ministry of Public Security - Cybersecurity Bureau', country: 'China', type: 'law_enforcement', category: 'cyber_cell', website: 'https://www.mps.gov.cn', phone: '110', email: null, address: 'Dongcheng District, Beijing', reportingUrl: 'https://www.12321.cn', description: 'China\'s primary law enforcement agency for cybercrime.' },
    { name: '12321 Internet Reporting Center', country: 'China', type: 'government', category: 'consumer_protection', website: 'https://www.12321.cn', phone: null, email: null, address: 'China Internet Association, Beijing', reportingUrl: 'https://www.12321.cn', description: 'China\'s national center for reporting spam and fraudulent content.' },
  ],
  'Brazil': [
    { name: 'Policia Federal - Cybercrime Division', country: 'Brazil', type: 'law_enforcement', category: 'cyber_cell', website: 'https://www.pf.gov.br', phone: '+55-61-2024-8000', email: null, address: 'SAF Quadra 04, Brasilia', reportingUrl: 'https://www.pf.gov.br/servicos/fale-conosco', description: 'Brazil\'s Federal Police cybercrime division.' },
    { name: 'CERT.br', country: 'Brazil', type: 'government', category: 'cyber_cell', website: 'https://cert.br', phone: '+55-11-3243-1020', email: 'cert@cert.br', address: 'NIC.br, Sao Paulo', reportingUrl: 'https://cert.br/incidentes/', description: 'Brazil\'s national CERT for cybersecurity incidents.' },
  ],
  'Nigeria': [
    { name: 'Nigeria Police Force - Cybercrime Unit', country: 'Nigeria', type: 'law_enforcement', category: 'cyber_cell', website: 'https://www.npf.gov.ng', phone: '+234-809-200-0001', email: null, address: 'Louis Edet House, Abuja', reportingUrl: 'https://www.npf.gov.ng/report-crime', description: 'Nigeria\'s police cybercrime investigation unit.' },
    { name: 'EFCC (Economic and Financial Crimes Commission)', country: 'Nigeria', type: 'law_enforcement', category: 'consumer_protection', website: 'https://www.efccnigeria.org', phone: '+234-809-200-0001', email: 'info@efccnigeria.org', address: 'Central Business District, Abuja', reportingUrl: 'https://www.efccnigeria.org', description: 'Nigeria\'s premier anti-fraud agency for economic and cyber crimes.' },
  ],
  'South Africa': [
    { name: 'SAPS Cybercrime Unit', country: 'South Africa', type: 'law_enforcement', category: 'cyber_cell', website: 'https://www.saps.gov.za', phone: '10111', email: null, address: '550 Pretorius Street, Pretoria', reportingUrl: 'https://www.saps.gov.za/services/crime_report.php', description: 'South Africa\'s national police cybercrime unit.' },
  ],
  'United Arab Emirates': [
    { name: 'Dubai Police - Cyber Crime Division', country: 'United Arab Emirates', type: 'law_enforcement', category: 'cyber_cell', website: 'https://www.dubaipolice.gov.ae', phone: '901', email: null, address: 'Dubai Police HQ, Dubai', reportingUrl: 'https://www.dubaipolice.gov.ae', description: 'Dubai Police Cyber Crime Division for digital crime reporting.' },
    { name: 'Abu Dhabi Police - Cyber Crime Division', country: 'United Arab Emirates', type: 'law_enforcement', category: 'cyber_cell', website: 'https://www.adpolice.gov.ae', phone: '999', email: null, address: 'Abu Dhabi Police HQ', reportingUrl: 'https://www.adpolice.gov.ae', description: 'Abu Dhabi Police cybercrime reporting and investigation.' },
  ],
  'Saudi Arabia': [
    { name: 'Saudi Federation for Cybersecurity (SAFCSP)', country: 'Saudi Arabia', type: 'government', category: 'cyber_cell', website: 'https://www.safcsp.org.sa', phone: '999', email: null, address: 'Riyadh', reportingUrl: 'https://www.safcsp.org.sa', description: 'Saudi Arabia\'s national cybersecurity authority.' },
  ],
  'Turkey': [
    { name: 'BTK (Information and Communication Technologies Authority)', country: 'Turkey', type: 'government', category: 'cyber_cell', website: 'https://www.btk.gov.tr', phone: '+90-312-231-60-00', email: 'bilgi@btk.gov.tr', address: 'Universiteler Mahallesi, Ankara', reportingUrl: 'https://www.btk.gov.tr/tr-TR/ihbar', description: 'Turkey\'s telecom and internet regulator for cybercrime reporting.' },
  ],
  'Indonesia': [
    { name: 'BSSN (National Cyber and Crypto Agency)', country: 'Indonesia', type: 'government', category: 'cyber_cell', website: 'https://www.bssn.go.id', phone: '+62-21-1500035', email: 'humas@bssn.go.id', address: 'Jakarta', reportingUrl: 'https://www.bssn.go.id/lapor', description: 'Indonesia\'s national cybersecurity agency.' },
  ],
  'Mexico': [
    { name: 'Guardia Nacional - Cybercrime Division', country: 'Mexico', type: 'law_enforcement', category: 'cyber_cell', website: 'https://www.gob.mx/guardianacional', phone: '088', email: null, address: 'Mexico City', reportingUrl: 'https://www.gob.mx/guardianacional', description: 'Mexico\'s federal police cybercrime division.' },
    { name: 'CERT-MX', country: 'Mexico', type: 'government', category: 'cyber_cell', website: 'https://www.cert.mx', phone: '+52-55-5283-0500', email: 'contacto@cert.mx', address: 'Mexico City', reportingUrl: 'https://www.cert.mx/reportar', description: 'Mexico\'s national CERT.' },
  ],
  'Russia': [
    { name: 'Ministry of Internal Affairs - Cybercrime Unit (K)', country: 'Russia', type: 'law_enforcement', category: 'cyber_cell', website: 'https://мвд.рф', phone: '102', email: null, address: 'Moscow', reportingUrl: 'https://мвд.рф/report', description: 'Russia\'s MVD cybercrime investigation unit.' },
  ],
};

export class FraudService {
  private urlAnalyzer = new UrlAnalyzer();
  private textAnalyzer = new TextAnalyzer();
  private documentProcessor = new DocumentProcessor();
  private riskScorer = new RiskScorer();
  private aiExplainer = new AiExplainer();

  async scanText(userId: string, text: string, inputType: 'sms' | 'text' | 'email') {
    const textResult = this.textAnalyzer.analyze(text, inputType);

    const urlRegex = /https?:\/\/[^\s<>"']+/gi;
    const bareUrlRegex = /\b[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.(?:[a-z]{2,}|online|xyz|top|buzz|click|club|work|tk|ml|ga|cf|gq)(?:\/[^\s<>"']*)?/gi;
    const fullUrls = text.match(urlRegex) || [];
    const bareUrls = text.match(bareUrlRegex) || [];
    const allUrls = [...new Set([...fullUrls, ...bareUrls])];
    const urlResults = [];
    for (const url of allUrls.slice(0, 5)) {
      try {
        const urlToAnalyze = /^https?:\/\//i.test(url) ? url : `https://${url}`;
        const result = await this.urlAnalyzer.analyzeUrl(urlToAnalyze);
        urlResults.push(result);
      } catch { /* skip failed URL analyses */ }
    }

    const urlIndicatorTypes = new Set(['URL_SHORTENER', 'SUSPICIOUS_TLD', 'LOOKALIKE', 'NO_HTTPS', 'IP_ADDRESS_URL']);
    const textOnlyIndicators = textResult.indicators.filter((ind) => !urlIndicatorTypes.has(ind.indicator));

    const allIndicators = [
      ...textOnlyIndicators.map((ind) => ({
        indicator: ind.indicator,
        severity: ind.severity,
        description: ind.description,
        evidence: ind.evidence,
        score: ind.score,
      })),
      ...urlResults.flatMap((ur) =>
        ur.indicators.map((ind) => ({
          indicator: ind.indicator,
          severity: ind.severity,
          description: ind.description,
          evidence: ind.evidence || '',
          score: undefined as number | undefined,
        }))
      ),
    ];

    const riskScore = this.riskScorer.calculateScore(allIndicators);

    const redactedContent = redactSensitiveData(text);
    const report = await prisma.fraudReport.create({
      data: {
        userId,
        inputType,
        inputContent: redactedContent.substring(0, 5000),
        riskScore: riskScore.score,
        riskLevel: riskScore.level,
        analysis: JSON.stringify({
          textAnalysis: textResult,
          urlResults: urlResults.map((ur) => ({
            url: ur.url,
            domain: ur.domain,
            riskLevel: ur.riskLevel,
          })),
        }),
        evidenceJson: JSON.stringify(allIndicators),
        recommendation:
          riskScore.level === 'safe'
            ? 'No significant indicators detected. Exercise normal caution.'
            : 'Review the detected indicators and take recommended precautions.',
        status: 'analyzed',
      },
    });

    for (const ind of allIndicators) {
      await prisma.fraudIndicator.create({
        data: {
          fraudReportId: report.id,
          indicatorType: ind.indicator,
          indicatorValue: ind.description,
          confidence: 0.8,
          severity: ind.severity,
          description: ind.evidence,
        },
      });
    }

    let aiExplanation;
    try {
      aiExplanation = await this.aiExplainer.generateExplanation(
        riskScore.score,
        riskScore.level,
        allIndicators,
        inputType,
        redactedContent.substring(0, 200)
      );
    } catch {
      aiExplanation = {
        explanation: `This ${inputType} was analyzed and found to have ${allIndicators.length} indicator(s) with a risk score of ${riskScore.score}/100.`,
        recommendedActions:
          riskScore.score > 40
            ? ['Do not click any links', 'Do not share personal information', 'Verify through official channels']
            : ['Exercise normal caution'],
        disclaimer: 'This is an automated analysis.',
      };
    }

    return {
      id: report.id,
      inputType,
      riskScore: riskScore.score,
      riskLevel: riskScore.level,
      indicators: allIndicators,
      urlResults: urlResults.map((ur) => ({
        url: ur.url,
        domain: ur.domain,
        isHttps: ur.isHttps,
        riskLevel: ur.riskLevel,
        indicators: ur.indicators,
      })),
      explanation: aiExplanation,
      recommendation: report.recommendation,
      createdAt: report.createdAt,
    };
  }

  async scanUrl(userId: string, url: string) {
    if (!isSafeUrl(url)) {
      throw new Error('URL blocked: potential SSRF risk');
    }

    const analysis = await this.urlAnalyzer.analyzeUrl(url);

    let aiExplanation;
    try {
      aiExplanation = await this.aiExplainer.generateExplanation(
        analysis.riskScore,
        analysis.riskLevel,
        analysis.indicators.map((ind) => ({
          indicator: ind.indicator,
          severity: ind.severity,
          description: ind.description,
          evidence: ind.evidence || '',
        })),
        'url',
        url.substring(0, 200)
      );
    } catch {
      aiExplanation = {
        explanation: analysis.analysis,
        recommendedActions: analysis.riskScore > 40
          ? ['Do not visit this URL', 'Do not enter personal information', 'Verify the domain through official channels']
          : ['Exercise normal caution'],
        disclaimer: '',
      };
    }

    const scan = await prisma.urlScan.create({
      data: {
        userId,
        url,
        domain: analysis.domain,
        isHttps: analysis.isHttps,
        hasRedirect: analysis.hasRedirect,
        redirectUrl: analysis.redirectUrl,
        reputationScore: 100 - analysis.riskScore,
        riskLevel: analysis.riskLevel,
        analysis: JSON.stringify(analysis),
        status: 'completed',
      },
    });

    for (const ind of analysis.indicators) {
      await prisma.urlIndicator.create({
        data: {
          urlScanId: scan.id,
          indicator: ind.indicator,
          severity: ind.severity,
          description: ind.description,
          evidence: ind.evidence,
        },
      });
    }

    return {
      id: scan.id,
      url: analysis.url,
      domain: analysis.domain,
      isHttps: analysis.isHttps,
      hasRedirect: analysis.hasRedirect,
      redirectUrl: analysis.redirectUrl,
      riskScore: analysis.riskScore,
      riskLevel: analysis.riskLevel,
      indicators: analysis.indicators,
      analysis: aiExplanation.explanation || analysis.analysis,
      explanation: aiExplanation,
      createdAt: scan.createdAt,
    };
  }

  async scanDocument(userId: string, file: File | Buffer, filename: string, mimeType: string) {
    const fileSize = file instanceof File ? file.size : (file as Buffer).length;
    const validation = validateFile({ name: filename, size: fileSize, type: mimeType });
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const docResult = await this.documentProcessor.processFile(file, filename, mimeType);

    const textResult = this.textAnalyzer.analyze(docResult.text || '', 'text');

    const urlResults = [];
    for (const url of docResult.urls.slice(0, 5)) {
      try {
        urlResults.push(await this.urlAnalyzer.analyzeUrl(url));
      } catch { /* skip */ }
    }

    const allIndicators = [
      ...textResult.indicators.map((ind) => ({
        indicator: ind.indicator,
        severity: ind.severity,
        description: ind.description,
        evidence: ind.evidence,
        score: ind.score,
      })),
      ...urlResults.flatMap((ur) =>
        ur.indicators.map((ind) => ({
          indicator: ind.indicator,
          severity: ind.severity,
          description: ind.description,
          evidence: ind.evidence || '',
          score: undefined as number | undefined,
        }))
      ),
      ...docResult.indicators.map((i) => ({
        indicator: 'SUSPICIOUS_CONTENT',
        severity: 'medium' as const,
        description: i,
        evidence: i,
        score: undefined as number | undefined,
      })),
    ];

    const riskScore = this.riskScorer.calculateScore(allIndicators);

    const redactedContent = redactSensitiveData(docResult.text);

    let aiExplanation;
    try {
      aiExplanation = await this.aiExplainer.generateExplanation(
        riskScore.score,
        riskScore.level,
        allIndicators,
        'pdf',
        redactedContent.substring(0, 200)
      );
    } catch {
      aiExplanation = {
        explanation: `Document "${filename}" analyzed with ${allIndicators.length} indicator(s). Risk score: ${riskScore.score}/100.`,
        recommendedActions: riskScore.score > 40
          ? ['Do not trust this document without verification', 'Contact the issuing organization directly', 'Check for watermarks and official seals']
          : ['Exercise normal caution with document contents'],
        disclaimer: 'This is an automated analysis.',
      };
    }

    const report = await prisma.fraudReport.create({
      data: {
        userId,
        inputType: 'pdf',
        inputContent: redactedContent.substring(0, 5000),
        inputFilePath: filename,
        riskScore: riskScore.score,
        riskLevel: riskScore.level,
        analysis: JSON.stringify({
          document: { filename, fileType: mimeType },
          textAnalysis: textResult,
        }),
        evidenceJson: JSON.stringify(allIndicators),
        status: 'analyzed',
      },
    });

    for (const ind of allIndicators) {
      await prisma.fraudIndicator.create({
        data: {
          fraudReportId: report.id,
          indicatorType: ind.indicator,
          indicatorValue: ind.description,
          confidence: 0.7,
          severity: ind.severity,
          description: ind.evidence,
        },
      });
    }

    return {
      id: report.id,
      filename,
      text: docResult.text.substring(0, 2000),
      riskScore: riskScore.score,
      riskLevel: riskScore.level,
      indicators: allIndicators,
      urls: docResult.urls,
      explanation: aiExplanation,
      createdAt: report.createdAt,
    };
  }

  async getReport(reportId: string, userId: string) {
    return prisma.fraudReport.findFirst({
      where: { id: reportId, userId },
      include: { indicators: true, evidenceList: true },
    });
  }

  async getUserReports(userId: string, options?: { page?: number; limit?: number }) {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 20, 100);
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      prisma.fraudReport.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          indicators: { select: { indicatorType: true, severity: true } },
        },
      }),
      prisma.fraudReport.count({ where: { userId } }),
    ]);

    return {
      reports,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteReport(reportId: string, userId: string) {
    const report = await prisma.fraudReport.findFirst({ where: { id: reportId, userId } });
    if (!report) {
      throw new Error('Report not found');
    }
    await prisma.fraudReport.delete({ where: { id: reportId } });
  }

  async getCyberAuthorities(country?: string) {
    const dbResults = await prisma.cyberAuthority.findMany({
      where: country ? { country } : {},
      include: { complaintProcedures: true },
      orderBy: { name: 'asc' },
    });

    // If database has results, return them
    if (dbResults.length > 0) return dbResults;

    // Fallback: hardcoded authorities for all supported countries
    if (country) {
      const fallback = FALLBACK_AUTHORITIES[country] || [];
      return fallback.map((a, i) => ({
        id: `fallback-${country}-${i}`,
        ...a,
        complaintProcedures: [],
        verificationStatus: 'verified' as const,
        lastVerifiedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    }

    // No country specified and no DB results — return all fallback data
    return Object.entries(FALLBACK_AUTHORITIES).flatMap(([c, auths]) =>
      auths.map((a, i) => ({
        id: `fallback-${c}-${i}`,
        ...a,
        complaintProcedures: [],
        verificationStatus: 'verified' as const,
        lastVerifiedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
  }

  async getComplaintProcedures(country: string, category?: string) {
    return prisma.complaintProcedure.findMany({
      where: { country, ...(category ? { category } : {}) },
      include: { authority: true },
    });
  }

  async submitFeedback(userId: string, reportId: string, feedback: 'correct' | 'incorrect', comment?: string) {
    await prisma.userReport.create({
      data: {
        userId,
        fraudReportId: reportId,
        feedback,
        comment,
      },
    });
  }
}

export const fraudService = new FraudService();
