import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';

const defaultChecklists: Record<string, { label: string; category: string }[]> = {
  university: [
    { label: 'Research universities and programs', category: 'research' },
    { label: 'Check admission eligibility', category: 'research' },
    { label: 'Review program requirements', category: 'research' },
    { label: 'Prepare academic transcripts', category: 'documents' },
    { label: 'Take language proficiency test', category: 'documents' },
    { label: 'Complete standardized tests (GRE/GMAT)', category: 'documents' },
    { label: 'Write statement of purpose', category: 'documents' },
    { label: 'Request recommendation letters', category: 'documents' },
    { label: 'Update CV/resume', category: 'documents' },
    { label: 'Prepare portfolio (if required)', category: 'documents' },
    { label: 'Submit application form', category: 'submission' },
    { label: 'Pay application fee', category: 'submission' },
    { label: 'Apply for scholarships', category: 'financial' },
    { label: 'Prepare proof of financial support', category: 'financial' },
    { label: 'Arrange accommodation', category: 'logistics' },
    { label: 'Apply for student visa', category: 'visa' },
    { label: 'Get health insurance', category: 'logistics' },
    { label: 'Book travel arrangements', category: 'logistics' },
  ],
  scholarship: [
    { label: 'Research scholarship criteria', category: 'research' },
    { label: 'Check eligibility requirements', category: 'research' },
    { label: 'Prepare academic transcripts', category: 'documents' },
    { label: 'Write personal statement', category: 'documents' },
    { label: 'Request recommendation letters', category: 'documents' },
    { label: 'Prepare research proposal (if required)', category: 'documents' },
    { label: 'Update CV/resume', category: 'documents' },
    { label: 'Gather financial documents', category: 'documents' },
    { label: 'Submit scholarship application', category: 'submission' },
    { label: 'Follow up on application status', category: 'submission' },
    { label: 'Prepare for interview (if required)', category: 'submission' },
  ],
  course: [
    { label: 'Research course details and curriculum', category: 'research' },
    { label: 'Check prerequisites', category: 'research' },
    { label: 'Review institution accreditation', category: 'research' },
    { label: 'Prepare required documents', category: 'documents' },
    { label: 'Take prerequisite assessments', category: 'documents' },
    { label: 'Submit enrollment application', category: 'submission' },
    { label: 'Arrange payment/financial aid', category: 'financial' },
    { label: 'Set up learning environment', category: 'logistics' },
  ],
};

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType') || 'university';

    if (!['university', 'scholarship', 'course'].includes(entityType)) {
      return errorResponse('entityType must be university, scholarship, or course', 'VALIDATION_ERROR', 400);
    }

    const defaults = defaultChecklists[entityType] || defaultChecklists.university;

    return successResponse({
      entityType,
      items: defaults.map((item, index) => ({
        label: item.label,
        category: item.category,
        order: index,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return errorResponse(message, 'FETCH_DEFAULTS_FAILED', 500);
  }
}
