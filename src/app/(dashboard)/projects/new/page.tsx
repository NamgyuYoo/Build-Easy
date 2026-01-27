"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          budget: budget ? parseInt(budget.replace(/,/g, "")) : 0,
          start_date: startDate || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "프로젝트 생성에 실패했습니다");
      }

      router.push(`/projects/${data.project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "프로젝트 생성에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    setBudget(value.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">새 현장 등록</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>현장 정보 입력</CardTitle>
            <CardDescription>새로운 현장의 기본 정보를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">현장명 *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="예: 강남구 OO 아파트 인테리어"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  className="min-h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget" className="text-base">예산 (원)</Label>
                <Input
                  id="budget"
                  type="text"
                  placeholder="예: 50,000,000"
                  value={budget}
                  onChange={handleBudgetChange}
                  disabled={loading}
                  className="min-h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-base">착공일</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={loading}
                  className="min-h-12 text-lg"
                />
              </div>

              {error && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-14 text-lg font-semibold"
                disabled={loading || !name}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  "현장 등록하기"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
