import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';

export async function GET() {
    try {
        await connectToDatabase();
        return NextResponse.json({ status: 'success', message: 'MongoDB Connected Successfully' });
    } catch (error: any) {
        console.error('MongoDB Connection Error:', error);
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
