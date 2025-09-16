// Bypass auth API route - returns empty session since auth is disabled
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Return empty session response to prevent client-side auth errors
  return NextResponse.json({
    user: null,
    session: null,
  });
}

export async function POST(request: NextRequest) {
  // Return empty session response for any auth requests
  return NextResponse.json({
    user: null,
    session: null,
  });
}