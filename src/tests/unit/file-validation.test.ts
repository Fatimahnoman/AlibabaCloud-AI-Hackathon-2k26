import { describe, it, expect } from 'vitest';
import {
  validateFile,
  isImageFile,
  isDocumentFile,
  getExtensionFromMimeType,
  MAX_FILE_SIZE,
} from '@/lib/file-validation';

describe('File Validation', () => {
  describe('validateFile', () => {
    it('accepts valid PDF with correct size and type', () => {
      const result = validateFile({
        name: 'report.pdf',
        size: 1024 * 500,
        type: 'application/pdf',
      });
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('accepts valid PNG image', () => {
      const result = validateFile({
        name: 'photo.png',
        size: 1024 * 100,
        type: 'image/png',
      });
      expect(result.valid).toBe(true);
    });

    it('accepts valid DOCX document', () => {
      const result = validateFile({
        name: 'document.docx',
        size: 1024 * 200,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      expect(result.valid).toBe(true);
    });

    it('rejects oversized files (>10MB)', () => {
      const result = validateFile({
        name: 'huge.pdf',
        size: MAX_FILE_SIZE + 1,
        type: 'application/pdf',
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum');
    });

    it('rejects empty files', () => {
      const result = validateFile({
        name: 'empty.pdf',
        size: 0,
        type: 'application/pdf',
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('rejects unknown extensions', () => {
      const result = validateFile({
        name: 'malware.exe',
        size: 1024,
        type: 'application/x-msdownload',
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('rejects files with no extension', () => {
      const result = validateFile({
        name: 'noextension',
        size: 1024,
        type: 'application/pdf',
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('no extension');
    });

    it('rejects mismatched MIME types', () => {
      const result = validateFile({
        name: 'test.pdf',
        size: 1024,
        type: 'application/x-executable',
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('MIME type');
    });

    it('accepts files at exactly MAX_FILE_SIZE', () => {
      const result = validateFile({
        name: 'exact.pdf',
        size: MAX_FILE_SIZE,
        type: 'application/pdf',
      });
      expect(result.valid).toBe(true);
    });

    it('rejects .exe files', () => {
      const result = validateFile({
        name: 'program.exe',
        size: 1024,
        type: 'application/x-msdownload',
      });
      expect(result.valid).toBe(false);
    });

    it('rejects .js files', () => {
      const result = validateFile({
        name: 'script.js',
        size: 1024,
        type: 'text/javascript',
      });
      expect(result.valid).toBe(false);
    });
  });

  describe('isImageFile', () => {
    it('returns true for .png files', () => {
      expect(isImageFile('photo.png')).toBe(true);
      expect(isImageFile('image.PNG')).toBe(true);
    });

    it('returns true for .jpg files', () => {
      expect(isImageFile('photo.jpg')).toBe(true);
      expect(isImageFile('photo.jpeg')).toBe(true);
    });

    it('returns true for .gif files', () => {
      expect(isImageFile('animation.gif')).toBe(true);
    });

    it('returns true for .webp files', () => {
      expect(isImageFile('modern.webp')).toBe(true);
    });

    it('returns false for .pdf files', () => {
      expect(isImageFile('document.pdf')).toBe(false);
    });

    it('returns false for .docx files', () => {
      expect(isImageFile('document.docx')).toBe(false);
    });

    it('returns false for .exe files', () => {
      expect(isImageFile('program.exe')).toBe(false);
    });

    it('returns false for files with no extension', () => {
      expect(isImageFile('noextension')).toBe(false);
    });
  });

  describe('isDocumentFile', () => {
    it('returns true for .pdf files', () => {
      expect(isDocumentFile('report.pdf')).toBe(true);
    });

    it('returns true for .docx files', () => {
      expect(isDocumentFile('report.docx')).toBe(true);
    });

    it('returns true for .doc files', () => {
      expect(isDocumentFile('report.doc')).toBe(true);
    });

    it('returns true for .txt files', () => {
      expect(isDocumentFile('readme.txt')).toBe(true);
    });

    it('returns true for .md files', () => {
      expect(isDocumentFile('readme.md')).toBe(true);
    });

    it('returns false for .png files', () => {
      expect(isDocumentFile('image.png')).toBe(false);
    });

    it('returns false for .jpg files', () => {
      expect(isDocumentFile('photo.jpg')).toBe(false);
    });

    it('returns false for .exe files', () => {
      expect(isDocumentFile('program.exe')).toBe(false);
    });

    it('returns false for files with no extension', () => {
      expect(isDocumentFile('noextension')).toBe(false);
    });
  });

  describe('getExtensionFromMimeType', () => {
    it('returns .pdf for application/pdf', () => {
      expect(getExtensionFromMimeType('application/pdf')).toBe('.pdf');
    });

    it('returns .doc for application/msword', () => {
      expect(getExtensionFromMimeType('application/msword')).toBe('.doc');
    });

    it('returns .docx for docx MIME type', () => {
      expect(
        getExtensionFromMimeType(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
      ).toBe('.docx');
    });

    it('returns .txt for text/plain', () => {
      expect(getExtensionFromMimeType('text/plain')).toBe('.txt');
    });

    it('returns .png for image/png', () => {
      expect(getExtensionFromMimeType('image/png')).toBe('.png');
    });

    it('returns .jpg for image/jpeg', () => {
      expect(getExtensionFromMimeType('image/jpeg')).toBe('.jpg');
    });

    it('returns .gif for image/gif', () => {
      expect(getExtensionFromMimeType('image/gif')).toBe('.gif');
    });

    it('returns empty string for unknown MIME type', () => {
      expect(getExtensionFromMimeType('application/x-executable')).toBe('');
      expect(getExtensionFromMimeType('unknown/type')).toBe('');
    });

    it('is case-insensitive', () => {
      expect(getExtensionFromMimeType('APPLICATION/PDF')).toBe('.pdf');
      expect(getExtensionFromMimeType('Image/PNG')).toBe('.png');
    });
  });
});
