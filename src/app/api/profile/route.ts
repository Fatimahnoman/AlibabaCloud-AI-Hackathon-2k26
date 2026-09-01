import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { authService } from '@/services/auth/auth.service';
import { requireAuth, getClientInfo } from '@/lib/auth-middleware';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  country: z.string().max(100).optional(),
  preferredLanguage: z.enum(['auto', 'english', 'roman_urdu', 'urdu']).optional(),
});

const updateProfileDetailsSchema = z.object({
  bio: z.string().max(500).optional(),
  dateOfBirth: z.string().optional(),
  phone: z.string().max(20).optional(),
  educationLevel: z.string().max(100).optional(),
  occupation: z.string().max(100).optional(),
  timezone: z.string().max(50).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const user = await authService.getCurrentUser(authResult.user.userId);
    if (!user) {
      return errorResponse('User not found', 'USER_NOT_FOUND', 404);
    }

    return successResponse({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get profile';
    return errorResponse(message, 'INTERNAL_ERROR', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const body = await request.json();
    
    // Try user fields first, then profile details
    const userValidation = updateProfileSchema.safeParse(body);
    const profileValidation = updateProfileDetailsSchema.safeParse(body);

    const context = getClientInfo(request);
    const results: Record<string, unknown> = {};

    if (userValidation.success && Object.keys(userValidation.data).length > 0) {
      const updatedUser = await authService.updateProfile(authResult.user.userId, userValidation.data, context);
      results.user = updatedUser;
    }

    if (profileValidation.success && Object.keys(profileValidation.data).length > 0) {
      const updatedProfile = await authService.updateProfileDetails(authResult.user.userId, profileValidation.data, context);
      results.profile = updatedProfile;
    }

    if (Object.keys(results).length === 0) {
      return errorResponse('No valid fields to update', 'VALIDATION_ERROR', 400);
    }

    return successResponse(results);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return errorResponse(message, 'UPDATE_FAILED', 400);
  }
}
