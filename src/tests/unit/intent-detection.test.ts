import { describe, it, expect } from 'vitest';
import { detectIntent, getIntentLabel } from '@/services/ai/intent-detection';

describe('Intent Detection', () => {
  describe('detectIntent', () => {
    it('detects scholarship intent', () => {
      const result = detectIntent('Germany me fully funded scholarship mil sakti he?');
      expect(result.intent).toBe('scholarship');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('detects university intent', () => {
      const result = detectIntent('Which university is best for computer science?');
      expect(result.intent).toBe('university');
    });

    it('detects fraud intent', () => {
      const result = detectIntent('ye link fake he? check karo');
      expect(result.intent).toBe('fraud');
    });

    it('detects budget intent', () => {
      const result = detectIntent('meri salary 80k he budget bana do');
      expect(result.intent).toBe('budget');
    });

    it('detects study_plan intent', () => {
      const result = detectIntent('create a study plan for my exams');
      expect(result.intent).toBe('study_plan');
    });

    it('detects visa intent', () => {
      const result = detectIntent('mera student visa ka status kya hai passport lagega?');
      expect(['visa', 'fraud']).toContain(result.intent);
    });

    it('detects help intent', () => {
      const result = detectIntent('what can you do? help me');
      expect(result.intent).toBe('help');
    });

    it('detects admission intent', () => {
      const result = detectIntent('admission eligibility requirements form');
      expect(['admission', 'university']).toContain(result.intent);
    });

    it('detects url_scan intent from URL', () => {
      const result = detectIntent('is this link safe? https://example.com');
      expect(['url_scan', 'fraud']).toContain(result.intent);
    });

    it('detects general intent for generic message', () => {
      const result = detectIntent('hello how are you');
      expect(result.intent).toBe('general');
    });

    it('returns general for empty input', () => {
      const result = detectIntent('');
      expect(result.intent).toBe('general');
      expect(result.confidence).toBe(0.5);
    });

    it('detects course intent', () => {
      const result = detectIntent('computer science course kahan se karoon?');
      expect(result.intent).toBe('course');
    });

    it('detects document_scan intent', () => {
      const result = detectIntent('scan document for me check document');
      expect(['document_scan', 'fraud']).toContain(result.intent);
    });

    it('detects teacher intent', () => {
      const result = detectIntent('I am a teacher, help me create lesson plans');
      expect(result.intent).toBe('teacher');
    });

    it('detects account intent', () => {
      const result = detectIntent('how do I change my password?');
      expect(result.intent).toBe('account');
    });

    it('detects education intent', () => {
      const result = detectIntent('I need education guidance for university selection');
      expect(result.intent).toBe('education');
    });

    it('detects career intent', () => {
      const result = detectIntent('What can I do after BS Computer Science?');
      expect(result.intent).toBe('career');
    });
  });

  describe('getIntentLabel', () => {
    it('returns correct labels for all intents', () => {
      expect(getIntentLabel('general')).toBe('General');
      expect(getIntentLabel('education')).toBe('Education');
      expect(getIntentLabel('university')).toBe('University');
      expect(getIntentLabel('scholarship')).toBe('Scholarship');
      expect(getIntentLabel('fraud')).toBe('Fraud');
      expect(getIntentLabel('budget')).toBe('Budget');
      expect(getIntentLabel('study_plan')).toBe('Study Plan');
      expect(getIntentLabel('visa')).toBe('Visa');
      expect(getIntentLabel('help')).toBe('Help');
    });
  });
});
