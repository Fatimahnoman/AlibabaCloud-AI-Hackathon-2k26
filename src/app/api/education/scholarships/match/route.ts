import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { successResponse, errorResponse } from '@/lib/utils';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if ('error' in auth) return auth.error;
    const userId = auth.user.userId;

    // Get user profile for matching
    const [user, profile] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { country: true } }),
      prisma.profile.findUnique({ where: { userId }, select: { educationLevel: true } }),
    ]);

    const userCountry = user?.country || 'Pakistan';
    const educationLevel = profile?.educationLevel || '';

    // Get all active scholarships (deadline in future)
    const now = new Date();
    const scholarships = await prisma.scholarship.findMany({
      where: {
        deadline: { gte: now },
      },
      include: { requirements: true },
      orderBy: { deadline: 'asc' },
    });

    // Score each scholarship based on user profile
    const scored = scholarships.map((scholarship) => {
      let matchScore = 0;
      let matchReasons: string[] = [];
      let isEligible = true;

      // Country match
      if (scholarship.country) {
        if (scholarship.country.toLowerCase() === userCountry.toLowerCase()) {
          matchScore += 30;
          matchReasons.push(`Available in ${userCountry}`);
        } else if (scholarship.country.toLowerCase() === 'international' || scholarship.country.toLowerCase() === 'all') {
          matchScore += 20;
          matchReasons.push('International scholarship');
        }
      }

      // Category match with education level
      if (scholarship.category && educationLevel) {
        const cat = scholarship.category.toLowerCase();
        const level = educationLevel.toLowerCase();
        if (cat.includes(level) || level.includes(cat)) {
          matchScore += 25;
          matchReasons.push(`Matches your education level: ${educationLevel}`);
        }
      }

      // Check requirements
      for (const req of scholarship.requirements) {
        const type = req.requirementType.toLowerCase();
        const value = req.requirementValue.toLowerCase();

        if (type === 'nationality' && userCountry) {
          if (value.includes(userCountry.toLowerCase())) {
            matchScore += 15;
            matchReasons.push(`Matches nationality: ${userCountry}`);
          } else if (!value.includes('international') && !value.includes('all')) {
            isEligible = false;
            matchReasons.push(`Nationality restriction: ${req.requirementValue}`);
          }
        }

        if (type === 'education_level' || type === 'degree') {
          if (educationLevel && value.includes(educationLevel.toLowerCase())) {
            matchScore += 15;
            matchReasons.push(`Matches degree: ${educationLevel}`);
          }
        }

        if (type === 'province' && value.includes('all')) {
          matchScore += 5;
          matchReasons.push('Open to all provinces');
        }
      }

      // Deadline urgency bonus
      const daysUntil = scholarship.deadline
        ? Math.ceil((scholarship.deadline.getTime() - now.getTime()) / 86400000)
        : 999;
      if (daysUntil <= 14) {
        matchScore += 10;
        matchReasons.push(`Deadline in ${daysUntil} days - apply soon!`);
      }

      // Amount bonus
      if (scholarship.amount && Number(scholarship.amount) > 0) {
        matchScore += 5;
        matchReasons.push(`Amount: ${scholarship.currency || 'PKR'} ${Number(scholarship.amount).toLocaleString()}`);
      }

      return {
        ...scholarship,
        matchScore: Math.min(100, matchScore),
        matchReasons,
        isEligible,
        daysUntilDeadline: daysUntil,
      };
    });

    // Sort by match score (highest first)
    const matched = scored
      .filter((s) => s.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20);

    return successResponse({
      matches: matched.map((s) => ({
        id: s.id,
        name: s.name,
        provider: s.provider,
        country: s.country,
        category: s.category,
        deadline: s.deadline,
        amount: s.amount ? Number(s.amount) : null,
        currency: s.currency,
        matchScore: s.matchScore,
        matchReasons: s.matchReasons,
        isEligible: s.isEligible,
        daysUntilDeadline: s.daysUntilDeadline,
      })),
      total: matched.length,
      userProfile: { country: userCountry, educationLevel },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Scholarship matching failed';
    return errorResponse(message, 'MATCH_FAILED', 500);
  }
}
