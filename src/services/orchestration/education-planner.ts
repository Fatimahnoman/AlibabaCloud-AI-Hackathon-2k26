import prisma from '@/lib/prisma';
import type { EducationPath, OrchestrationQuery } from './types';

export class EducationPlanner {
  async planEducationPath(query: OrchestrationQuery): Promise<EducationPath> {
    const { country, field, degreeLevel } = query.entities;

    const courseWhere: Record<string, unknown> = {};
    if (field) courseWhere.degree = { contains: field };
    if (degreeLevel) courseWhere.degree = { contains: degreeLevel };
    if (country) courseWhere.university = { country: { contains: country } };

    const courses = await prisma.course.findMany({
      where: courseWhere,
      include: { university: true },
      take: 8,
    });

    const uniWhere: Record<string, unknown> = {};
    if (country) uniWhere.country = { contains: country };

    const universities = await prisma.university.findMany({
      where: uniWhere,
      include: { rankings: true },
      take: 6,
    });

    const scholarshipWhere: Record<string, unknown> = {};
    if (country) scholarshipWhere.country = { contains: country };

    const scholarships = await prisma.scholarship.findMany({
      where: scholarshipWhere,
      include: { requirements: true },
      orderBy: { deadline: 'asc' },
      take: 6,
    });

    const matchedScholarships = scholarships.map(s => {
      const degreeReq = s.requirements.find(r => r.requirementType === 'degree_level');
      const scholarshipDegreeLevel = degreeReq?.requirementValue || 'Any';
      return {
        id: s.id,
        name: s.name,
        provider: s.provider,
        amount: s.amount ? s.amount.toString() : undefined,
        deadline: s.deadline || undefined,
        degreeLevel: scholarshipDegreeLevel,
        matchStrength: this.evaluateScholarshipMatch(s.country, scholarshipDegreeLevel, query) as 'strong' | 'possible' | 'not_eligible',
        verificationStatus: s.verificationStatus,
      };
    });

    const careerWhere: Record<string, unknown> = {};
    if (field) careerWhere.field = { contains: field };

    const careerPaths = await prisma.careerPath.findMany({
      where: careerWhere,
      take: 4,
    });

    return {
      field: field || 'General',
      degreeLevel: degreeLevel || 'Bachelor',
      country: country || 'Any',
      courses: courses.map(c => ({
        id: c.id,
        name: c.name,
        university: c.university.name,
        universityCountry: c.university.country,
        degree: c.degree,
        careerPaths: [],
      })),
      universities: universities.map(u => ({
        id: u.id,
        name: u.name,
        country: u.country,
        type: u.type,
        rankings: u.rankings.map(r => ({ provider: r.provider, position: r.position })),
        verificationStatus: u.verificationStatus,
      })),
      scholarships: matchedScholarships,
      careerPaths: careerPaths.map(cp => ({
        title: cp.title,
        field: cp.field,
        skills: cp.skills ? JSON.parse(cp.skills) : [],
        entryRoles: cp.entryRoles ? JSON.parse(cp.entryRoles) : [],
      })),
    };
  }

  private evaluateScholarshipMatch(scholarshipCountry: string | null, scholarshipDegreeLevel: string, query: OrchestrationQuery): string {
    const { country, degreeLevel } = query.entities;
    let score = 0;
    if (country && scholarshipCountry && scholarshipCountry.toLowerCase().includes(country.toLowerCase())) score++;
    if (degreeLevel && scholarshipDegreeLevel && scholarshipDegreeLevel.toLowerCase().includes(degreeLevel.toLowerCase())) score++;
    if (score >= 2) return 'strong';
    if (score >= 1) return 'possible';
    return 'not_eligible';
  }
}

export const educationPlanner = new EducationPlanner();
