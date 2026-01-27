"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function NewWorkerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [dailyWage, setDailyWage] = useState("");
  const [phone, setPhone] = useState("");
  const [residentNumber, setResidentNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          daily_wage: parseInt(dailyWage.replace(/,/g, "")),
          phone: phone || null,
          resident_number: residentNumber || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "작업자 등록에 실패했습니다");
      }

      toast({
        title: "등록 완료",
        description: "작업자가 등록되었습니다",
      });

      router.push("/workers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "작업자 등록에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleWageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    setDailyWage(value.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Link href="/workers">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">작업자 등록</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>새 작업자 정보</CardTitle>
            <CardDescription>노무비 대장 작성을 위한 작업자 정보를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">이름 *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="홍길동"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  className="min-h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dailyWage" className="text-base">일당 (원) *</Label>
                <Input
                  id="dailyWage"
                  type="text"
                  placeholder="예: 150,000"
                  value={dailyWage}
                  onChange={handleWageChange}
                  required
                  disabled={loading}
                  className="min-h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base">연락처</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="010-1234-5678"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  disabled={loading}
                  className="min-h-12 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="residentNumber" className="text-base">주민번호 앞자리</Label>
                <Input
                  id="residentNumber"
                  type="text"
                  placeholder="예: 900101"
                  maxLength={6}
                  value={residentNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setResidentNumber(value);
                  }}
                  disabled={loading}
                  className="min-h-12 text-lg"
                />
                <p className="text-xs text-muted-foreground">
                  세무서 제출용 노무비 대장에 필요합니다 (YYMMDD 형식)
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-14 text-lg font-semibold"
                disabled={loading || !name || !dailyWage}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  "작업자 등록하기"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
