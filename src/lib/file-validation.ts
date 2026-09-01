export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const ALLOWED_TYPES: Record<
  string,
  { extensions: string[]; mimeTypes: string[] }
> = {
  pdf: { extensions: [".pdf"], mimeTypes: ["application/pdf"] },
  doc: {
    extensions: [".doc"],
    mimeTypes: [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  docx: {
    extensions: [".docx"],
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  txt: { extensions: [".txt"], mimeTypes: ["text/plain"] },
  md: { extensions: [".md"], mimeTypes: ["text/markdown", "text/x-markdown"] },
  png: { extensions: [".png"], mimeTypes: ["image/png"] },
  jpg: {
    extensions: [".jpg", ".jpeg"],
    mimeTypes: ["image/jpeg"],
  },
  jpeg: {
    extensions: [".jpg", ".jpeg"],
    mimeTypes: ["image/jpeg"],
  },
  gif: { extensions: [".gif"], mimeTypes: ["image/gif"] },
  webp: { extensions: [".webp"], mimeTypes: ["image/webp"] },
};

const MAGIC_BYTES: Record<string, number[][]> = {
  'pdf': [[0x25, 0x50, 0x44, 0x46]],
  'docx': [[0x50, 0x4B, 0x03, 0x04]],
  'doc': [[0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]],
  'png': [[0x89, 0x50, 0x4E, 0x47]],
  'jpg': [[0xFF, 0xD8, 0xFF]],
  'gif': [[0x47, 0x49, 0x46, 0x38]],
  'webp': [[0x52, 0x49, 0x46, 0x46]],
  'txt': [[0xEF, 0xBB, 0xBF], [0xFF, 0xFE], [0xFE, 0xFF]],
};

function verifyMagicBytes(buffer: ArrayBuffer, expectedType: string): boolean {
  const bytes = new Uint8Array(buffer.slice(0, 16));
  const expected = MAGIC_BYTES[expectedType];
  if (!expected) return true;

  return expected.some(signature =>
    signature.every((byte, i) => bytes[i] === byte)
  );
}

function detectTypeFromMagicBytes(buffer: ArrayBuffer): string | null {
  const bytes = new Uint8Array(buffer.slice(0, 16));
  for (const [type, signatures] of Object.entries(MAGIC_BYTES)) {
    if (signatures.some(sig => sig.every((byte, i) => bytes[i] === byte))) {
      return type;
    }
  }
  return null;
}

function getExtensionFromFilename(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return "";
  return filename.slice(lastDot).toLowerCase();
}

function getAllowedExtensions(): string[] {
  const extensions: string[] = [];
  for (const type of Object.values(ALLOWED_TYPES)) {
    for (const ext of type.extensions) {
      if (!extensions.includes(ext)) {
        extensions.push(ext);
      }
    }
  }
  return extensions;
}

function getAllowedMimeTypes(): string[] {
  const mimeTypes: string[] = [];
  for (const type of Object.values(ALLOWED_TYPES)) {
    for (const mime of type.mimeTypes) {
      if (!mimeTypes.includes(mime)) {
        mimeTypes.push(mime);
      }
    }
  }
  return mimeTypes;
}

function isAllowedExtension(extension: string): boolean {
  return getAllowedExtensions().includes(extension);
}

function isAllowedMimeType(mimeType: string): boolean {
  return getAllowedMimeTypes().includes(mimeType.toLowerCase());
}

export function validateFile(file: {
  name: string;
  size: number;
  type: string;
  buffer?: ArrayBuffer;
}): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`,
    };
  }

  if (file.size <= 0) {
    return { valid: false, error: "File is empty" };
  }

  const extension = getExtensionFromFilename(file.name);
  if (!extension) {
    return { valid: false, error: "File has no extension" };
  }

  if (!isAllowedExtension(extension)) {
    return { valid: false, error: `File extension '${extension}' is not allowed` };
  }

  if (!isAllowedMimeType(file.type)) {
    return { valid: false, error: `MIME type '${file.type}' is not allowed` };
  }

  if (file.buffer) {
    const detectedType = detectTypeFromMagicBytes(file.buffer);
    const extType = extension.replace('.', '');

    if (detectedType && detectedType !== extType && detectedType !== 'docx' && extType !== 'doc') {
      return {
        valid: false,
        error: `File content does not match declared type (detected ${detectedType}, expected ${extType})`,
      };
    }

    if (!verifyMagicBytes(file.buffer, extType)) {
      return {
        valid: false,
        error: `File content does not match expected format`,
      };
    }
  }

  return { valid: true };
}

const IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
]);

const DOCUMENT_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".md",
]);

export function isImageFile(filename: string): boolean {
  const ext = getExtensionFromFilename(filename);
  return IMAGE_EXTENSIONS.has(ext);
}

export function isDocumentFile(filename: string): boolean {
  const ext = getExtensionFromFilename(filename);
  return DOCUMENT_EXTENSIONS.has(ext);
}

export function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExtension: Record<string, string> = {
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "text/plain": ".txt",
    "text/markdown": ".md",
    "text/x-markdown": ".md",
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/gif": ".gif",
    "image/webp": ".webp",
  };

  return mimeToExtension[mimeType.toLowerCase()] ?? "";
}
