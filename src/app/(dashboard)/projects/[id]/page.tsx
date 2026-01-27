import { createClient } from "@/lib/supabase";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingDown, Users, Receipt } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default async function ProjectDetailPage({
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

  // Fetch project with expenses and labor logs
  const { data: project } = await supabase
    .from("projects")
    .select(`
      *,
      expenses(*),
      labor_logs(
        id,
        status,
        worker_id,
        workers(id, name, daily_wage)
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    notFound();
  }

  // Calculate totals and counts
  const expenses = project.expenses || [];
  const materialExpenses = expenses.filter((e: any) => e.category === "material");
  const foodExpenses = expenses.filter((e: any) => e.category === "food");
  const fuelExpenses = expenses.filter((e: any) => e.category === "fuel");
  const laborExpensesFromReceipts = expenses.filter((e: any) => e.category === "labor");

  const materialAmount = materialExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
  const foodAmount = foodExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
  const fuelAmount = fuelExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
  const laborExpensesAmount = laborExpensesFromReceipts.reduce((sum: number, e: any) => sum + e.amount, 0);
  const laborCostFromLogs = project.labor_logs?.reduce((sum: number, log: any) => {
    const wage = log.workers?.daily_wage || 0;
    return sum + (log.status === "full" ? wage : wage * 0.5);
  }, 0) || 0;
  const totalLaborCost = laborExpensesAmount + laborCostFromLogs;

  const totalExpenses = materialAmount + foodAmount + fuelAmount + totalLaborCost;
  const remainingBudget = project.budget - totalExpenses;
  const budgetPercentage = project.budget ? (totalExpenses / project.budget) * 100 : 0;
  const isOverBudget = budgetPercentage > 80;

  // Category summary data
  const categorySummary = [
    {
      key: "material",
      label: "자재비",
      color: "bg-blue-600",
      bg: "bg-blue-50",
      textColor: "text-blue-700",
      count: materialExpenses.length,
      amount: materialAmount,
      percentage: project.budget ? (materialAmount / project.budget) * 100 : 0,
    },
    {
      key: "labor",
      label: "노무비",
      color: "bg-orange-600",
      bg: "bg-orange-50",
      textColor: "text-orange-700",
      count: laborExpensesFromReceipts.length + (project.labor_logs?.length || 0),
      amount: totalLaborCost,
      percentage: project.budget ? (totalLaborCost / project.budget) * 100 : 0,
    },
    {
      key: "food",
      label: "식대",
      color: "bg-green-600",
      bg: "bg-green-50",
      textColor: "text-green-700",
      count: foodExpenses.length,
      amount: foodAmount,
      percentage: project.budget ? (foodAmount / project.budget) * 100 : 0,
    },
    {
      key: "fuel",
      label: "유류비",
      color: "bg-red-600",
      bg: "bg-red-50",
      textColor: "text-red-700",
      count: fuelExpenses.length,
      amount: fuelAmount,
      percentage: project.budget ? (fuelAmount / project.budget) * 100 : 0,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">{project.name}</h1>
              <p className="text-sm text-muted-foreground">
                {project.start_date && new Date(project.start_date).toLocaleDateString("ko-KR")}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Budget Overview */}
        <Card className={isOverBudget ? "border-orange-300" : ""}>
          <CardHeader>
            <CardTitle>예산 현황</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">총 예산</span>
              <span className="text-2xl font-bold">
                {project.budget?.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">지출 합계</span>
              <span className={`text-2xl font-bold ${isOverBudget ? "text-orange-600" : ""}`}>
                {totalExpenses.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">잔액</span>
              <span className={`text-2xl font-bold ${remainingBudget < 0 ? "text-red-600" : "text-green-600"}`}>
                {remainingBudget.toLocaleString()}원
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${
                  isOverBudget ? "bg-orange-500" : "bg-blue-600"
                }`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {budgetPercentage.toFixed(1)}% 사용
            </p>
          </CardContent>
        </Card>

        {/* Expense Breakdown with Counts and Percentages */}
        <Card>
          <CardHeader>
            <CardTitle>지출 현황 (카테고리별)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categorySummary.map((cat) => (
              <div key={cat.key} className={`p-4 rounded-lg ${cat.bg}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 ${cat.color} rounded-full`} />
                    <span className="font-semibold text-lg">{cat.label}</span>
                    <span className={`text-sm px-2 py-1 rounded ${cat.textColor} bg-white`}>
                      {cat.count}건
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{cat.amount.toLocaleString()}원</p>
                    <p className={`text-sm font-medium ${cat.textColor}`}>
                      {cat.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all ${cat.color}`}
                    style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Expenses List (Limited to 5 items) */}
        <Card>
          <CardHeader>
            <CardTitle>최근 지출 내역 (최근 5건)</CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>등록된 지출 내역이 없습니다</p>
                <Link href={`/expenses/new?project_id=${id}`}>
                  <Button className="mt-4 h-12">
                    + 첫 지출 등록하기
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {expenses.slice(0, 5).map((expense: any) => {
                  const categoryInfo: Record<string, { label: string; color: string; bg: string }> = {
                    material: { label: "자재비", color: "bg-blue-600", bg: "bg-blue-50" },
                    labor: { label: "노무비", color: "bg-orange-600", bg: "bg-orange-50" },
                    food: { label: "식대", color: "bg-green-600", bg: "bg-green-50" },
                    fuel: { label: "유류비", color: "bg-red-600", bg: "bg-red-50" },
                    other: { label: "기타", color: "bg-gray-600", bg: "bg-gray-50" },
                  };
                  const cat = categoryInfo[expense.category] || categoryInfo.other;

                  return (
                    <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-2 h-10 ${cat.color} rounded-full`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${cat.bg} ${cat.color.replace('bg-', 'text-')} font-medium`}>
                              {cat.label}
                            </span>
                            <span className="font-medium">{expense.vendor_name || "미분류"}</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {expense.expense_date && new Date(expense.expense_date).toLocaleDateString("ko-KR")}
                            {expense.description && ` · ${expense.description}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{expense.amount.toLocaleString()}원</p>
                      </div>
                    </div>
                  );
                })}
                {expenses.length > 5 && (
                  <div className="text-center pt-2">
                    <span className="text-sm text-muted-foreground">
                      총 {expenses.length}건 중 최근 5건만 표시
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-3">
          <Link href={`/projects/${id}/labor`}>
            <Button className="w-full h-14 text-lg" variant="outline">
              <Users className="mr-2 h-5 w-5" />
              노무 관리
            </Button>
          </Link>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 등록</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Link href={`/expenses/new?project_id=${id}`}>
              <Button className="w-full h-14" variant="outline">
                + 영수증 등록
              </Button>
            </Link>
            <Link href={`/projects/${id}/labor/check`}>
              <Button className="w-full h-14" variant="outline">
                + 출근 체크
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
