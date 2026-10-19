import { NextResponse } from 'next/server';
export function GET() { return NextResponse.json({ status: 'ok', service: 'signalfit', timestamp: new Date().toISOString(), databaseConfigured: Boolean(process.env.DATABASE_URL), aiConfigured: Boolean(process.env.GEMINI_API_KEY) }); }
