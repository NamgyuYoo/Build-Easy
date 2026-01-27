import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');

  if (token) {
    const supabase = await createClient();

    await supabase.auth.setSession({
      access_token: token,
      refresh_token: refreshToken || '',
    });
  }

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
