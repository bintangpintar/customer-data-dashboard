import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Data is managed in-memory by React state
  return NextResponse.json({ data: [] });
}
