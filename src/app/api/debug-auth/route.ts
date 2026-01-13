import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
        clientIdLength: process.env.GOOGLE_CLIENT_ID?.length,
        nextauthUrl: process.env.NEXTAUTH_URL,
        hasSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        nodeEnv: process.env.NODE_ENV
    });
}
