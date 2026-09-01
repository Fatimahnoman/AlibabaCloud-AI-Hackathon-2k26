import { describe, it, expect } from 'vitest';
import { documentIntelligenceService } from '@/services/document-intelligence/document-intelligence.service';

describe('DocumentIntelligenceService', () => {
  const userId = 'test-user-1';

  const wellFormedContent = [
    'My academic journey began when I discovered my passion for computer science during my undergraduate studies.',
    'Throughout my degree, I completed several research projects that strengthened my technical foundation.',
    'My goal is to pursue advanced study in machine learning at a leading university.',
    'The program aligns perfectly with my career aspirations in artificial intelligence research.',
    '',
    'During my final year, I led a team project building a recommendation system for an education platform.',
    'This experience taught me how to apply theoretical knowledge to real-world problems.',
    'I also published a paper at a national conference on applied machine learning.',
    '',
    'I am confident that this program will help me achieve my research goals.',
    'The university offers world-class faculty and cutting-edge laboratories.',
    'I look forward to contributing to the academic community and growing as a researcher.',
  ].join('\n');

  describe('analyzeDocument', () => {
    it('returns result with all score fields', async () => {
      const result = await documentIntelligenceService.analyzeDocument(userId, wellFormedContent);
      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('structureScore');
      expect(result).toHaveProperty('clarityScore');
      expect(result).toHaveProperty('grammarScore');
      expect(result).toHaveProperty('relevanceScore');
      expect(typeof result.overallScore).toBe('number');
      expect(typeof result.structureScore).toBe('number');
      expect(typeof result.clarityScore).toBe('number');
      expect(typeof result.grammarScore).toBe('number');
      expect(typeof result.relevanceScore).toBe('number');
    });

    it('scores within 0-100 range', async () => {
      const result = await documentIntelligenceService.analyzeDocument(userId, wellFormedContent);
      for (const score of [
        result.overallScore,
        result.structureScore,
        result.clarityScore,
        result.grammarScore,
        result.relevanceScore,
      ]) {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    });

    it('includes executive summary string', async () => {
      const result = await documentIntelligenceService.analyzeDocument(userId, wellFormedContent);
      expect(typeof result.executiveSummary).toBe('string');
      expect(result.executiveSummary.length).toBeGreaterThan(0);
      expect(result.executiveSummary).toContain(`${result.overallScore}/100`);
    });

    it('includes strengths array (non-empty)', async () => {
      const result = await documentIntelligenceService.analyzeDocument(userId, wellFormedContent);
      expect(Array.isArray(result.strengths)).toBe(true);
      expect(result.strengths.length).toBeGreaterThan(0);
    });

    it('includes areasForImprovement array', async () => {
      const result = await documentIntelligenceService.analyzeDocument(userId, wellFormedContent);
      expect(Array.isArray(result.areasForImprovement)).toBe(true);
      expect(result.areasForImprovement.length).toBeGreaterThan(0);
    });

    it('includes suggestions array', async () => {
      const result = await documentIntelligenceService.analyzeDocument(
        userId,
        'I am very interested in this program.'
      );
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(result.suggestions.some((s) => s.category === 'conciseness')).toBe(true);
    });

    it('includes integrityCheck with integrityScore 0-100', async () => {
      const result = await documentIntelligenceService.analyzeDocument(userId, wellFormedContent);
      expect(result.integrityCheck).toBeDefined();
      expect(typeof result.integrityCheck.integrityScore).toBe('number');
      expect(result.integrityCheck.integrityScore).toBeGreaterThanOrEqual(0);
      expect(result.integrityCheck.integrityScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(result.integrityCheck.flaggedClaims)).toBe(true);
      expect(Array.isArray(result.integrityCheck.fakeIndicators)).toBe(true);
      expect(Array.isArray(result.integrityCheck.warnings)).toBe(true);
    });

    it('preserves originalContent exactly', async () => {
      const result = await documentIntelligenceService.analyzeDocument(
        userId,
        'Line one with   double spaces.\n\nLine two after paragraphs.'
      );
      expect(result.originalContent).toBe('Line one with   double spaces.\n\nLine two after paragraphs.');
    });

    it('generates unique id for each analysis', async () => {
      const r1 = await documentIntelligenceService.analyzeDocument(userId, wellFormedContent);
      const r2 = await documentIntelligenceService.analyzeDocument(userId, wellFormedContent);
      expect(r1.id).not.toBe(r2.id);
      expect(r1.id).toBeTruthy();
      expect(r2.id).toBeTruthy();
    });

    it('longer structured doc scores higher structure than one-word doc', async () => {
      const longResult = await documentIntelligenceService.analyzeDocument(userId, wellFormedContent);
      const shortResult = await documentIntelligenceService.analyzeDocument(userId, 'word');
      expect(longResult.structureScore).toBeGreaterThan(shortResult.structureScore);
    });

    it('flags exaggerated claims', async () => {
      const content =
        'I am the best-in-the-world candidate with unparalleled research abilities. ' +
        'I will definitely succeed in every endeavor I undertake at your institution.';
      const result = await documentIntelligenceService.analyzeDocument(userId, content);
      expect(result.integrityCheck.flaggedClaims.length).toBeGreaterThanOrEqual(3);
      const joined = result.integrityCheck.flaggedClaims.join(' ');
      expect(joined).toContain('best-in-the-world');
      expect(joined).toContain('unparalleled');
      expect(joined).toContain('definitely');
      expect(result.integrityCheck.integrityScore).toBeLessThan(100);
    });

    it('detects suspicious content', async () => {
      const content =
        'I bought my way through the admission process and purchased several certificates. ' +
        'The fake documents helped me gain entry into the university program last year.';
      const result = await documentIntelligenceService.analyzeDocument(userId, content);
      expect(result.integrityCheck.fakeIndicators.length).toBeGreaterThanOrEqual(3);
      const joined = result.integrityCheck.fakeIndicators.join(' ');
      expect(joined).toContain('bought');
      expect(joined).toContain('purchased');
      expect(joined).toContain('fake');
      expect(result.integrityCheck.integrityScore).toBeLessThanOrEqual(70);
    });

    it('handles all document types', async () => {
      const types = ['sop', 'personal_statement', 'cv_resume', 'cover_letter', 'essay', 'other'];
      for (const type of types) {
        const result = await documentIntelligenceService.analyzeDocument(userId, wellFormedContent, undefined, {
          documentType: type,
        });
        expect(result.documentType).toBe(type);
      }
    });

    it('defaults documentType to other when not provided', async () => {
      const result = await documentIntelligenceService.analyzeDocument(userId, wellFormedContent);
      expect(result.documentType).toBe('other');
    });

    it('stores targetInstitution when provided', async () => {
      const result = await documentIntelligenceService.analyzeDocument(userId, wellFormedContent, undefined, {
        targetInstitution: 'MIT',
      });
      expect(result.targetInstitution).toBe('MIT');
    });

    it('stores targetProgram when provided', async () => {
      const result = await documentIntelligenceService.analyzeDocument(userId, wellFormedContent, undefined, {
        targetProgram: 'MSc Computer Science',
      });
      expect(result.targetProgram).toBe('MSc Computer Science');
    });
  });

  describe('getAnalysisById', () => {
    it('returns analysis for correct user', async () => {
      const created = await documentIntelligenceService.analyzeDocument('byid-owner', wellFormedContent);
      const found = await documentIntelligenceService.getAnalysisById(created.id, 'byid-owner');
      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.userId).toBe('byid-owner');
    });

    it('returns null for wrong userId', async () => {
      const created = await documentIntelligenceService.analyzeDocument('byid-owner-2', wellFormedContent);
      const found = await documentIntelligenceService.getAnalysisById(created.id, 'byid-imposter');
      expect(found).toBeNull();
    });

    it('returns null for nonexistent id', async () => {
      const found = await documentIntelligenceService.getAnalysisById('does-not-exist', userId);
      expect(found).toBeNull();
    });
  });

  describe('getAnalysisHistory', () => {
    it('returns paginated results', async () => {
      const paginatedUser = 'history-user-1';
      const createdIds: string[] = [];
      for (let i = 0; i < 5; i++) {
        const r = await documentIntelligenceService.analyzeDocument(paginatedUser, `${wellFormedContent} variant ${i}`);
        createdIds.push(r.id);
      }
      const page1 = await documentIntelligenceService.getAnalysisHistory(paginatedUser, { page: 1, limit: 2 });
      expect(page1.total).toBe(5);
      expect(page1.page).toBe(1);
      expect(page1.limit).toBe(2);
      expect(page1.totalPages).toBe(3);
      expect(page1.analyses.length).toBe(2);
      expect(page1.analyses[0].id).toBe(createdIds[4]);
      expect(page1.analyses[1].id).toBe(createdIds[3]);

      const page2 = await documentIntelligenceService.getAnalysisHistory(paginatedUser, { page: 2, limit: 2 });
      expect(page2.analyses.length).toBe(2);
      expect(page2.analyses[0].id).toBe(createdIds[2]);
    });

    it('filters by documentType', async () => {
      const filterUser = 'history-user-2';
      await documentIntelligenceService.analyzeDocument(filterUser, wellFormedContent, undefined, {
        documentType: 'sop',
      });
      await documentIntelligenceService.analyzeDocument(filterUser, wellFormedContent, undefined, {
        documentType: 'essay',
      });
      await documentIntelligenceService.analyzeDocument(filterUser, wellFormedContent, undefined, {
        documentType: 'sop',
      });
      const history = await documentIntelligenceService.getAnalysisHistory(filterUser, { documentType: 'sop' });
      expect(history.total).toBe(2);
      expect(history.analyses.length).toBe(2);
      expect(history.analyses.every((a) => a.documentType === 'sop')).toBe(true);
    });

    it('returns empty for unknown user', async () => {
      const history = await documentIntelligenceService.getAnalysisHistory('no-such-user-exists');
      expect(history.analyses).toEqual([]);
      expect(history.total).toBe(0);
      expect(history.totalPages).toBe(0);
    });
  });

  describe('deleteAnalysis', () => {
    it('deletes and returns true', async () => {
      const deleteOwner = 'delete-user-1';
      const created = await documentIntelligenceService.analyzeDocument(deleteOwner, wellFormedContent);
      const deleted = await documentIntelligenceService.deleteAnalysis(created.id, deleteOwner);
      expect(deleted).toBe(true);
      const found = await documentIntelligenceService.getAnalysisById(created.id, deleteOwner);
      expect(found).toBeNull();
    });

    it('returns false for wrong user', async () => {
      const created = await documentIntelligenceService.analyzeDocument('delete-user-2', wellFormedContent);
      const deleted = await documentIntelligenceService.deleteAnalysis(created.id, 'delete-user-wrong');
      expect(deleted).toBe(false);
      const stillThere = await documentIntelligenceService.getAnalysisById(created.id, 'delete-user-2');
      expect(stillThere).not.toBeNull();
    });

    it('returns false for nonexistent id', async () => {
      const deleted = await documentIntelligenceService.deleteAnalysis('missing-id-123', userId);
      expect(deleted).toBe(false);
    });
  });

  describe('getDocumentTypeGuidelines', () => {
    it('returns guidelines for known types', () => {
      const knownTypes = ['sop', 'personal_statement', 'recommendation_letter', 'cv_resume', 'cover_letter', 'essay', 'other'];
      for (const type of knownTypes) {
        const guidelines = documentIntelligenceService.getDocumentTypeGuidelines(type);
        expect(guidelines).not.toBeNull();
        expect(typeof guidelines!.title).toBe('string');
        expect(guidelines!.title.length).toBeGreaterThan(0);
        expect(typeof guidelines!.description).toBe('string');
        expect(Array.isArray(guidelines!.tips)).toBe(true);
        expect(guidelines!.tips.length).toBeGreaterThan(0);
      }
      expect(documentIntelligenceService.getDocumentTypeGuidelines('sop')?.title).toBe('Statement of Purpose (SOP)');
    });

    it('returns null for unknown type', () => {
      expect(documentIntelligenceService.getDocumentTypeGuidelines('nonexistent_type')).toBeNull();
    });
  });

  describe('getAllDocumentTypeGuidelines', () => {
    it('returns all guidelines object', () => {
      const all = documentIntelligenceService.getAllDocumentTypeGuidelines();
      expect(Object.keys(all).sort()).toEqual(
        ['cover_letter', 'cv_resume', 'essay', 'other', 'personal_statement', 'recommendation_letter', 'sop'].sort()
      );
      for (const key of Object.keys(all)) {
        expect(typeof all[key].title).toBe('string');
        expect(typeof all[key].description).toBe('string');
        expect(all[key].tips.length).toBeGreaterThan(0);
      }
    });
  });
});
