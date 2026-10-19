import { GoogleGenAI } from '@google/genai';
import { profileSchema, type Profile } from './contracts';
const fallback = (answers:Record<string,string>): Profile => ({ summary:answers.identity||'Business profile needs confirmation.', services:(answers.services||'').split(',').map(x=>x.trim()).filter(Boolean), capabilities:[], evidence:answers.proof?[answers.proof]:[], customers:answers.customers||'Unknown — confirm before research.', buyerRoles:[], differentiators:[], preferences:answers.delivery||'Unknown', constraints:answers.constraints?[answers.constraints]:[], unknowns:['Specific capabilities and buyer roles need confirmation.'], searchCriteria:[] });
export async function synthesize(answers:Record<string,string>) {
 if (!process.env.GEMINI_API_KEY) return fallback(answers);
 const ai = new GoogleGenAI({ apiKey:process.env.GEMINI_API_KEY });
 const prompt = `Create an honest SignalFit business profile from these user statements. Never invent facts; use Unknown or needs confirmation. Return JSON only matching this shape: summary string, services string[], capabilities string[], evidence string[], customers string, buyerRoles string[], differentiators string[], preferences string, constraints string[], unknowns string[], searchCriteria string[]. Statements: ${JSON.stringify(answers)}`;
 let text=''; for(let attempt=0; attempt<2; attempt++) { const r=await ai.models.generateContent({model:process.env.GEMINI_MODEL||'gemini-3.8-flash',contents:prompt,config:{responseMimeType:'application/json'}}); text=r.text||''; try{return profileSchema.parse(JSON.parse(text));} catch { if(attempt===1) throw new Error('Gemini returned an invalid profile. Your saved answers are safe; retry.'); } }
 throw new Error('Profile generation failed');
}
