import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호를 입력해주세요" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 6자 이상이어야 합니다" },
        { status: 400 }
      );
    }

    const supabase = await createClient();



    // 회원가입만 수행 (자동 로그인 제거)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        data: {
          email_confirmed: true,
        },
      },
    });



    if (error) {
      if (error.message.includes("User already registered")) {
        return NextResponse.json(
          { error: "이미 가입된 이메일입니다. 로그인을 해주세요." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: error.message || "회원가입에 실패했습니다" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "회원가입이 완료되었습니다. 로그인해주세요.",
      user: data.user,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "회원가입 처리 중 오류가 발생했습니다: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
