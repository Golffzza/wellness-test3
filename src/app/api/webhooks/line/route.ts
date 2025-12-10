// ==========================================
// 📌 API: /api/webhooks/line
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import { lineClient } from '@/lib/line';
import { bookingService } from '@/services';
import type { WebhookEvent, TextMessage, MessageEvent } from '@line/bot-sdk';
import crypto from 'crypto';

function verifySignature(body: string, signature: string): boolean {
  const channelSecret = process.env.LINE_CHANNEL_SECRET || '';
  const hash = crypto.createHmac('SHA256', channelSecret).update(body).digest('base64');
  return hash === signature;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-line-signature') || '';

    if (process.env.NODE_ENV === 'production' && !verifySignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(body);
    const events: WebhookEvent[] = data.events || [];

    for (const event of events) {
      await handleEvent(event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('LINE webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleEvent(event: WebhookEvent) {
  if (event.type !== 'message' || event.message.type !== 'text') return;

  const messageEvent = event as MessageEvent;
  const userId = messageEvent.source.userId;
  if (!userId) return;

  const text = (event.message as { text: string }).text.toLowerCase();
  const liffUrl = `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}`;

  if (text.includes('จอง') || text.includes('booking')) {
    await lineClient.pushMessage(userId, { type: 'text', text: `📅 จองคิวให้คำปรึกษา\n\nคลิกลิงก์:\n${liffUrl}` });
  } else if (text.includes('ตาราง') || text.includes('นัด')) {
    const booking = await bookingService.getUserActiveBooking(userId);
    if (booking) {
      await lineClient.pushMessage(userId, {
        type: 'text',
        text: `📋 การจองของคุณ\n\n📅 วันที่: ${booking.date}\n🕐 เวลา: ${booking.startTime} - ${booking.endTime}\n📝 สถานะ: ${booking.status}`,
      });
    } else {
      await lineClient.pushMessage(userId, { type: 'text', text: '📭 คุณไม่มีการจองที่กำลังดำเนินการ\n\nพิมพ์ "จอง" เพื่อจองคิวใหม่' });
    }
  } else if (text.includes('help') || text.includes('ช่วย')) {
    await lineClient.pushMessage(userId, {
      type: 'text',
      text: `💚 NU Wellness Center\n\nคำสั่ง:\n• "จอง" - จองคิวให้คำปรึกษา\n• "ตาราง" - ดูการจองของคุณ\n• "help" - ดูคำสั่งทั้งหมด`,
    });
  }
}