"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar as CalendarIcon, Users, Loader2, Check, X } from "lucide-react";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import type { Worker, LaborLog } from "@/types";

// ============================================
// 노무 관리 체크인 페이지 (완전 재작성)
// ============================================
// 주요 기능:
// 1. 캘린더에서 날짜 선택 (싱글 클릭)
// 2. 개별 작업자 체크인/체크아웃 (1공수/0.5공수)
// 3. 전체 일괄 체크인 (버튼 클릭)
// 4. 일별 요약 표시
// ============================================

export default function LaborCheckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // === 기본 상태 ===
  const [projectId, setProjectId] = useState<string>("");
  const router = useRouter();
  const { toast } = useToast();

  // === 데이터 상태 ===
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [laborLogs, setLaborLogs] = useState<LaborLog[]>([]);

  // === UI 상태 ===
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  // === 저장 상태 (개별) ===
  const [savingWorkers, setSavingWorkers] = useState<Set<string>>(new Set());

  // === 저장 상태 (일괄) ===
  const [bulkSaving, setBulkSaving] = useState(false);

  // === 프로젝트 ID 초기화 ===
  useEffect(() => {
    params.then((p) => {
      setProjectId(p.id);
    });
  }, [params]);

  // === 데이터 로드 ===
  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [workersRes, logsRes] = await Promise.all([
        fetch("/api/workers"),
        fetch(`/api/projects/${projectId}/labor`),
      ]);

      const [workersData, logsData] = await Promise.all([
        workersRes.json(),
        logsRes.json(),
      ]);

      setWorkers(workersData.workers || []);
      setLaborLogs(logsData.laborLogs || []);
    } catch (error) {
      console.error("데이터 로드 오류:", error);
      toast({
        title: "데이터 로드 실패",
        description: "데이터를 불러오는데 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // === 유틸리티 함수들 ===

  // 특정 날짜 + 작업자의 로그 조회
  const getLogForDate = useCallback(
    (workerId: string, date: Date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      return laborLogs.find(
        (log) => log.worker_id === workerId && log.work_date === dateStr
      );
    },
    [laborLogs]
  );

  // 특정 날짜의 체크된 작업자 수
  const getCheckedCount = useCallback(
    (date: Date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      return laborLogs.filter((log) => log.work_date === dateStr).length;
    },
    [laborLogs]
  );

  // 현재 선택된 날짜의 일일 요약
  const getDailySummary = useCallback(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const todaysLogs = laborLogs.filter((log) => log.work_date === dateStr);

    const fullCount = todaysLogs.filter((log) => log.status === "full").length;
    const halfCount = todaysLogs.filter((log) => log.status === "half").length;
    const totalManDays = fullCount + halfCount * 0.5;

    const totalCost = todaysLogs.reduce((sum, log) => {
      const worker = workers.find((w) => w.id === log.worker_id);
      const wage = worker?.daily_wage || 0;
      const dayCost = log.status === "full" ? wage : wage * 0.5;
      return sum + dayCost;
    }, 0);

    return { fullCount, halfCount, totalManDays, totalCost };
  }, [selectedDate, laborLogs, workers]);

  // === 핸들러 함수들 ===

  // 개별 작업자 체크인
  const handleCheckIn = async (workerId: string, status: "full" | "half") => {
    if (savingWorkers.has(workerId)) return;

    setSavingWorkers((prev) => new Set(prev).add(workerId));

    try {
      const response = await fetch("/api/labor-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          worker_id: workerId,
          work_date: format(selectedDate, "yyyy-MM-dd"),
          status,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // 로컬 상태 업데이트 (서버 재요청 대신)
        if (data.laborLog) {
          setLaborLogs((prev) => [...prev, data.laborLog]);
        } else {
          // fallback: 서버에서 다시 가져오기
          const logsRes = await fetch(`/api/projects/${projectId}/labor`);
          const logsData = await logsRes.json();
          setLaborLogs(logsData.laborLogs || []);
        }

        const worker = workers.find((w) => w.id === workerId);
        toast({
          title: "체크 완료",
          description: `${worker?.name}님 ${status === "full" ? "1공수" : "0.5공수"}`,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "체크 실패",
          description: errorData.error || "체크에 실패했습니다",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "네트워크 오류",
        description: "서버 연결에 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setSavingWorkers((prev) => {
        const next = new Set(prev);
        next.delete(workerId);
        return next;
      });
    }
  };

  // 개별 작업자 체크아웃 (삭제)
  const handleRemove = async (logId: string, workerId: string) => {
    if (savingWorkers.has(workerId)) return;

    setSavingWorkers((prev) => new Set(prev).add(workerId));

    try {
      const response = await fetch(`/api/labor-logs/${logId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // 로컬 상태에서 삭제
        setLaborLogs((prev) => prev.filter((log) => log.id !== logId));

        toast({
          title: "삭제 완료",
          description: "체크 기록을 삭제했습니다",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "삭제 실패",
          description: errorData.error || "삭제에 실패했습니다",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "네트워크 오류",
        description: "서버 연결에 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setSavingWorkers((prev) => {
        const next = new Set(prev);
        next.delete(workerId);
        return next;
      });
    }
  };

  // 전체 일괄 체크인 (선택된 날짜 기준)
  const handleBulkCheckIn = async (status: "full" | "half") => {
    if (bulkSaving) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const uncheckedWorkers = workers.filter(
      (worker) =>
        !laborLogs.some(
          (log) => log.worker_id === worker.id && log.work_date === dateStr
        )
    );

    if (uncheckedWorkers.length === 0) {
      toast({
        title: "이미 모두 체크됨",
        description: "모든 작업자가 이미 체크되어 있습니다",
      });
      return;
    }

    setBulkSaving(true);

    try {
      const promises = uncheckedWorkers.map((worker) =>
        fetch("/api/labor-logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_id: projectId,
            worker_id: worker.id,
            work_date: dateStr,
            status,
          }),
        }).then((res) => res.json())
      );

      const results = await Promise.allSettled(promises);
      const successCount = results.filter((r) => r.status === "fulfilled").length;

      // 전체 로그 다시 가져오기
      const logsRes = await fetch(`/api/projects/${projectId}/labor`);
      const logsData = await logsRes.json();
      setLaborLogs(logsData.laborLogs || []);

      toast({
        title: "일괄 체크 완료",
        description: `${successCount}명을 ${status === "full" ? "1공수" : "0.5공수"}로 체크했습니다`,
      });
    } catch (error) {
      toast({
        title: "일괄 체크 오류",
        description: "일괄 체크 중 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setBulkSaving(false);
    }
  };

  // === 월 네비게이션 ===
  const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
  };

  // === 캘린더 데이터 ===
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 요일 배열 (일요일 시작)
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

  // 첫 날의 요일 오프셋
  const firstDayOffset = monthStart.getDay();

  // 일별 스타일
  const getDayClass = (date: Date) => {
    const day = date.getDay();
    if (day === 0) return "text-red-500";
    if (day === 6) return "text-blue-500";
    return "";
  };

  // === 로딩 상태 ===
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
            <Link href={`/projects/${projectId}/labor`}>
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">출근 체크</h1>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // === 렌더링 ===
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href={`/projects/${projectId}/labor`}>
              <Button variant="ghost" size="icon" className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">출근 체크</h1>
          </div>
          <Button variant="outline" size="sm" onClick={goToToday}>
            오늘
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* 캘린더 카드 */}
        <Card>
          <CardContent className="p-4">
            {/* 월 네비게이션 */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-bold">
                {format(currentMonth, "yyyy년 M월", { locale: ko })}
              </h2>
              <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Button>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
              {weekdays.map((day, i) => (
                <div
                  key={day}
                  className={`text-sm font-medium ${i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"
                    }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-1">
              {/* 첫 주 오프셋 */}
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`offset-${i}`} className="h-12" />
              ))}

              {/* 날짜들 */}
              {daysInMonth.map((date) => {
                const isSelected = isSameDay(date, selectedDate);
                const checkedCount = getCheckedCount(date);
                const totalCount = workers.length;
                const isAllChecked = checkedCount === totalCount && totalCount > 0;
                const isToday = isSameDay(date, new Date());

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      h-12 rounded-lg text-sm font-medium transition-all relative
                      flex flex-col items-center justify-center
                      ${isSelected
                        ? "bg-blue-600 text-white shadow-lg"
                        : isToday
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-50 hover:bg-gray-100"
                      }
                      ${getDayClass(date)}
                    `}
                  >
                    <span className={`text-sm ${isSelected ? "text-white" : ""}`}>
                      {format(date, "d")}
                    </span>

                    {/* 체크 상태 인디케이터 */}
                    {checkedCount > 0 && (
                      <div className={`
                        absolute -top-1 -right-1 
                        min-w-5 h-5 px-1 
                        rounded-full text-xs font-bold
                        flex items-center justify-center
                        ${isSelected
                          ? "bg-white text-blue-600"
                          : isAllChecked
                            ? "bg-green-500 text-white"
                            : "bg-orange-500 text-white"
                        }
                      `}>
                        {checkedCount}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 일일 요약 카드 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {format(selectedDate, "M월 d일 (EEEE)", { locale: ko })}
              </h3>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">
                  {getDailySummary().totalCost.toLocaleString()}원
                </p>
                <p className="text-xs text-muted-foreground">예상 인건비</p>
              </div>
            </div>

            {/* 요약 통계 */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-xl font-bold text-blue-600">
                  {getDailySummary().fullCount}
                </p>
                <p className="text-xs text-muted-foreground">1공수</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg text-center">
                <p className="text-xl font-bold text-orange-600">
                  {getDailySummary().halfCount}
                </p>
                <p className="text-xs text-muted-foreground">0.5공수</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-xl font-bold text-green-600">
                  {getDailySummary().totalManDays}
                </p>
                <p className="text-xs text-muted-foreground">총 공수</p>
              </div>
            </div>

            {/* 일괄 체크 버튼 */}
            {workers.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => handleBulkCheckIn("half")}
                  disabled={bulkSaving}
                >
                  {bulkSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Users className="h-4 w-4 mr-2" />
                  )}
                  전체 0.5공수
                </Button>
                <Button
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleBulkCheckIn("full")}
                  disabled={bulkSaving}
                >
                  {bulkSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Users className="h-4 w-4 mr-2" />
                  )}
                  전체 1공수
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 개별 작업자 체크 카드 */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold mb-4">개별 작업자 체크</h3>

            {workers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>등록된 작업자가 없습니다</p>
                <Link href="/workers/new">
                  <Button variant="link" className="mt-2">
                    작업자 등록하기
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {workers.map((worker) => {
                  const log = getLogForDate(worker.id, selectedDate);
                  const isSaving = savingWorkers.has(worker.id);

                  return (
                    <div
                      key={worker.id}
                      className={`
                        flex items-center justify-between p-3 rounded-lg border
                        transition-all
                        ${log ? "bg-blue-50 border-blue-200" : "bg-white"}
                        ${isSaving ? "opacity-60" : ""}
                      `}
                    >
                      {/* 작업자 정보 */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{worker.name}</p>
                        <p className="text-sm text-muted-foreground">
                          일당 {worker.daily_wage.toLocaleString()}원
                        </p>
                      </div>

                      {/* 체크 버튼 영역 */}
                      <div className="flex items-center gap-2 ml-2">
                        {log ? (
                          // 이미 체크된 상태
                          <>
                            <span
                              className={`
                                px-3 py-2 rounded-md font-medium
                                ${log.status === "full"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-orange-100 text-orange-700"
                                }
                              `}
                            >
                              {log.status === "full" ? "1공수" : "0.5공수"}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemove(log.id, worker.id)}
                              disabled={isSaving}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        ) : (
                          // 미체크 상태
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCheckIn(worker.id, "half")}
                              disabled={isSaving}
                              className="h-10 px-3"
                            >
                              {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "0.5공수"
                              )}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleCheckIn(worker.id, "full")}
                              disabled={isSaving}
                              className="h-10 px-3 bg-blue-600 hover:bg-blue-700"
                            >
                              {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "1공수"
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
