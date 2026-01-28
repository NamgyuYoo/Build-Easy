import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "파일이 없습니다" },
        { status: 400 }
      );
    }

    // Initialize OpenAI client with API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API 키가 설정되지 않았습니다" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");
    const mimeType = file.type;
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    // Use GPT-4o Vision to extract receipt data
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `이 영수증에서 다음 정보를 추출해주세요:
1. 총 금액 (amount) - 숫자만, 콤마 없이
2. 거래처명 (vendor_name) - 상점 이름
3. 날짜 (date) - YYYY-MM-DD 형식
4. 카테고리 (category) - 다음 중 하나: material(자재), food(식사/음식), fuel(주유), labor(인건비), other(기타)

JSON 형식으로 응답해주세요. 확실하지 않은 정보는 null로 반환하세요.`,
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("AI 응답 파싱 실패");
    }

    const extracted = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      extracted: {
        amount: extracted.amount || "",
        vendor_name: extracted.vendor_name || "",
        date: extracted.date || "",
        category: extracted.category || "other",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "OCR 처리 중 오류가 발생했습니다",
        extracted: {},
      },
      { status: 500 }
    );
  }
}
