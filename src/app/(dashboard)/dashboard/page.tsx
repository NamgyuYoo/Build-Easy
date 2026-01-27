import { createClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, HardHat, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch projects
  const { data: projects } = await supabase
    .from("projects")
    .select(`
      *,
      expenses(amount, category),
      labor_logs(
        id,
        status,
        worker_id,
        workers(id, daily_wage)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Build-Easy</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Link href="/api/auth/logout">
            <Button variant="outline" size="sm">로그아웃</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/projects/new">
            <Button className="w-full h-16 text-lg" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              새 현장
            </Button>
          </Link>
          <Link href="/expenses/new">
            <Button variant="outline" className="w-full h-16 text-lg" size="lg">
              <Plus className="mr-2 h-5 w-5" />
              영수증 등록
            </Button>
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center">
            <CardContent className="pt-4">
              <HardHat className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{projects?.length || 0}</p>
              <p className="text-xs text-muted-foreground">진행 중</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-4">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">
                {projects?.reduce((sum, p) => sum + (p.budget || 0), 0).toLocaleString()}원
              </p>
              <p className="text-xs text-muted-foreground">총 예산</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-4">
              <TrendingDown className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-bold">
                {projects?.reduce((sum, p) => {
                  const expenses = p.expenses?.reduce((s: number, e: any) => s + (e.amount || 0), 0) || 0;
                  const laborCost = p.labor_logs?.reduce((s: number, log: any) => {
                    const wage = log.workers?.daily_wage || 0;
                    return s + (log.status === "full" ? wage : wage * 0.5);
                  }, 0) || 0;
                  return sum + expenses + laborCost;
                }, 0).toLocaleString()}원
              </p>
              <p className="text-xs text-muted-foreground">총 지출</p>
            </CardContent>
          </Card>
        </div>

        {/* Projects List */}
        <div>
          <h2 className="text-lg font-bold mb-3">진행 중인 현장</h2>
          <div className="space-y-3">
            {projects && projects.length > 0 ? (
              projects.map((project: any) => {
                const expenses = project.expenses?.reduce((sum: number, e: any) => sum + (e.amount || 0), 0) || 0;
                const laborCost = project.labor_logs?.reduce((sum: number, log: any) => {
                  const wage = log.workers?.daily_wage || 0;
                  return sum + (log.status === "full" ? wage : wage * 0.5);
                }, 0) || 0;
                const totalExpenses = expenses + laborCost;
                const budgetUsed = project.budget ? (totalExpenses / project.budget) * 100 : 0;
                const isOverBudget = budgetUsed > 80;

                return (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <Card className={`hover:shadow-md transition-shadow ${isOverBudget ? "border-orange-300" : ""}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          {isOverBudget && (
                            <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">예산 대비 지출</span>
                          <span className={`font-semibold ${isOverBudget ? "text-orange-600" : ""}`}>
                            {budgetUsed.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              isOverBudget ? "bg-orange-500" : "bg-blue-600"
                            }`}
                            style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm pt-1">
                          <span>{totalExpenses.toLocaleString()}원</span>
                          <span className="text-muted-foreground">/ {project.budget?.toLocaleString()}원</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <HardHat className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">등록된 현장이 없습니다</p>
                  <Link href="/projects/new">
                    <Button size="lg" className="h-14">
                      <Plus className="mr-2" />
                      첫 현장 등록하기
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
