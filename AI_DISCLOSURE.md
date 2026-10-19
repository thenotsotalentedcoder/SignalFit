# AI disclosure

SignalFit's planned application provider is Google Gemini (server-only, configured through GEMINI_API_KEY and GEMINI_MODEL) through the official `@google/genai` SDK. The API key remains server-only. Profile synthesis uses the configured Gemini model through `@google/genai`; JSON output is validated with Zod and retried once on invalid output. If no key is configured, the app creates an explicitly incomplete, deterministic draft from user statements rather than claiming an AI result.

This Phase 2 implementation was built with AI-assisted development (Kimi, as requested in the project brief). UI uses original project code and standard Next.js, React, Tailwind CSS, PostgreSQL, bcryptjs, otplib and Zod dependencies under their respective licenses. No Supabase SDK or older project code is used.
