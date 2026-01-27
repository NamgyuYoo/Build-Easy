import { createClient } from "@/lib/supabase";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Calendar } from "lucide-react";
import Link from "next/link";

export default async function LaborPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch project
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    notFound();
  }

  // Fetch workers
  const { data: workers } = await supabase
    .from("workers")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  // Fetch labor logs for current month
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const { data: laborLogs } = await supabase
    .from("labor_logs")
    .select("*, workers(*)")
    .eq("project_id", id)
    .gte("work_date", firstDay.toISOString())
    .lte("work_date", lastDay.toISOString());

  // Calculate monthly summary
  let totalFullDays = 0;
  let totalHalfDays = 0;
  let totalLaborCost = 0;

  workers?.forEach((worker: any) => {
    const workerLogs = laborLogs?.filter(
      (log: any) => log.worker_id === worker.id
    ) || [];
    const fullDays = workerLogs.filter((log: any) => log.status === "full").length;
    const halfDays = workerLogs.filter((log: any) => log.status === "half").length;
    const totalDays = fullDays + halfDays * 0.5;
    const workerCost = totalDays * worker.daily_wage;

    totalFullDays += fullDays;
    totalHalfDays += halfDays;
    totalLaborCost += workerCost;
  });

  const totalManDays = totalFullDays + totalHalfDays * 0.5;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href={`/projects/${id}`}>
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">노무 관리</h1>
          </div>
          <Link href={`/api/projects/${id}/labor/export`}>
            <Button size="lg" className="h-12">
              <Download className="mr-2 h-4 w-4" />
              CSV 내보내기
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Monthly Summary */}
        <Card>
          <CardHeader>
            <CardTitle>
              {now.getFullYear()}년 {now.getMonth() + 1}월 노무 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">
                  {workers?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">등록 작업자</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-3xl font-bold text-orange-600">
                  {laborLogs?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">이번 달 출석</p>
              </div>
            </div>
            {/* Total labor cost */}
            <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-800 font-medium">이번 달 총 노무비</p>
                  <p className="text-xs text-orange-700 mt-1">
                    {totalFullDays}일 / {totalHalfDays}반공 = {totalManDays.toFixed(1)}공수
                  </p>
                </div>
                <p className="text-3xl font-bold text-orange-700">
                  {totalLaborCost.toLocaleString()}원
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Action */}
        <Link href={`/projects/${id}/labor/check`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold">출근 체크</h3>
                  <p className="text-sm text-muted-foreground">
                    날짜별 작업자 출근 현황을 관리하세요
                  </p>
                </div>
              </div>
              <span className="text-2xl">→</span>
            </CardContent>
          </Card>
        </Link>

        {/* Workers List with Labor Summary */}
        <Card>
          <CardHeader>
            <CardTitle>작업자별 출근 현황</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {workers && workers.length > 0 ? (
              workers.map((worker: any) => {
                const workerLogs = laborLogs?.filter(
                  (log: any) => log.worker_id === worker.id
                ) || [];
                const fullDays = workerLogs.filter(
                  (log: any) => log.status === "full"
                ).length;
                const halfDays = workerLogs.filter(
                  (log: any) => log.status === "half"
                ).length;
                const totalDays = fullDays + halfDays * 0.5;
                const totalPay = totalDays * worker.daily_wage;

                return (
                  <div
                    key={worker.id}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{worker.name}</h4>
                      <p className="text-orange-600 font-bold">
                        {totalPay.toLocaleString()}원
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        일당: {worker.daily_wage.toLocaleString()}원
                      </span>
                      <span>
                        {fullDays}일 / {halfDays}반공 = {totalDays}공수
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-muted-foreground py-8">
                등록된 작업자가 없습니다
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
