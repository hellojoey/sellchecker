// /api/profile — GET/PATCH user profile settings
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const serviceClient = createServiceClient();
    const { data: profile, error } = await serviceClient
      .from('profiles')
      .select('id, email, display_name, plan, shipping_zip, default_weight_category, searches_today, created_at')
      .eq('id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { display_name, shipping_zip, default_weight_category } = body;

    // Validate
    const updates: Record<string, any> = {};
    if (display_name !== undefined) {
      updates.display_name = (display_name || '').slice(0, 100);
    }
    if (shipping_zip !== undefined) {
      updates.shipping_zip = (shipping_zip || '').slice(0, 10);
    }
    if (default_weight_category !== undefined) {
      const wc = parseInt(default_weight_category);
      if (!isNaN(wc) && wc >= 0 && wc <= 3) {
        updates.default_weight_category = wc;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const serviceClient = createServiceClient();
    const { data: profile, error } = await serviceClient
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select('id, email, display_name, plan, shipping_zip, default_weight_category')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
