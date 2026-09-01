import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/api';
import { recommendationService } from '@/services/education/recommendation.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { field, country, city, degreeLevel, budget, currency, nationality, language, interests, careerGoal } = body;

    if (!field && !country && !city && !degreeLevel && !budget && !careerGoal) {
      return errorResponse(
        'Please provide at least one preference (field, country, city, degree level, budget, or career goal)',
        'MISSING_PREFERENCES',
        400
      );
    }

    const result = await recommendationService.getRecommendations({
      field,
      country,
      city,
      degreeLevel,
      budget: budget ? Number(budget) : undefined,
      currency,
      nationality,
      language,
      interests: Array.isArray(interests) ? interests : undefined,
      careerGoal,
    });

    return successResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate recommendations';
    return errorResponse(message, 'RECOMMENDATION_FAILED', 500);
  }
}
