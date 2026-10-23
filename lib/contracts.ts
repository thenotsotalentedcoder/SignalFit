import { z } from 'zod';

export const answerSchema = z.object({ field: z.string().min(1), value: z.string().max(3000), skipped: z.boolean().optional() });
export const profileSchema = z.object({
  summary: z.string(), services: z.array(z.string()), capabilities: z.array(z.string()), evidence: z.array(z.string()),
  customers: z.string(), buyerRoles: z.array(z.string()), differentiators: z.array(z.string()), preferences: z.string(),
  constraints: z.array(z.string()), unknowns: z.array(z.string()), searchCriteria: z.array(z.string()),
  status: z.enum(['complete','incomplete_draft']).optional(), source: z.enum(['gemini','deterministic']).optional(),
  inspected: z.array(z.object({ url: z.string(), status: z.enum(['inspected','unavailable']), excerpt: z.string() })).optional()
});
export type Profile = z.infer<typeof profileSchema>;
import { coreQuestions, nextStep, stages as interviewStages, visibleCore, type Question } from './interview';
export type { Question };
export const questions: Question[] = coreQuestions;
export const stages = interviewStages;
export function nextVisibleQuestion(answers: Record<string,string>) { const s = nextStep(answers); return s.kind === 'question' ? s.question : null; }
export const questionsForAnswers = visibleCore;
