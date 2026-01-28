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
