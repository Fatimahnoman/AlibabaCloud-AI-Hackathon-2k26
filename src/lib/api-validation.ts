import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { errorResponse } from '@/lib/utils/api';

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: NextResponse };

export type RouteParams = Record<string, string | string[]>;

function formatFieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.errors) {
    const field = issue.path.length > 0 ? issue.path.join('.') : '_root';
    if (!(field in errors)) {
      errors[field] = issue.message;
    }
  }
  return errors;
}

function validationError(error: z.ZodError): NextResponse {
  return errorResponse('Validation failed', 'VALIDATION_ERROR', 400, formatFieldErrors(error));
}

export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (request: Request | NextRequest): Promise<ValidationResult<T>> => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return {
        success: false,
        error: errorResponse('Invalid JSON body', 'VALIDATION_ERROR', 400),
      };
    }

    const result = schema.safeParse(body);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: validationError(result.error) };
  };
}

export function searchParamsToObject(searchParams: URLSearchParams): RouteParams {
  const params: RouteParams = {};
  searchParams.forEach((value, key) => {
    if (value === '') return;
    const existing = params[key];
    if (existing === undefined) {
      params[key] = value;
    } else if (Array.isArray(existing)) {
      existing.push(value);
    } else {
      params[key] = [existing, value];
    }
  });
  return params;
}

export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (request: Request | NextRequest): ValidationResult<T> => {
    const { searchParams } = new URL(request.url);
    const result = schema.safeParse(searchParamsToObject(searchParams));
    if (result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: validationError(result.error) };
  };
}

export function validateParams<T>(schema: z.ZodSchema<T>) {
  return async (params: RouteParams | Promise<RouteParams>): Promise<ValidationResult<T>> => {
    const resolved = await params;
    const result = schema.safeParse(resolved);
    if (result.success) {
      return { success: true, data: result.data };
    }
    return { success: false, error: validationError(result.error) };
  };
}

export const paginationSchema = z.object({
  page: z.coerce.number().int('Page must be an integer').min(1, 'Page must be at least 1').default(1),
  limit: z.coerce
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must be at most 100')
    .default(20),
});

export const idSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const searchSchema = z.object({
  search: z.string().max(200, 'Search query must be at most 200 characters').optional(),
});
