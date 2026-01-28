import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const expenseSchema = z.object({
  project_id: z.string().uuid().optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  category: z.enum(["material", "food", "fuel", "labor", "other"]),
  amount: z.number().positive(),
  vendor_name: z.string().optional(),
  expense_date: z.string(),
  description: z.string().optional(),
});

// GET - Fetch expenses for a project
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

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("project_id");

    if (!projectId) {
      return NextResponse.json(
        { error: "프로젝트 ID가 필요합니다" },
        { status: 400 }
      );
    }

    // Verify project ownership
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: "프로젝트를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // Fetch expenses for this project
    const { data: expenses, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("project_id", projectId)
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, expenses });
  } catch (error) {
    return NextResponse.json(
      { error: "지출 내역 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

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
    const validated = expenseSchema.parse(body);

    // If no project specified, get or create a default project
    let projectId = validated.project_id;
    if (!projectId) {
      const { data: projects } = await supabase
        .from("projects")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!projects || projects.length === 0) {
        // Create default project
        const { data: newProject } = await supabase
          .from("projects")
          .insert({ user_id: user.id, name: "미분류" })
          .select("id")
          .single();
        projectId = newProject?.id;
      } else {
        projectId = projects[0].id;
      }
    }

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        project_id: projectId,
        image_url: validated.image_url || null,
        category: validated.category,
        amount: validated.amount,
        vendor_name: validated.vendor_name || null,
        expense_date: validated.expense_date,
        description: validated.description || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, expense: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "지출 등록 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
