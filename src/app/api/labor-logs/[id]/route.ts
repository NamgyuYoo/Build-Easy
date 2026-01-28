import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
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

    // Verify ownership through project
    const { data: laborLog } = await supabase
      .from("labor_logs")
      .select("project_id, projects(user_id)")
      .eq("id", id)
      .single();

    if (!laborLog || (laborLog as any).projects?.user_id !== user.id) {
      return NextResponse.json(
        { error: "노무 기록을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from("labor_logs")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "노무 기록 삭제 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
