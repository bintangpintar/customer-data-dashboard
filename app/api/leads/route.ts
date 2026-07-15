import { NextRequest, NextResponse } from 'next/server';
import { addLead, getLeads } from '@/lib/supabase';

// GET all leads or specific lead
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const phoneNumber = searchParams.get('phone');

    const leads = await getLeads();

    if (phoneNumber) {
      const lead = leads.find((l: any) => l.phone === phoneNumber);
      if (!lead) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }
      return NextResponse.json({ lead });
    }

    return NextResponse.json({ leads, total: leads.length });
  } catch (error) {
    console.error('[v0] Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

// POST create or add lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, customerData, status, notes } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number required' },
        { status: 400 }
      );
    }

    // Create new lead entry
    const leadData = {
      customer_id: phoneNumber, // Using phone as customer identifier
      status: status || 'contacted',
      notes: notes || (customerData ? `Auto-tagged: ${customerData.nama}` : 'Auto-tagged lead'),
    };

    const newLead = await addLead(leadData);

    if (!newLead) {
      return NextResponse.json(
        { error: 'Failed to create lead' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      lead: newLead,
    });
  } catch (error) {
    console.error('[v0] Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}

// PUT update lead status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, status, notes } = body;

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID required' },
        { status: 400 }
      );
    }

    // Note: Supabase update would go here
    // For now, returning success with the intent to update
    return NextResponse.json({
      success: true,
      message: 'Lead update received',
    });
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
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID required' },
        { status: 400 }
      );
    }

    // Note: Supabase delete would go here
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}
