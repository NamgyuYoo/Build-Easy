import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const projectSchema = z.object({
  name: z.string().min(1, "현장명을 입력해주세요"),
  budget: z.number().min(0).optional().default(0),
  start_date: z.string().nullable().optional(),
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
    const validated = projectSchema.parse(body);

    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name: validated.name,
        budget: validated.budget,
        start_date: validated.start_date,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, project: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "프로젝트 생성 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "인증되지 않았습니다" },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        expenses(amount, category),
        labor_logs(id, worker_id, status)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, projects: data });
  } catch (error) {
    return NextResponse.json(
      { error: "프로젝트 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
