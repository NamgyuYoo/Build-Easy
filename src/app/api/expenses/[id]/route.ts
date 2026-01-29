import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateExpenseSchema = z.object({
    amount: z.number().positive().optional(),
    category: z.enum(["material", "labor", "food", "fuel", "other"]).optional(),
    vendor_name: z.string().optional(),
    expense_date: z.string().optional(),
    description: z.string().optional(),
});

// PUT: 지출 수정
export async function PUT(
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

        // Validate body
        const body = await request.json();
        const validated = updateExpenseSchema.parse(body);

        // Check ownership
        const { data: expense } = await supabase
            .from("expenses")
            .select(`
        id,
        project_id,
        projects!inner ( user_id )
      `)
            .eq("id", id)
            .eq("projects.user_id", user.id)
            .single();

        if (!expense) {
            return NextResponse.json(
                { error: "지출 내역을 찾을 수 없거나 권한이 없습니다" },
                { status: 404 }
            );
        }

        // Update expense
        const { data: updated, error } = await supabase
            .from("expenses")
            .update(validated)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true, expense: updated });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "지출 수정 중 오류가 발생했습니다" },
            { status: 500 }
        );
    }
}

// DELETE: 지출 삭제
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

        // Check ownership by querying the expense joined with project
        const { data: expense } = await supabase
            .from("expenses")
            .select(`
        id,
        project_id,
        projects!inner ( user_id )
      `)
            .eq("id", id)
            .eq("projects.user_id", user.id)
            .single();

        if (!expense) {
            return NextResponse.json(
                { error: "지출 내역을 찾을 수 없거나 권한이 없습니다" },
                { status: 404 }
            );
        }

        const { error } = await supabase
            .from("expenses")
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
            { error: "지출 내역 삭제 중 오류가 발생했습니다" },
            { status: 500 }
        );
    }
}
