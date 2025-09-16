// Bypass auth API catch-all route - handles all auth requests
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    // Return empty response for any auth GET requests
    return NextResponse.json({
        user: null,
        session: null,
    });
}

export async function POST(request: NextRequest) {
    // Return empty response for any auth POST requests
    return NextResponse.json({
        user: null,
        session: null,
        success: true,
    });
}

export async function PUT(request: NextRequest) {
    // Return empty response for any auth PUT requests
    return NextResponse.json({
        success: true,
    });
}

export async function DELETE(request: NextRequest) {
    // Return empty response for any auth DELETE requests
    return NextResponse.json({
        success: true,
    });
}