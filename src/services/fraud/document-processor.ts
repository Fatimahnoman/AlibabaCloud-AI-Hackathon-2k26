export interface DocumentProcessingResult {
  filename: string;
  fileType: string;
  text: string;
  urls: string[];
  indicators: string[];
  error?: string;
}

const IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/svg+xml',
];

const SUSPICIOUS_PATTERNS = [
  /<script[\s>]/i,
  /<iframe[\s>]/i,
  /\bmacro\b/i,
  /vbscript:/i,
  /javascript:/i,
  /<\?php/i,
  /\beval\s*\(/i,
  /\bexec\s*\(/i,
];

export class DocumentProcessor {
  async processFile(
    file: File | Buffer,
    filename: string,
    mimeType: string
  ): Promise<DocumentProcessingResult> {
    if (IMAGE_MIME_TYPES.includes(mimeType)) {
      return this.processImage(file, filename, mimeType);
    }

    if (mimeType === 'text/plain' || mimeType === 'text/markdown' || mimeType === 'text/x-markdown') {
      const buffer = file instanceof Buffer ? file : Buffer.from(await (file as File).arrayBuffer());
      const text = buffer.toString('utf-8');
      return {
        filename,
        fileType: mimeType,
        text,
        urls: this.extractUrls(text),
        indicators: this.checkSuspiciousContent(text),
      };
    }

    if (mimeType === 'application/pdf') {
      const buffer = file instanceof Buffer ? file : Buffer.from(await (file as File).arrayBuffer());
      try {
        const { execFile } = await import('child_process');
        const { writeFile, unlink } = await import('fs/promises');
        const { join, resolve } = await import('path');
        const { tmpdir } = await import('os');
        const tmpFile = join(tmpdir(), `pdf-${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`);
        await writeFile(tmpFile, buffer);
        const scriptPath = resolve(process.cwd(), 'scripts', 'parse-pdf.js');
        const text = await new Promise<string>((resolve, reject) => {
          execFile('node', [scriptPath, tmpFile], { timeout: 30000 }, (err, stdout, stderr) => {
            try { unlink(tmpFile); } catch { /* cleanup */ }
            if (err) {
              console.error('PDF exec error:', err.message, stderr);
              return reject(err);
            }
            try {
              const parsed = JSON.parse(stdout);
              resolve(parsed.success ? parsed.text : '');
            } catch { resolve(''); }
          });
        });
        return {
          filename,
          fileType: mimeType,
          text,
          urls: this.extractUrls(text),
          indicators: this.checkSuspiciousContent(text),
        };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('PDF parse error:', msg);
        return {
          filename,
          fileType: mimeType,
          text: '',
          urls: [],
          indicators: ['PDF text extraction failed'],
          error: 'PDF text extraction unavailable',
        };
      }
    }

    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      const buffer = file instanceof Buffer ? file : Buffer.from(await (file as File).arrayBuffer());
      try {
        const mammothMod = await import('mammoth');
        const result = await mammothMod.extractRawText({ buffer });
        const text = result.value;
        return {
          filename,
          fileType: mimeType,
          text,
          urls: this.extractUrls(text),
          indicators: this.checkSuspiciousContent(text),
        };
      } catch {
        return {
          filename,
          fileType: mimeType,
          text: '',
          urls: [],
          indicators: ['DOCX text extraction failed'],
          error: 'DOCX text extraction unavailable',
        };
      }
    }

    return {
      filename,
      fileType: mimeType,
      text: '',
      urls: [],
      indicators: [],
      error: `Unsupported file type: ${mimeType}`,
    };
  }

  private async processImage(
    _file: File | Buffer,
    filename: string,
    mimeType: string
  ): Promise<DocumentProcessingResult> {
    return {
      filename,
      fileType: mimeType,
      text: '',
      urls: [],
      indicators: [],
      error: 'Image OCR should be handled client-side via tesseract.js',
    };
  }

  private extractUrls(text: string): string[] {
    const urlRegex = /https?:\/\/[^\s<>"']+/gi;
    const matches = text.match(urlRegex);
    return matches ? [...new Set(matches)] : [];
  }

  private checkSuspiciousContent(text: string): string[] {
    const found: string[] = [];
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(text)) {
        found.push(`Suspicious pattern detected: ${pattern.source}`);
      }
    }
    return found;
  }
}

export const documentProcessor = new DocumentProcessor();
