import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const laborLogSchema = z.object({
  project_id: z.string().uuid(),
  worker_id: z.string().uuid(),
  work_date: z.string(),
  status: z.enum(["full", "half"]),
  notes: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "인증되지 않았습니다" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = laborLogSchema.parse(body);

    // Verify project ownership
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", validated.project_id)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: "프로젝트를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // Check if log already exists
    const { data: existing } = await supabase
      .from("labor_logs")
      .select("*")
      .eq("project_id", validated.project_id)
      .eq("worker_id", validated.worker_id)
      .eq("work_date", validated.work_date)
      .single();

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from("labor_logs")
        .update({ status: validated.status })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true, laborLog: data });
    }

    // Create new
    const { data, error } = await supabase
      .from("labor_logs")
      .insert({
        project_id: validated.project_id,
        worker_id: validated.worker_id,
        work_date: validated.work_date,
        status: validated.status,
        notes: validated.notes,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, laborLog: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "출근 체크 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
