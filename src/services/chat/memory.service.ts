import prisma from '@/lib/prisma';

const BLOCKED_KEYS = [
  'password', 'otp', 'pin', 'cvv', 'private_key', 'api_key',
  'secret', 'token', 'ssn', 'credit_card', 'debit_card',
];

const BLOCKED_PATTERNS = [
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/,
  /\b\d{3,4}\b.*\b(cvv|cvc)\b/i,
  /\bpassword\b.*[:=]\s*\S+/i,
  /\b(api[_-]?key)\b.*[:=]\s*\S+/i,
];

export class MemoryService {
  async getMemory(userId: string) {
    return prisma.userMemory.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async setMemory(userId: string, key: string, value: string, source = 'auto') {
    if (this.isSensitive(key, value)) return null;

    const normalizedKey = key.toLowerCase().replace(/\s+/g, '_');

    return prisma.userMemory.upsert({
      where: { userId_key: { userId, key: normalizedKey } },
      update: { value, source, updatedAt: new Date() },
      create: { userId, key: normalizedKey, value, source },
    });
  }

  async deleteMemory(userId: string, key: string) {
    return prisma.userMemory.deleteMany({
      where: { userId, key },
    });
  }

  async deleteAllMemory(userId: string) {
    return prisma.userMemory.deleteMany({
      where: { userId },
    });
  }

  async extractAndStoreFacts(userId: string, messageContent: string) {
    const factsToExtract = [
      { key: 'education_level', patterns: [/\b(intermediate|matric|bachelors?|masters?|phd|degree|graduated?|studying)\b/i] },
      { key: 'grades', patterns: [/\b(\d{1,3}%|\d{1,3}\s*percent|grades?|gpa|marks?)\b/i] },
      { key: 'field', patterns: [/\b(computer science|engineering|medicine|business|arts|math|physics|chemistry|biology|mba|data science|ai)\b/i] },
      { key: 'preferred_country', patterns: [/\b(germany|usa|uk|canada|australia|pakistan|india|japan|china|korea|turkey|malaysia|uae|saudi)\b/i] },
      { key: 'career_goal', patterns: [/\b(career|job|profession|become|want to be)\b/i] },
      { key: 'budget', patterns: [/\b(budget|salary|income|expense|rupees?|dollars?|\$\d+)\b/i] },
      { key: 'language_preference', patterns: [/\b(english|roman urdu|urdu|hindi)\b/i] },
    ];

    for (const { key, patterns } of factsToExtract) {
      for (const pattern of patterns) {
        const match = messageContent.match(pattern);
        if (match) {
          const value = match[0];
          if (!this.isSensitive(key, value)) {
            await this.setMemory(userId, key, value, 'conversation');
          }
          break;
        }
      }
    }
  }

  private isSensitive(key: string, value: string): boolean {
    const lowerKey = key.toLowerCase();
    if (BLOCKED_KEYS.some((bk) => lowerKey.includes(bk))) return true;
    if (BLOCKED_PATTERNS.some((p) => p.test(value))) return true;
    return false;
  }
}

export const memoryService = new MemoryService();
