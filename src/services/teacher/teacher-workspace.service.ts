import prisma from '@/lib/prisma';
import type {
  Classroom,
  ClassroomEnrollment,
  ClassroomResource,
  ClassroomWithStats,
  StudentDataAccess,
  TeacherWorkspaceDashboard,
  ResourceType,
} from '@/types/education-student';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

export class TeacherWorkspaceService {
  async createClassroom(teacherId: string, data: {
    name: string;
    subject: string;
    grade?: string;
    description?: string;
  }): Promise<ClassroomWithStats> {
    let inviteCode = generateInviteCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.classroom.findUnique({ where: { inviteCode } });
      if (!existing) break;
      inviteCode = generateInviteCode();
      attempts++;
    }

    const classroom = await prisma.classroom.create({
      data: {
        teacherId,
        name: data.name,
        subject: data.subject,
        grade: data.grade || null,
        description: data.description || null,
        inviteCode,
      },
      include: {
        enrollments: { where: { status: 'active' } },
        resources: true,
      },
    });

    return this.formatClassroomWithStats(classroom);
  }

  async getClassrooms(teacherId: string): Promise<Classroom[]> {
    const classrooms = await prisma.classroom.findMany({
      where: { teacherId, isActive: true },
      include: {
        _count: { select: { enrollments: { where: { status: 'active' } }, resources: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return classrooms.map(c => ({
      id: c.id,
      teacherId: c.teacherId,
      name: c.name,
      subject: c.subject,
      grade: c.grade || undefined,
      description: c.description || undefined,
      inviteCode: c.inviteCode,
      isActive: c.isActive,
      enrolledStudents: c._count.enrollments,
      resourceCount: c._count.resources,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  async getClassroomById(classroomId: string, teacherId: string): Promise<ClassroomWithStats | null> {
    const classroom = await prisma.classroom.findFirst({
      where: { id: classroomId, teacherId },
      include: {
        enrollments: { include: { student: { select: { id: true, name: true, email: true } } } },
        resources: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!classroom) return null;
    return this.formatClassroomWithStats(classroom);
  }

  async updateClassroom(classroomId: string, teacherId: string, data: {
    name?: string;
    description?: string;
    grade?: string;
    isActive?: boolean;
  }): Promise<Classroom> {
    const classroom = await prisma.classroom.findFirst({ where: { id: classroomId, teacherId } });
    if (!classroom) throw new Error('Classroom not found');

    const updated = await prisma.classroom.update({ where: { id: classroomId }, data });
    return {
      id: updated.id,
      teacherId: updated.teacherId,
      name: updated.name,
      subject: updated.subject,
      grade: updated.grade || undefined,
      description: updated.description || undefined,
      inviteCode: updated.inviteCode,
      isActive: updated.isActive,
      enrolledStudents: 0,
      resourceCount: 0,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async deleteClassroom(classroomId: string, teacherId: string): Promise<boolean> {
    const classroom = await prisma.classroom.findFirst({ where: { id: classroomId, teacherId } });
    if (!classroom) return false;
    await prisma.classroom.delete({ where: { id: classroomId } });
    return true;
  }

  async joinClassroom(studentId: string, inviteCode: string): Promise<ClassroomEnrollment> {
    const classroom = await prisma.classroom.findUnique({ where: { inviteCode } });
    if (!classroom || !classroom.isActive) throw new Error('Invalid or inactive classroom code');

    const existing = await prisma.classroomEnrollment.findFirst({
      where: { classroomId: classroom.id, studentId },
    });
    if (existing) {
      if (existing.status === 'active') throw new Error('Already enrolled in this classroom');
      const updated = await prisma.classroomEnrollment.update({
        where: { id: existing.id },
        data: { status: 'active' },
      });
      return this.formatEnrollment(updated);
    }

    const enrollment = await prisma.classroomEnrollment.create({
      data: { classroomId: classroom.id, studentId },
    });
    return this.formatEnrollment(enrollment);
  }

  async removeStudent(classroomId: string, studentId: string, teacherId: string): Promise<boolean> {
    const classroom = await prisma.classroom.findFirst({ where: { id: classroomId, teacherId } });
    if (!classroom) return false;

    const enrollment = await prisma.classroomEnrollment.findFirst({
      where: { classroomId, studentId },
    });
    if (!enrollment) return false;

    await prisma.classroomEnrollment.update({
      where: { id: enrollment.id },
      data: { status: 'inactive' },
    });
    return true;
  }

  async getEnrolledStudents(classroomId: string, teacherId: string): Promise<ClassroomEnrollment[]> {
    const classroom = await prisma.classroom.findFirst({ where: { id: classroomId, teacherId } });
    if (!classroom) return [];

    const enrollments = await prisma.classroomEnrollment.findMany({
      where: { classroomId, status: 'active' },
      include: { student: { select: { id: true, name: true, email: true } } },
      orderBy: { joinedAt: 'asc' },
    });

    return enrollments.map(e => ({
      id: e.id,
      classroomId: e.classroomId,
      studentId: e.studentId,
      studentName: (e.student as Record<string, unknown>).name ? String((e.student as Record<string, unknown>).name) : undefined,
      studentEmail: (e.student as Record<string, unknown>).email ? String((e.student as Record<string, unknown>).email) : undefined,
      status: e.status as ClassroomEnrollment['status'],
      joinedAt: e.joinedAt,
      updatedAt: e.updatedAt,
    }));
  }

  async getStudentData(studentId: string, classroomId: string, teacherId: string): Promise<StudentDataAccess | null> {
    const classroom = await prisma.classroom.findFirst({ where: { id: classroomId, teacherId } });
    if (!classroom) return null;

    const enrollment = await prisma.classroomEnrollment.findFirst({
      where: { classroomId, studentId, status: 'active' },
    });
    if (!enrollment) return null;

    const student = await prisma.user.findUnique({ where: { id: studentId }, select: { id: true, name: true, email: true } });
    if (!student) return null;

    const [topics, quizzes, sessions] = await Promise.all([
      prisma.studyTopic.findMany({ where: { userId: studentId } }),
      prisma.practiceQuiz.findMany({ where: { userId: studentId }, orderBy: { studiedAt: 'desc' }, take: 10 }),
      prisma.studySession.findMany({ where: { userId: studentId } }),
    ]);

    const overallMastery = topics.length ? Math.round(topics.reduce((s, t) => s + t.masteryLevel, 0) / topics.length) : 0;
    const totalStudyMinutes = sessions.reduce((s, sess) => s + sess.durationMin, 0);

    return {
      studentId: student.id,
      studentName: student.name || 'Unknown',
      studyTopics: topics.map(t => ({ subject: t.subject, topic: t.topic, masteryLevel: t.masteryLevel })),
      recentQuizzes: quizzes.map(q => ({ subject: q.subject, topic: q.topic, score: q.percentage, date: q.studiedAt })),
      overallMastery,
      totalStudyMinutes,
    };
  }

  async addResource(classroomId: string, teacherId: string, data: {
    title: string;
    description?: string;
    resourceType: ResourceType;
    url?: string;
    content?: Record<string, unknown>;
  }): Promise<ClassroomResource> {
    const classroom = await prisma.classroom.findFirst({ where: { id: classroomId, teacherId } });
    if (!classroom) throw new Error('Classroom not found');

    const resource = await prisma.classroomResource.create({
      data: {
        classroomId,
        title: data.title,
        description: data.description || null,
        resourceType: data.resourceType,
        url: data.url || null,
        contentJson: data.content ? JSON.stringify(data.content) : null,
        uploadedBy: teacherId,
      },
    });

    return this.formatResource(resource);
  }

  async getResources(classroomId: string, teacherId: string): Promise<ClassroomResource[]> {
    const classroom = await prisma.classroom.findFirst({ where: { id: classroomId, teacherId } });
    if (!classroom) return [];

    const resources = await prisma.classroomResource.findMany({
      where: { classroomId },
      orderBy: { createdAt: 'desc' },
    });

    return resources.map(r => this.formatResource(r));
  }

  async deleteResource(resourceId: string, teacherId: string): Promise<boolean> {
    const resource = await prisma.classroomResource.findFirst({ where: { id: resourceId, uploadedBy: teacherId } });
    if (!resource) return false;
    await prisma.classroomResource.delete({ where: { id: resourceId } });
    return true;
  }

  async getWorkspaceDashboard(teacherId: string): Promise<TeacherWorkspaceDashboard> {
    const [classrooms, enrollments, resources] = await Promise.all([
      prisma.classroom.findMany({
        where: { teacherId, isActive: true },
        include: { _count: { select: { enrollments: { where: { status: 'active' } }, resources: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.classroomEnrollment.findMany({
        where: { classroom: { teacherId }, status: 'active' },
      }),
      prisma.classroomResource.findMany({
        where: { classroom: { teacherId } },
      }),
    ]);

    const allClassrooms = await prisma.classroom.count({ where: { teacherId, isActive: true } });
    const activeClassrooms = allClassrooms;

    return {
      totalClassrooms: allClassrooms,
      activeClassrooms,
      totalStudents: enrollments.length,
      totalResources: resources.length,
      recentClassrooms: classrooms.map(c => ({
        id: c.id,
        teacherId: c.teacherId,
        name: c.name,
        subject: c.subject,
        grade: c.grade || undefined,
        description: c.description || undefined,
        inviteCode: c.inviteCode,
        isActive: c.isActive,
        enrolledStudents: c._count.enrollments,
        resourceCount: c._count.resources,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    };
  }

  private formatClassroomWithStats(classroom: Record<string, unknown>): ClassroomWithStats {
    const enrollments = (classroom.enrollments as Record<string, unknown>[]) || [];
    const resources = (classroom.resources as Record<string, unknown>[]) || [];
    return {
      id: String(classroom.id),
      teacherId: String(classroom.teacherId),
      name: String(classroom.name),
      subject: String(classroom.subject),
      grade: classroom.grade ? String(classroom.grade) : undefined,
      description: classroom.description ? String(classroom.description) : undefined,
      inviteCode: String(classroom.inviteCode),
      isActive: Boolean(classroom.isActive),
      enrolledStudents: enrollments.length,
      resourceCount: resources.length,
      enrollments: enrollments.map(e => {
        const student = e.student as Record<string, unknown> | undefined;
        return {
          id: String(e.id),
          classroomId: String(e.classroomId),
          studentId: String(e.studentId),
          studentName: student?.name ? String(student.name) : undefined,
          studentEmail: student?.email ? String(student.email) : undefined,
          status: String(e.status) as ClassroomEnrollment['status'],
          joinedAt: new Date(e.joinedAt as Date | string),
          updatedAt: new Date(e.updatedAt as Date | string),
        };
      }),
      resources: resources.map(r => this.formatResource(r as Record<string, unknown>)),
      createdAt: new Date(classroom.createdAt as Date | string),
      updatedAt: new Date(classroom.updatedAt as Date | string),
    };
  }

  private formatEnrollment(e: Record<string, unknown>): ClassroomEnrollment {
    return {
      id: String(e.id),
      classroomId: String(e.classroomId),
      studentId: String(e.studentId),
      status: String(e.status) as ClassroomEnrollment['status'],
      joinedAt: new Date(e.joinedAt as Date | string),
      updatedAt: new Date(e.updatedAt as Date | string),
    };
  }

  private formatResource(r: Record<string, unknown>): ClassroomResource {
    return {
      id: String(r.id),
      classroomId: String(r.classroomId),
      title: String(r.title),
      description: r.description ? String(r.description) : undefined,
      resourceType: String(r.resourceType) as ResourceType,
      url: r.url ? String(r.url) : undefined,
      content: r.contentJson ? JSON.parse(String(r.contentJson)) : undefined,
      uploadedBy: String(r.uploadedBy),
      createdAt: new Date(r.createdAt as Date | string),
    };
  }
}

export const teacherWorkspaceService = new TeacherWorkspaceService();
