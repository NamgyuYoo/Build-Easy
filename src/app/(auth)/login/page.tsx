"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "로그인에 실패했습니다");
      }

      setSuccess("로그인 성공! 대시보드로 이동합니다...");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "회원가입에 실패했습니다");
      }

      // 회원가입 성공
      if (data.requiresLogin) {
        setSuccess("회원가입 완료! 로그인 버튼을 눌러주세요.");
      } else {
        setSuccess("회원가입 완료! 대시보드로 이동합니다...");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold">Build-Easy</CardTitle>
          <CardDescription className="text-base">
            현장 정산 자동화<br />
            장갑 끼고도 쓸 수 있는 가장 쉬운 정산 도구
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="min-h-12 text-lg"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="•••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="min-h-12 text-lg"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm font-medium border border-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm font-medium border border-green-200">
                {success}
              </div>
            )}

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full h-14 text-lg font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  "로그인"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-14 text-lg font-semibold"
                onClick={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  "회원가입"
                )}
              </Button>
            </div>
          </form>

          {/* 환경설정 안내 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-3 bg-yellow-50 rounded-md border border-yellow-200">
              <p className="text-xs text-yellow-800 font-medium mb-2">
                ⚠️ 개발 모드 - Supabase 설정 확인 필요
              </p>
              <details className="text-xs text-yellow-700">
                <summary className="cursor-pointer font-medium">설정 방법 보기</summary>
                <ol className="mt-2 space-y-1 list-decimal list-inside">
                  <li>Supabase Dashboard → Authentication → Providers</li>
                  <li>Email provider가 활성화되어 있는지 확인</li>
                  <li>Enable email provider → Save</li>
                  <li>.env.local 파일에 Supabase URL과 Key가 있는지 확인</li>
                </ol>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
