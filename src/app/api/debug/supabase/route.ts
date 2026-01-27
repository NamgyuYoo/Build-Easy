import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Test connection
    const { data, error } = await supabase
      .from('projects')
      .select('count')
      .limit(1);

    return NextResponse.json({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...",
      configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      connectionTest: error ? error.message : 'success',
      sampleQuery: data
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...",
      configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    }, { status: 500 });
  }
}
