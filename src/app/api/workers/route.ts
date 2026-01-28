import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const workerSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  daily_wage: z.number().positive("일당은 0보다 커야 합니다"),
  phone: z.string().nullable().optional(),
  resident_number: z.string().nullable().optional(),
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
    const validated = workerSchema.parse(body);

    const { data, error } = await supabase
      .from("workers")
      .insert({
        user_id: user.id,
        name: validated.name,
        daily_wage: validated.daily_wage,
        phone: validated.phone,
        resident_number: validated.resident_number,
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

    return NextResponse.json({ success: true, worker: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "작업자 등록 중 오류가 발생했습니다" },
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
      .from("workers")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, workers: data });
  } catch (error) {
    return NextResponse.json(
      { error: "작업자 목록 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
