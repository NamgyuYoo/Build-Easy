import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
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

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (projectError) {
      console.error("Project fetch error:", projectError);
      return NextResponse.json(
        { error: "프로젝트 조회 중 오류가 발생했습니다" },
        { status: 500 }
      );
    }

    if (!project) {
      return NextResponse.json(
        { error: "프로젝트를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // Get current month's labor logs
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const lastDayNum = new Date(year, now.getMonth() + 1, 0).getDate();
    const firstDay = `${year}-${month}-01`;
    const lastDay = `${year}-${month}-${String(lastDayNum).padStart(2, "0")}`;

    const { data: laborLogs, error: logsError } = await supabase
      .from("labor_logs")
      .select("*, workers(*)")
      .eq("project_id", id)
      .gte("work_date", firstDay)
      .lte("work_date", lastDay);

    if (logsError) {
      console.error("Labor logs fetch error:", logsError);
      return NextResponse.json(
        { error: "노무 기록 조회 중 오류가 발생했습니다" },
        { status: 500 }
      );
    }

    // Generate CSV
    const headers = [
      "성명",
      "주민번호(앞자리)",
      "근무일수",
      "총 공수",
      "일당",
      "총 지급액",
    ];

    // Group by worker
    const workerMap = new Map();
    (laborLogs || []).forEach((log: any) => {
      const workerId = log.worker_id;
      if (!workerMap.has(workerId)) {
        workerMap.set(workerId, {
          name: log.workers?.name || "",
          residentNumber: log.workers?.resident_number || "",
          dailyWage: log.workers?.daily_wage || 0,
          fullDays: 0,
          halfDays: 0,
        });
      }
      const data = workerMap.get(workerId);
      if (log.status === "full") {
        data.fullDays += 1;
      } else {
        data.halfDays += 1;
      }
    });

    const rows = Array.from(workerMap.values()).map((data) => {
      const totalDays = data.fullDays + data.halfDays;
      const totalManDays = data.fullDays + data.halfDays * 0.5;
      const totalPay = totalManDays * data.dailyWage;

      return [
        data.name,
        data.residentNumber,
        totalDays.toString(),
        totalManDays.toFixed(1),
        data.dailyWage.toLocaleString(),
        Math.round(totalPay).toLocaleString(),
      ];
    });

    // Convert to CSV
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create UTF-8 BOM for Excel compatibility with Korean
    const bom = "\uFEFF";
    const csvWithBom = bom + csvContent;

    // 파일명 생성 (한글은 URL 인코딩)
    const safeProjectName = (project.name || "project").replace(/[^a-zA-Z0-9가-힣_\-]/g, "_");
    const fileName = `labor_log_${safeProjectName}_${year}${month}.csv`;
    const encodedFileName = encodeURIComponent(fileName);

    return new NextResponse(csvWithBom, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        // RFC 5987 형식으로 한글 파일명 지원
        "Content-Disposition": `attachment; filename="labor_log_${year}${month}.csv"; filename*=UTF-8''${encodedFileName}`,
      },
    });
  } catch (error) {
    console.error("CSV Export error:", error);
    return NextResponse.json(
      { error: "노무비 대장 내보내기 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
