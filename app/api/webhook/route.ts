import { NextRequest, NextResponse } from 'next/server';

export interface WebhookPayload {
  event: 'message.sent' | 'message.failed' | 'message.ack';
  deviceId?: string;
  msgId?: string;
  to?: string;
  from?: string;
  messageType?: string;
  body?: string;
  status?: string;
  error?: string;
  errorCode?: string;
  timestamp: number;
  clientMsgId?: string;
}

// POST endpoint for webhook
export async function POST(request: NextRequest) {
  try {
    const payload: WebhookPayload = await request.json();

    // Normalize phone number (remove @s.whatsapp.net or similar)
    let phoneNumber = (payload.to || payload.from || '').replace('@s.whatsapp.net', '').trim();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number not found in payload' },
        { status: 400 }
      );
    }

    // Ensure phone number format consistency
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }

    // Map event to status
    let eventStatus = 'pending';
    if (payload.event === 'message.sent') {
      eventStatus = 'contacted';
    } else if (payload.event === 'message.failed') {
      eventStatus = 'failed';
    } else if (payload.event === 'message.ack') {
      eventStatus = payload.status === 'read' ? 'read' : 'delivered';
    }

    // Create or update lead with webhook event
    const leadUpdateData = {
      phoneNumber,
      status: eventStatus,
      webhookEvent: {
        event: payload.event,
        status: eventStatus,
        timestamp: payload.timestamp,
        message: payload.body || payload.error || '',
      },
    };

    // Update lead via leads API
    const updateResponse = await fetch(`${request.nextUrl.origin}/api/leads`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadUpdateData),
      cache: 'no-store',
    });

    console.log('[v0] Webhook processed:', {
      event: payload.event,
      phoneNumber,
      status: eventStatus,
    });

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      leadStatus: eventStatus,
    });
  } catch (error) {
    console.error('[v0] Webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
