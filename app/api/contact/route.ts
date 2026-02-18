// /api/contact — Store contact form submissions
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!subject || typeof subject !== 'string') {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Validate subject is one of the allowed values
    const validSubjects = ['general', 'bug', 'feature', 'billing'];
    if (!validSubjects.includes(subject)) {
      return NextResponse.json({ error: 'Invalid subject' }, { status: 400 });
    }

    // Store in Supabase using service client (bypasses RLS)
    const service = createServiceClient();
    const { error } = await service
      .from('contact_messages')
      .insert({
        name: name.trim().slice(0, 100),
        email: email.trim().slice(0, 200),
        subject,
        message: message.trim().slice(0, 5000),
      });

    if (error) {
      console.error('[Contact] Insert error:', error);
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
    }

    // TODO: Send notification email via Resend when API key is configured
    // const RESEND_API_KEY = process.env.RESEND_API_KEY;
    // if (RESEND_API_KEY) {
    //   await fetch('https://api.resend.com/emails', {
    //     method: 'POST',
    //     headers: {
    //       'Authorization': `Bearer ${RESEND_API_KEY}`,
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       from: 'SellChecker <noreply@sellchecker.app>',
    //       to: 'hello@sellchecker.app',
    //       subject: `[Contact] ${subject} from ${name}`,
    //       text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
    //     }),
    //   });
    // }

    console.log(`[Contact] New message from ${email} — subject: ${subject}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Contact] Error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
