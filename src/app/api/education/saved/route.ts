import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { requireAuth } from '@/lib/auth-middleware';
import { savedItemsService } from '@/services/education';

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const userId = authResult.user.userId;

    const [savedCourses, savedUniversities, savedScholarships] = await Promise.all([
      savedItemsService.getSavedCourses(userId),
      savedItemsService.getSavedUniversities(userId),
      savedItemsService.getSavedScholarships(userId),
    ]);

    return successResponse({
      courses: savedCourses,
      universities: savedUniversities,
      scholarships: savedScholarships,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get saved items';
    return errorResponse(message, 'SAVED_ITEMS_FETCH_FAILED', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const userId = authResult.user.userId;
    const body = await request.json();
    const { type, itemId, notes } = body;

    if (!type || !itemId) {
      return errorResponse(
        'type and itemId are required',
        'VALIDATION_ERROR',
        400,
      );
    }

    if (!['course', 'university', 'scholarship'].includes(type)) {
      return errorResponse(
        'type must be one of: course, university, scholarship',
        'VALIDATION_ERROR',
        400,
      );
    }

    let saved;
    switch (type) {
      case 'course':
        saved = await savedItemsService.saveCourse(userId, itemId, notes);
        break;
      case 'university':
        saved = await savedItemsService.saveUniversity(userId, itemId, notes);
        break;
      case 'scholarship':
        saved = await savedItemsService.saveScholarship(userId, itemId, notes);
        break;
    }

    return successResponse({ saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save item';
    if (message.includes('already saved')) {
      return errorResponse(message, 'ALREADY_SAVED', 409);
    }
    return errorResponse(message, 'SAVE_FAILED', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const userId = authResult.user.userId;
    const body = await request.json();
    const { type, itemId } = body;

    if (!type || !itemId) {
      return errorResponse(
        'type and itemId are required',
        'VALIDATION_ERROR',
        400,
      );
    }

    if (!['course', 'university', 'scholarship'].includes(type)) {
      return errorResponse(
        'type must be one of: course, university, scholarship',
        'VALIDATION_ERROR',
        400,
      );
    }

    switch (type) {
      case 'course':
        await savedItemsService.unsaveCourse(userId, itemId);
        break;
      case 'university':
        await savedItemsService.unsaveUniversity(userId, itemId);
        break;
      case 'scholarship':
        await savedItemsService.unsaveScholarship(userId, itemId);
        break;
    }

    return successResponse({ message: 'Item removed from saved list' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to unsave item';
    if (message.includes('not saved')) {
      return errorResponse(message, 'NOT_SAVED', 404);
    }
    return errorResponse(message, 'UNSAVE_FAILED', 500);
  }
}
