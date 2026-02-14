// /api/admin/flush-cache — One-time cache flush for stale pre-scraper data
// Protected by ADMIN_SECRET env var
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  // Simple secret-based auth for admin endpoints
  const authHeader = request.headers.get('authorization');
  const adminSecret = process.env.ADMIN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!authHeader || authHeader !== `Bearer ${adminSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();

    const { error, count } = await supabase
      .from('search_cache')
      .delete()
      .neq('query_hash', '');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Flushed all cache entries`,
      deletedCount: count,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
