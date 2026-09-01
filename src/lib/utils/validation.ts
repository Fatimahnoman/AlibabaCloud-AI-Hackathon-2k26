import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(128);
export const nameSchema = z.string().min(1, 'Name is required').max(100);
export const uuidSchema = z.string().uuid('Invalid ID format');

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const field = err.path.join('.');
    errors[field] = err.message;
  });
  return { success: false, errors };
}

export const authSchemas = {
  register: z.object({
    email: emailSchema,
    password: passwordSchema,
    name: nameSchema,
    country: z.string().optional(),
    preferredLanguage: z.enum(['auto', 'english', 'roman_urdu', 'urdu']).optional(),
  }),
  login: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
  }),
};

export const chatSchemas = {
  createConversation: z.object({
    title: z.string().max(200).optional(),
    firstMessage: z.string().max(10000).optional(),
  }),
  sendMessage: z.object({
    conversationId: uuidSchema,
    content: z.string().min(1).max(10000),
    messageType: z.enum(['text', 'voice', 'image', 'document', 'url']).optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
};

export const fraudSchemas = {
  scan: z.object({
    inputType: z.enum(['sms', 'text', 'url', 'screenshot', 'pdf', 'image', 'email']),
    content: z.string().max(50000).optional(),
    url: z.string().url().optional(),
  }),
  urlScan: z.object({
    url: z.string().url('Invalid URL'),
  }),
};

export const budgetSchemas = {
  createProfile: z.object({
    monthlyIncome: z.number().positive('Income must be positive'),
    currency: z.string().min(3).max(3),
    savingsGoal: z.number().positive().optional(),
  }),
  addIncome: z.object({
    source: z.string().min(1).max(200),
    amount: z.number().positive(),
    frequency: z.enum(['weekly', 'biweekly', 'monthly', 'yearly', 'one_time']),
  }),
  addExpense: z.object({
    categoryId: uuidSchema,
    amount: z.number().positive(),
    description: z.string().max(500).optional(),
    date: z.string().datetime(),
    isRecurring: z.boolean().optional(),
    recurringFrequency: z.enum(['weekly', 'biweekly', 'monthly', 'yearly']).optional(),
  }),
};

export const educationSchemas = {
  searchUniversities: z.object({
    country: z.string().optional(),
    type: z.enum(['public', 'private']).optional(),
    degree: z.enum(['bachelors', 'masters', 'phd', 'diploma', 'certificate']).optional(),
    minRanking: z.number().optional(),
    maxRanking: z.number().optional(),
    maxTuition: z.number().optional(),
    currency: z.string().optional(),
    language: z.string().optional(),
    page: z.number().min(1).optional(),
    limit: z.number().min(1).max(100).optional(),
  }),
  searchScholarships: z.object({
    country: z.string().optional(),
    provider: z.string().optional(),
    minAmount: z.number().optional(),
    maxAmount: z.number().optional(),
    degreeLevel: z.enum(['bachelors', 'masters', 'phd', 'diploma', 'certificate']).optional(),
    page: z.number().min(1).optional(),
    limit: z.number().min(1).max(100).optional(),
  }),
};
