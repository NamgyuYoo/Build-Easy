import { NextRequest, NextResponse } from "next/server";
import Tesseract from "tesseract.js";

export const dynamic = "force-dynamic";

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

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log("Starting OCR with Tesseract.js...");

    // Perform OCR with Korean and English language support
    const result = await Tesseract.recognize(buffer, "kor+eng", {
      logger: (m: any) => {
        if (m.status === "recognizing text") {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    console.log("OCR complete. Extracting structured data...");

    const text = result.data.text;
    console.log("Extracted text:", text);

    // Parse extracted text to get structured data
    const extracted = parseReceiptText(text);

    return NextResponse.json({
      success: true,
      extracted,
    });
  } catch (error) {
    console.error("OCR Error:", error);

    return NextResponse.json(
      {
        error: "OCR 처리 중 오류가 발생했습니다",
        details: error instanceof Error ? error.message : String(error),
        extracted: {},
      },
      { status: 500 }
    );
  }
}

/**
 * Parse receipt text to extract structured data
 */
function parseReceiptText(text: string) {
  const lines = text.split("\n").filter((line) => line.trim());

  let amount = "";
  let vendorName = "";
  let date = "";
  let category = "other";

  // Extract vendor name (usually first non-empty line)
  for (const line of lines) {
    const cleaned = line.trim();
    if (cleaned && cleaned.length > 2 && !cleaned.match(/^\d/)) {
      vendorName = cleaned.substring(0, 50); // Limit length
      break;
    }
  }

  // Extract date (YYYY-MM-DD, YYYY/MM/DD, or YY.MM.DD format)
  const datePatterns = [
    /(\d{4})[-./](\d{1,2})[-./](\d{1,2})/, // YYYY-MM-DD
    /(\d{2})[-./](\d{1,2})[-./](\d{1,2})/, // YY-MM-DD
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      const year = match[1].length === 2 ? "20" + match[1] : match[1];
      const month = match[2].padStart(2, "0");
      const day = match[3].padStart(2, "0");
      date = `${year}-${month}-${day}`;
      break;
    }
  }

  // Extract amount (look for numbers with commas, "원", "won", etc.)
  const amountPatterns = [
    /(?:합계|총액|금액|AMOUNT)[:\s]*([₩$]?\s*[\d,]+(?:\.\d{2})?)/i,
    /([₩$]?\s*[\d,]+(?:\.\d{2})?)\s*(?:원|won)/i,
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/, // General number format
  ];

  for (const pattern of amountPatterns) {
    const matches = text.matchAll(new RegExp(pattern.source, pattern.flags.includes("g") ? "g" : ""));
    for (const match of matches) {
      const amountStr = match[1] || match[0];
      // Clean up the amount string
      const cleanAmount = amountStr.replace(/[^\d.]/g, "");
      if (cleanAmount && parseFloat(cleanAmount) > 0) {
        amount = cleanAmount;
        break;
      }
    }
    if (amount) break;
  }

  // Detect category based on keywords
  const textLower = text.toLowerCase();

  if (textLower.includes("주유") || textLower.includes("기름") || textLower.includes("휘발유") || textLower.includes("경유") || textLower.includes("주유소")) {
    category = "fuel"; // 유류
  } else if (textLower.includes("식") || textLower.includes("밥") || textLower.includes("커피") || textLower.includes("카페") || textLower.includes("맛집") || textLower.includes("식당")) {
    category = "food"; // 식대
  } else if (textLower.includes("자재") || textLower.includes("재료") || textLower.includes("철물") || textLower.includes("목재") || textLower.includes("시멘트")) {
    category = "material"; // 자재
  } else if (textLower.includes("인건") || textLower.includes("임금") || textLower.includes("노무") || textLower.includes("일당")) {
    category = "labor"; // 인건비
  }

  return {
    amount,
    vendor_name: vendorName,
    date,
    category,
  };
}
