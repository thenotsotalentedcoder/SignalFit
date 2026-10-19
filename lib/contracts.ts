import { z } from 'zod';
export const answerSchema = z.object({ field:z.string().min(1), value:z.string().max(3000), skipped:z.boolean().optional() });
export const profileSchema = z.object({ summary:z.string(), services:z.array(z.string()), capabilities:z.array(z.string()), evidence:z.array(z.string()), customers:z.string(), buyerRoles:z.array(z.string()), differentiators:z.array(z.string()), preferences:z.string(), constraints:z.array(z.string()), unknowns:z.array(z.string()), searchCriteria:z.array(z.string()) });
export type Profile = z.infer<typeof profileSchema>;
export const questions = [
 {field:'identity', title:'What is your business called, and where do you operate?', hint:'Include a website if you have one.'},
 {field:'services', title:'What services do you offer today?', hint:'Name the work you can confidently deliver.'},
 {field:'customers', title:'Who do you most want to help?', hint:'Industry, company size, or buyer type are useful.'},
 {field:'proof', title:'What past project or outcome best proves this work?', hint:'Say “I don’t know” if you have no public proof yet.'},
 {field:'delivery', title:'How do you prefer to deliver and price projects?', hint:'Solo or team, fixed scope or ongoing, and a rough size.'},
 {field:'constraints', title:'What work, clients, locations, or timelines do you want to avoid?', hint:'Skipping is okay.'}
];
export function nextQuestion(answers:Record<string,string>) { return questions.find(q=>answers[q.field]===undefined) ?? null; }
