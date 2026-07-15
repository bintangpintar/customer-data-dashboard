import { NextRequest, NextResponse } from 'next/server';

// In-memory leads store (session-based)
const leadsStore = new Map<string, any>();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const phoneNumber = searchParams.get('phone');

  if (phoneNumber) {
    const lead = leadsStore.get(phoneNumber);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    return NextResponse.json({ lead });
  }

  const leads = Array.from(leadsStore.values());
  return NextResponse.json({ leads, total: leads.length });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { phoneNumber, customerData, status, notes } = body;

  if (!phoneNumber) {
    return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
  }

  const newLead = {
    phoneNumber,
    status: status || 'contacted',
    notes: notes || (customerData ? `Auto-tagged: ${customerData.nama}` : 'Auto-tagged lead'),
    createdAt: new Date().toISOString(),
  };

  leadsStore.set(phoneNumber, newLead);

  return NextResponse.json({ success: true, lead: newLead });
}
