export { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse, internalErrorResponse, rateLimitResponse } from './api';
export { validateRequest, authSchemas, chatSchemas, fraudSchemas, budgetSchemas, educationSchemas, emailSchema, passwordSchema, nameSchema, uuidSchema } from './validation';

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
