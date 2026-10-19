import { z } from 'zod';

export const answerSchema = z.object({ field: z.string().min(1), value: z.string().max(3000), skipped: z.boolean().optional() });
export const profileSchema = z.object({
  summary: z.string(), services: z.array(z.string()), capabilities: z.array(z.string()), evidence: z.array(z.string()),
  customers: z.string(), buyerRoles: z.array(z.string()), differentiators: z.array(z.string()), preferences: z.string(),
  constraints: z.array(z.string()), unknowns: z.array(z.string()), searchCriteria: z.array(z.string()),
  status: z.enum(['complete','incomplete_draft']).optional(), source: z.enum(['gemini','deterministic']).optional()
});
export type Profile = z.infer<typeof profileSchema>;
export type Question = { field:string; stage:string; title:string; hint:string; optional?:boolean; choices?:string[] };
export const questions: Question[] = [
 {field:'identity',stage:'Business basics',title:'What is your business called?',hint:'Add your location, markets served, and website if available.'},
 {field:'businessType',stage:'Business basics',title:'What kind of business are you?',hint:'For example: solo consultant, freelancer, or small agency.'},
 {field:'services',stage:'Services',title:'What services do you offer today?',hint:'List work you can confidently deliver.'},
 {field:'capabilities',stage:'Services',title:'What are your strongest capabilities?',hint:'Choose or describe the tools, methods, and outcomes you know well.'},
 {field:'customers',stage:'Best-fit customers',title:'Who do you most want to help?',hint:'Include preferred industries, company size, and buyer roles.'},
 {field:'proof',stage:'Proof and differentiation',title:'What past project or outcome best proves this work?',hint:'Include measurable results if known. “I don’t know” is okay.',optional:true},
 {field:'differentiation',stage:'Proof and differentiation',title:'What makes your approach different?',hint:'A clear user statement is better than a marketing claim.',optional:true},
 {field:'delivery',stage:'Constraints',title:'How do you prefer to deliver and price projects?',hint:'Solo or team, fixed scope or ongoing, and a rough project size.'},
 {field:'constraints',stage:'Constraints',title:'What work, clients, locations, or timelines do you want to avoid?',hint:'Skip this if you have no exclusions yet.',optional:true}
];
export const stages = ['Business basics','Services','Best-fit customers','Proof and differentiation','Constraints','Review'];
export function nextQuestion(answers: Record<string,string>) { return questions.find(q => answers[q.field] === undefined) ?? null; }
export function questionsForAnswers(answers: Record<string,string>) { return questions.filter(q => !(q.field === 'proof' && /no proof|none/i.test(answers.services ?? ''))); }
export function nextVisibleQuestion(answers: Record<string,string>) { return questionsForAnswers(answers).find(q => answers[q.field] === undefined) ?? null; }
