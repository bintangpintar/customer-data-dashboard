import { NextRequest, NextResponse } from 'next/server';

// In-memory leads storage (in production, use a database)
const leadsStore = new Map<
  string,
  {
    phoneNumber: string;
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'cancel' | 'contacted';
    events: any[];
    lastEvent: string;
    lastEventTime: number;
    customerData?: any;
  }
>();

// GET all leads or specific lead
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

// POST create or add lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, customerData } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number required' },
        { status: 400 }
      );
    }

    // Create new lead if doesn't exist
    if (!leadsStore.has(phoneNumber)) {
      leadsStore.set(phoneNumber, {
        phoneNumber,
        status: 'pending',
        events: [],
        lastEvent: 'created',
        lastEventTime: Math.floor(Date.now() / 1000),
        customerData: customerData || {},
      });
    } else if (customerData) {
      // Update customer data if provided
      const lead = leadsStore.get(phoneNumber)!;
      lead.customerData = customerData;
    }

    return NextResponse.json({
      success: true,
      lead: leadsStore.get(phoneNumber),
    });
  } catch (error) {
    console.error('[v0] Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}

// PUT update lead status or webhook event
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, status, customerData, webhookEvent } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number required' },
        { status: 400 }
      );
    }

    let lead = leadsStore.get(phoneNumber);

    if (!lead) {
      // Create new lead if doesn't exist
      lead = {
        phoneNumber,
        status: status || 'pending',
        events: [],
        lastEvent: 'created',
        lastEventTime: Math.floor(Date.now() / 1000),
        customerData: customerData || {},
      };
      leadsStore.set(phoneNumber, lead);
    } else {
      // Update existing lead
      if (status) lead.status = status;
      if (customerData) lead.customerData = customerData;
      lead.lastEventTime = Math.floor(Date.now() / 1000);
    }

    // Handle webhook event
    if (webhookEvent) {
      if (!lead.events) lead.events = [];
      lead.events.push(webhookEvent);
      lead.lastEvent = webhookEvent.event;
      lead.lastEventTime = webhookEvent.timestamp || Math.floor(Date.now() / 1000);

      // Keep only last 10 events
      if (lead.events.length > 10) {
        lead.events = lead.events.slice(-10);
      }
    }

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error('[v0] Error updating lead:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

// DELETE remove lead
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number required' },
        { status: 400 }
      );
    }

    leadsStore.delete(phoneNumber);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}
