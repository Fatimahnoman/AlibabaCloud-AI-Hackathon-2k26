import { describe, it, expect } from 'vitest';
import { detectLanguage, getLanguageLabel } from '@/services/ai/language-detection';

describe('Language Detection', () => {
  describe('detectLanguage', () => {
    it('detects English text', () => {
      expect(detectLanguage('What is artificial intelligence?')).toBe('english');
    });

    it('detects Roman Urdu text', () => {
      expect(detectLanguage('mujhe scholarship ke bare me batao')).toBe('roman_urdu');
    });

    it('detects Roman Urdu with common words', () => {
      expect(detectLanguage('mera paisa khatam ho gaya hai')).toBe('roman_urdu');
    });

    it('detects Roman Urdu conversational text', () => {
      expect(detectLanguage('bilkul mein samajh gaya')).toBe('roman_urdu');
    });

    it('detects Urdu script text', () => {
      expect(detectLanguage('مجھے اسکالرشپ کے بارے میں بتائیں')).toBe('urdu');
    });

    it('detects mixed English and Roman Urdu', () => {
      expect(detectLanguage('mujhe CS ki scholarship chahiye')).toBe('roman_urdu');
    });

    it('detects mixed Urdu and English', () => {
      expect(detectLanguage('مجھے CS scholarship چاہیے')).toBe('mixed');
    });

    it('returns unknown for empty string', () => {
      expect(detectLanguage('')).toBe('unknown');
    });

    it('returns unknown for whitespace only', () => {
      expect(detectLanguage('   ')).toBe('unknown');
    });

    it('returns english for simple ASCII', () => {
      expect(detectLanguage('hello')).toBe('english');
    });

    it('detects Roman Urdu budget text', () => {
      expect(detectLanguage('paisa bachana hai monthly budget banao')).toBe('roman_urdu');
    });

    it('detects Roman Urdu study text', () => {
      expect(detectLanguage('padhai ka plan banao exam ki taiyari')).toBe('roman_urdu');
    });
  });

  describe('getLanguageLabel', () => {
    it('returns correct label for english', () => {
      expect(getLanguageLabel('english')).toBe('English');
    });

    it('returns correct label for roman_urdu', () => {
      expect(getLanguageLabel('roman_urdu')).toBe('Roman Urdu');
    });

    it('returns correct label for urdu', () => {
      expect(getLanguageLabel('urdu')).toBe('Urdu');
    });

    it('returns correct label for mixed', () => {
      expect(getLanguageLabel('mixed')).toBe('Mixed');
    });

    it('defaults to English for unknown', () => {
      expect(getLanguageLabel('unknown')).toBe('English');
    });
  });
});
