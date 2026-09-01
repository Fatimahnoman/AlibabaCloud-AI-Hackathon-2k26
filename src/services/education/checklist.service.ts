import prisma from '@/lib/prisma';

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  category: string;
  completed: boolean;
}

export class ApplicationChecklistService {
  async createChecklist(
    userId: string,
    title: string,
    universityId?: string,
    scholarshipId?: string,
  ) {
    const defaultItems = this.getDefaultChecklistItems();

    const checklist = await prisma.applicationChecklist.create({
      data: {
        userId,
        title,
        universityId: universityId ?? null,
        scholarshipId: scholarshipId ?? null,
        items: JSON.stringify(defaultItems),
      },
    });

    return {
      ...checklist,
      items: defaultItems,
    };
  }

  async getChecklists(userId: string) {
    const checklists = await prisma.applicationChecklist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return checklists.map((checklist) => ({
      ...checklist,
      items: JSON.parse(checklist.items) as ChecklistItem[],
    }));
  }

  async updateChecklist(
    userId: string,
    checklistId: string,
    items: ChecklistItem[],
  ) {
    const existing = await prisma.applicationChecklist.findFirst({
      where: {
        id: checklistId,
        userId,
      },
    });

    if (!existing) {
      throw new Error(
        `Checklist with id "${checklistId}" not found for this user`,
      );
    }

    const allCompleted = items.every((item) => item.completed);
    const newStatus = allCompleted ? 'completed' : 'in_progress';

    const updated = await prisma.applicationChecklist.update({
      where: { id: checklistId },
      data: {
        items: JSON.stringify(items),
        status: newStatus,
      },
    });

    return {
      ...updated,
      items,
    };
  }

  async deleteChecklist(userId: string, checklistId: string) {
    const existing = await prisma.applicationChecklist.findFirst({
      where: {
        id: checklistId,
        userId,
      },
    });

    if (!existing) {
      throw new Error(
        `Checklist with id "${checklistId}" not found for this user`,
      );
    }

    await prisma.applicationChecklist.delete({
      where: { id: checklistId },
    });
  }

  getDefaultChecklistItems(): ChecklistItem[] {
    return [
      {
        id: 'research-universities',
        label: 'Research universities and programs',
        description:
          'Identify universities that offer your desired program and compare their rankings, fees, and requirements.',
        category: 'research',
        completed: false,
      },
      {
        id: 'check-eligibility',
        label: 'Check admission eligibility',
        description:
          'Review academic requirements, language proficiency, and any prerequisite qualifications.',
        category: 'eligibility',
        completed: false,
      },
      {
        id: 'prepare-transcripts',
        label: 'Prepare academic transcripts',
        description:
          'Obtain official transcripts from all previously attended institutions.',
        category: 'documents',
        completed: false,
      },
      {
        id: 'language-test',
        label: 'Take language proficiency test',
        description:
          'Register for and complete required language tests such as IELTS, TOEFL, or equivalent.',
        category: 'documents',
        completed: false,
      },
      {
        id: 'standardized-tests',
        label: 'Complete standardized tests',
        description:
          'Take required standardized exams such as GRE, GMAT, SAT, or equivalent.',
        category: 'documents',
        completed: false,
      },
      {
        id: 'write-sop',
        label: 'Write statement of purpose',
        description:
          'Draft and refine your personal statement or statement of purpose for each program.',
        category: 'documents',
        completed: false,
      },
      {
        id: 'recommendation-letters',
        label: 'Request recommendation letters',
        description:
          'Contact professors or employers and provide them with sufficient time to write letters.',
        category: 'documents',
        completed: false,
      },
      {
        id: 'update-cv',
        label: 'Update CV/resume',
        description:
          'Prepare an academic or professional CV tailored to your program of interest.',
        category: 'documents',
        completed: false,
      },
      {
        id: 'apply-scholarships',
        label: 'Apply for scholarships',
        description:
          'Research and submit applications for relevant scholarships and financial aid.',
        category: 'financial',
        completed: false,
      },
      {
        id: 'proof-funds',
        label: 'Prepare proof of financial support',
        description:
          'Gather bank statements, sponsorship letters, or scholarship award letters.',
        category: 'financial',
        completed: false,
      },
      {
        id: 'submit-application',
        label: 'Submit application',
        description:
          'Complete and submit your application through the university portal or common application.',
        category: 'submission',
        completed: false,
      },
      {
        id: 'visa-application',
        label: 'Apply for student visa',
        description:
          'Submit visa application with required documents after receiving admission offer.',
        category: 'visa',
        completed: false,
      },
      {
        id: 'accommodation',
        label: 'Arrange accommodation',
        description:
          'Apply for university housing or research off-campus housing options.',
        category: 'logistics',
        completed: false,
      },
      {
        id: 'health-insurance',
        label: 'Get health insurance',
        description:
          'Purchase required health insurance for international students if applicable.',
        category: 'logistics',
        completed: false,
      },
      {
        id: 'travel-arrangements',
        label: 'Book travel arrangements',
        description:
          'Book flights and plan arrival logistics including airport pickup if available.',
        category: 'logistics',
        completed: false,
      },
    ];
  }
}

export const applicationChecklistService = new ApplicationChecklistService();
