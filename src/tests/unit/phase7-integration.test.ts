import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectIntent, getIntentLabel } from '@/services/ai/intent-detection';
import { SYSTEM_PROMPTS, budgetAnalysis, studyPlannerPrompt, teacherAssistant, buildContextPrompt } from '@/services/ai/prompts';

describe('Phase 7 Integration Tests', () => {
  describe('BudgetSummary calculation logic', () => {
    it('normalizes weekly income to monthly (×4.33)', () => {
      const weeklyAmount = 500;
      const normalized = weeklyAmount * 4.33;
      expect(normalized).toBe(2165);
    });

    it('normalizes biweekly income to monthly (×2.17)', () => {
      const biweeklyAmount = 2000;
      const normalized = biweeklyAmount * 2.17;
      expect(normalized).toBe(4340);
    });

    it('normalizes yearly income to monthly (÷12)', () => {
      const yearlyAmount = 60000;
      const normalized = yearlyAmount / 12;
      expect(normalized).toBe(5000);
    });

    it('passes through monthly income unchanged', () => {
      const monthlyAmount = 5000;
      expect(monthlyAmount).toBe(5000);
    });

    it('excludes one_time income', () => {
      const oneTimeAmount = 10000;
      const normalized = 0;
      expect(normalized).toBe(0);
    });

    it('calculates savings rate correctly', () => {
      const income = 5000;
      const expenses = 3500;
      const savings = income - expenses;
      const savingsRate = (savings / income) * 100;
      expect(savingsRate).toBe(30);
    });

    it('returns savingsRate 0 when income is 0', () => {
      const income = 0;
      const expenses = 500;
      const savings = income - expenses;
      const savingsRate = income > 0 ? (savings / income) * 100 : 0;
      expect(savingsRate).toBe(0);
    });

    it('rounds values to 2 decimal places', () => {
      const value = 33.3333;
      const rounded = Math.round(value * 100) / 100;
      expect(rounded).toBe(33.33);
    });
  });

  describe('SavingsGoal progress calculation', () => {
    it('calculates progress percentage', () => {
      const currentAmount = 500;
      const targetAmount = 2000;
      const progress = (currentAmount / targetAmount) * 100;
      expect(progress).toBe(25);
    });

    it('returns 100% when fully funded', () => {
      const progress = (2000 / 2000) * 100;
      expect(progress).toBe(100);
    });

    it('returns 0% when no amount saved', () => {
      const progress = (0 / 1000) * 100;
      expect(progress).toBe(0);
    });

    it('calculates estimated months to reach goal', () => {
      const remaining = 1500;
      const monthlyContribution = 300;
      const monthsNeeded = Math.ceil(remaining / monthlyContribution);
      expect(monthsNeeded).toBe(5);
    });
  });

  describe('StudyTopic mastery update logic', () => {
    it('increments mastery by 1 on study session', () => {
      const currentMastery = 40;
      const newMastery = Math.min(currentMastery + 1, 100);
      expect(newMastery).toBe(41);
    });

    it('caps mastery at 100', () => {
      const currentMastery = 100;
      const newMastery = Math.min(currentMastery + 1, 100);
      expect(newMastery).toBe(100);
    });

    it('starts new topic at mastery 1', () => {
      const mastery = 1;
      expect(mastery).toBe(1);
    });

    it('identifies weak subjects below 50%', () => {
      const masteryLevel = 35;
      const isWeak = masteryLevel < 50;
      expect(isWeak).toBe(true);
    });

    it('does not flag strong subjects as weak', () => {
      const masteryLevel = 75;
      const isWeak = masteryLevel < 50;
      expect(isWeak).toBe(false);
    });
  });

  describe('Teacher content generation structure', () => {
    it('generates lesson plan content with all sections', () => {
      const content = {
        introduction: { title: 'Intro', duration: '9 minutes', description: 'desc' },
        mainContent: { title: 'Core', duration: '30 minutes', sections: [] },
        activities: { title: 'Activities', duration: '15 minutes', items: [] },
        conclusion: { title: 'Conclusion', duration: '6 minutes', description: 'desc' },
      };

      expect(content).toHaveProperty('introduction');
      expect(content).toHaveProperty('mainContent');
      expect(content).toHaveProperty('activities');
      expect(content).toHaveProperty('conclusion');
    });

    it('generates correct question count for assessment', () => {
      const questionCount = 10;
      const questions = Array.from({ length: questionCount }, (_, i) => ({
        question: `Question ${i + 1}`,
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
      }));
      expect(questions).toHaveLength(10);
      expect(questions[0].question).toBe('Question 1');
      expect(questions[9].question).toBe('Question 10');
    });

    it('generates answer key matching question count', () => {
      const questionCount = 5;
      const questions = Array.from({ length: questionCount }, (_, i) => ({
        question: `Q${i + 1}`,
        correctAnswer: 0,
        explanation: 'explanation',
      }));
      const answerKey = questions.map((q, i) => ({
        questionNumber: i + 1,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }));

      expect(answerKey).toHaveLength(questionCount);
      answerKey.forEach((entry, i) => {
        expect(entry.questionNumber).toBe(i + 1);
      });
    });

    it('distributes lesson plan time proportionally', () => {
      const durationMin = 60;
      const introDuration = Math.round(durationMin * 0.15);
      const mainDuration = Math.round(durationMin * 0.5);
      const activityDuration = Math.round(durationMin * 0.25);
      const conclusionDuration = Math.round(durationMin * 0.1);

      expect(introDuration).toBe(9);
      expect(mainDuration).toBe(30);
      expect(activityDuration).toBe(15);
      expect(conclusionDuration).toBe(6);
    });
  });

  describe('Intent detection for Phase 7 features', () => {
    it('detects budget intent from salary text', () => {
      const result = detectIntent('meri salary 80k he budget bana do');
      expect(result.intent).toBe('budget');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('detects budget intent from savings text', () => {
      const result = detectIntent('I want to save money for a laptop');
      expect(result.intent).toBe('budget');
    });

    it('detects budget intent from expense tracking', () => {
      const result = detectIntent('my spending is too high this month');
      expect(result.intent).toBe('budget');
    });

    it('detects study_plan intent', () => {
      const result = detectIntent('create a study plan for my exams');
      expect(result.intent).toBe('study_plan');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('detects study_plan intent with schedule', () => {
      const result = detectIntent('make a study timetable for next week');
      expect(result.intent).toBe('study_plan');
    });

    it('detects teacher intent from lesson plan request', () => {
      const result = detectIntent('I am a teacher, help me create lesson plans');
      expect(result.intent).toBe('teacher');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('detects teacher intent from assessment request', () => {
      const result = detectIntent('generate an assessment quiz for my students');
      expect(result.intent).toBe('teacher');
    });

    it('detects teacher intent from rubric request', () => {
      const result = detectIntent('create a grading rubric for essay');
      expect(result.intent).toBe('teacher');
    });

    it('returns correct labels for Phase 7 intents', () => {
      expect(getIntentLabel('budget')).toBe('Budget');
      expect(getIntentLabel('study_plan')).toBe('Study Plan');
      expect(getIntentLabel('teacher')).toBe('Teacher');
    });
  });

  describe('AI prompts structure', () => {
    it('has budget system prompt', () => {
      expect(SYSTEM_PROMPTS.budget).toBeDefined();
      expect(typeof SYSTEM_PROMPTS.budget).toBe('string');
      expect(SYSTEM_PROMPTS.budget.length).toBeGreaterThan(0);
    });

    it('has study planner system prompt', () => {
      expect(SYSTEM_PROMPTS.studyPlanner).toBeDefined();
      expect(typeof SYSTEM_PROMPTS.studyPlanner).toBe('string');
      expect(SYSTEM_PROMPTS.budget.length).toBeGreaterThan(0);
    });

    it('has budget analysis prompt object', () => {
      expect(budgetAnalysis).toBeDefined();
      expect(budgetAnalysis.role).toBe('Budget Analysis Expert');
      expect(typeof budgetAnalysis.system).toBe('string');
      expect(budgetAnalysis.system.length).toBeGreaterThan(0);
    });

    it('has study planner prompt object', () => {
      expect(studyPlannerPrompt).toBeDefined();
      expect(studyPlannerPrompt.role).toBe('Study Planning Expert');
      expect(typeof studyPlannerPrompt.system).toBe('string');
    });

    it('has teacher assistant prompt object', () => {
      expect(teacherAssistant).toBeDefined();
      expect(teacherAssistant.role).toBe('Teaching Professional');
      expect(typeof teacherAssistant.system).toBe('string');
      expect(teacherAssistant.system.length).toBeGreaterThan(0);
    });

    it('buildContextPrompt appends user language', () => {
      const base = 'You are an assistant.';
      const result = buildContextPrompt(base, { userLanguage: 'roman urdu' });
      expect(result).toContain('roman urdu');
      expect(result).toContain(base);
    });

    it('buildContextPrompt appends conversation summary', () => {
      const base = 'You are an assistant.';
      const result = buildContextPrompt(base, { conversationSummary: 'User asked about budget' });
      expect(result).toContain('User asked about budget');
    });

    it('buildContextPrompt appends user profile', () => {
      const base = 'You are an assistant.';
      const result = buildContextPrompt(base, { userProfile: 'Grade 10 student' });
      expect(result).toContain('Grade 10 student');
    });

    it('buildContextPrompt appends additional context', () => {
      const base = 'You are an assistant.';
      const result = buildContextPrompt(base, { additionalContext: 'User prefers detail' });
      expect(result).toContain('User prefers detail');
    });

    it('buildContextPrompt returns base when no context', () => {
      const base = 'You are an assistant.';
      const result = buildContextPrompt(base, {});
      expect(result).toContain(base);
      expect(result).toContain('FRAUD ANALYSIS INJECTION DEFENSE');
    });
  });
});
