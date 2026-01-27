import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "인증되지 않았습니다" },
        { status: 401 }
      );
    }

    // Verify project ownership
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: "프로젝트를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // Fetch labor logs with worker details
    const { data: laborLogs, error } = await supabase
      .from("labor_logs")
      .select("*, workers(*)")
      .eq("project_id", id)
      .order("work_date", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, laborLogs });
  } catch (error) {
    console.error("Labor logs fetch error:", error);
    return NextResponse.json(
      { error: "노무 기록 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
