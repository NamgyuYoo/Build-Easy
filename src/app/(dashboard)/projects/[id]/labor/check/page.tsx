"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar as CalendarIcon, Users } from "lucide-react";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export default function LaborCheckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [projectId, setProjectId] = useState<string>("");
  const router = useRouter();
  const { toast } = useToast();
  const [workers, setWorkers] = useState<any[]>([]);
  const [laborLogs, setLaborLogs] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    params.then((p) => {
      setProjectId(p.id);
    });
  }, [params]);

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch workers
      const workersRes = await fetch("/api/workers");
      const workersData = await workersRes.json();
      setWorkers(workersData.workers || []);

      // Fetch labor logs for this project
      const logsRes = await fetch(`/api/projects/${projectId}/labor`);
      const logsData = await logsRes.json();
      setLaborLogs(logsData.laborLogs || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLogForDate = (workerId: string, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return laborLogs.find(
      (log) => log.worker_id === workerId && log.work_date === dateStr
    );
  };

  const handleCheckIn = async (workerId: string, status: "full" | "half") => {
    setSaving(true);
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
        // Refresh logs
        const logsRes = await fetch(`/api/projects/${projectId}/labor`);
        const logsData = await logsRes.json();
        setLaborLogs(logsData.laborLogs || []);

        // Success feedback
        const worker = workers.find((w) => w.id === workerId);
        toast({
          title: "체크 완료",
          description: `${worker?.name}님을 ${status === "full" ? "1공수" : "0.5공수"}로 체크했습니다`,
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
      console.error("Error checking in:", error);
      toast({
        title: "체크 오류",
        description: "네트워크 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (logId: string) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/labor-logs/${logId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh logs
        const logsRes = await fetch(`/api/projects/${projectId}/labor`);
        const logsData = await logsRes.json();
        setLaborLogs(logsData.laborLogs || []);

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
      console.error("Error removing log:", error);
      toast({
        title: "삭제 오류",
        description: "네트워크 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // 전체 작업자 일괄 체크
  const handleCheckInAll = async (status: "full" | "half") => {
    setSaving(true);
    try {
      const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
      const uncheckedWorkers = workers.filter((worker) => {
        const existingLog = laborLogs.find(
          (log) => log.worker_id === worker.id && log.work_date === selectedDateStr
        );
        return !existingLog;
      });

      if (uncheckedWorkers.length === 0) {
        toast({
          title: "이미 모두 체크됨",
          description: "모든 작업자가 이미 체크되었습니다",
        });
        setSaving(false);
        return;
      }

      const promises = uncheckedWorkers.map((worker) =>
        fetch("/api/labor-logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_id: projectId,
            worker_id: worker.id,
            work_date: selectedDateStr,
            status,
          }),
        })
      );

      const results = await Promise.allSettled(promises);

      const successCount = results.filter((r) => r.status === "fulfilled").length;
      const failCount = results.filter((r) => r.status === "rejected").length;

      // Refresh logs
      const logsRes = await fetch(`/api/projects/${projectId}/labor`);
      const logsData = await logsRes.json();
      setLaborLogs(logsData.laborLogs || []);

      if (failCount === 0) {
        toast({
          title: "일괄 체크 완료",
          description: `${uncheckedWorkers.length}명을 ${status === "full" ? "1공수" : "0.5공수"}로 체크했습니다`,
        });
      } else if (successCount === 0) {
        toast({
          title: "일괄 체크 실패",
          description: "모든 체크에 실패했습니다",
          variant: "destructive",
        });
      } else {
        toast({
          title: "부분 성공",
          description: `${successCount}명 성공, ${failCount}명 실패`,
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "일괄 체크 오류",
        description: "일괄 체크에 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // 당일 요약 계산
  const getDailySummary = () => {
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
  };

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDayClass = (date: Date) => {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) return "text-red-600";
    if (dayOfWeek === 6) return "text-blue-600";
    return "";
  };

  // 해당 날짜의 체크된 작업자 수 계산
  const getCheckedCount = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return laborLogs.filter((log) => log.work_date === dateStr).length;
  };

  if (!projectId) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">로딩 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Link href={`/projects/${projectId}/labor`}>
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">출근 체크</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Month Selector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                onClick={() =>
                  setSelectedDate(
                    new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1)
                  )
                }
              >
                ←
              </Button>
              <h2 className="text-xl font-bold">
                {format(selectedDate, "yyyy년 MM월", { locale: ko })}
              </h2>
              <Button
                variant="outline"
                onClick={() =>
                  setSelectedDate(
                    new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1)
                  )
                }
              >
                →
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                <div
                  key={day}
                  className={`text-sm font-medium ${
                    day === "일"
                      ? "text-red-600"
                      : day === "토"
                      ? "text-blue-600"
                      : ""
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {daysInMonth.map((date) => {
                const isSelected = isSameDay(date, selectedDate);
                const checkedCount = getCheckedCount(date);
                const totalCount = workers.length;
                const isAllChecked = checkedCount === totalCount && totalCount > 0;

                // 더블 클릭으로 당일 전체 1공수 체크
                const handleDoubleClick = async (e: React.MouseEvent) => {
                  e.stopPropagation();
                  const dateStr = format(date, "yyyy-MM-dd");

                  // 해당 날짜의 체크되지 않은 작업자 수 계산
                  const uncheckedWorkers = workers.filter(
                    (w) => !laborLogs.some(
                      (log) => log.worker_id === w.id && log.work_date === dateStr
                    )
                  );

                  if (uncheckedWorkers.length === 0) {
                    toast({
                      title: "이미 모두 체크됨",
                      description: "이미 전체 작업자가 체크되었습니다",
                      variant: "default",
                    });
                    return;
                  }

                  setSaving(true);
                  try {
                    const promises = uncheckedWorkers.map((worker) =>
                      fetch("/api/labor-logs", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          project_id: projectId,
                          worker_id: worker.id,
                          work_date: dateStr,
                          status: "full",
                        }),
                      })
                    );

                    await Promise.all(promises);

                    // Refresh data
                    setSelectedDate(date);

                    const logsRes = await fetch(`/api/projects/${projectId}/labor`);
                    const logsData = await logsRes.json();
                    setLaborLogs(logsData.laborLogs || []);

                    toast({
                      title: "일괄 체크 완료",
                      description: `${uncheckedWorkers.length}명을 1공수로 체크했습니다`,
                    });
                  } catch (error) {
                    toast({
                      title: "일괄 체크 오류",
                      description: "일괄 체크에 실패했습니다",
                      variant: "destructive",
                    });
                  } finally {
                    setSaving(false);
                  }
                };

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    onDoubleClick={handleDoubleClick}
                  className={`h-14 rounded-md text-sm font-medium transition-all relative ${
                      isSelected
                        ? "bg-blue-600 text-white ring-4 ring-blue-200"
                        : "bg-gray-100 hover:bg-gray-200 active:bg-blue-100"
                    } ${getDayClass(date)} ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={saving}
                  title={
                    isAllChecked
                      ? `전체 ${totalCount}명 체크됨 (클릭: 확인/수정)`
                      : checkedCount > 0
                      ? `${checkedCount}/${totalCount}명 체크됨 (클릭: 확인/수정, 더블클릭: 나머지 1공수)`
                      : `0/${totalCount}명 (클릭: 선택, 더블클릭: 전체 1공수)`
                  }
                >
                    <span className="text-base">{format(date, "d")}</span>
                    {/* 체크된 작업자 수 배지 */}
                    {checkedCount > 0 && (
                      <span className={`absolute -top-1 -right-1 text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold ${
                        isSelected
                          ? "bg-white text-blue-600"
                          : "bg-blue-600 text-white"
                      }`}>
                        {checkedCount}
                      </span>
                    )}
                    {/* 체크 표시 인디케이터 */}
                    {isAllChecked && (
                      <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                        isSelected ? "bg-white" : "bg-green-500"
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Daily Summary Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                {format(selectedDate, "yyyy년 MM월 dd일 EEEE", { locale: ko })} 요약
              </h3>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">
                  {getDailySummary().totalCost.toLocaleString()}원
                </p>
                <p className="text-xs text-muted-foreground">당일 노무비</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-blue-50 rounded">
                <p className="text-lg font-bold text-blue-600">{getDailySummary().fullCount}일</p>
                <p className="text-xs text-muted-foreground">1공수</p>
              </div>
              <div className="p-2 bg-orange-50 rounded">
                <p className="text-lg font-bold text-orange-600">{getDailySummary().halfCount}반</p>
                <p className="text-xs text-muted-foreground">0.5공수</p>
              </div>
              <div className="p-2 bg-green-50 rounded">
                <p className="text-lg font-bold text-green-600">{getDailySummary().totalManDays}공수</p>
                <p className="text-xs text-muted-foreground">총합</p>
              </div>
            </div>
            {/* Bulk Check-in Buttons */}
            {workers.length > 0 && (
              <div className="mt-3 pt-3 border-t flex gap-2">
                <Button
                  onClick={() => handleCheckInAll("half")}
                  disabled={saving}
                  variant="outline"
                  className="flex-1 h-12"
                >
                  <Users className="mr-2 h-4 w-4" />
                  전체 0.5공수
                </Button>
                <Button
                  onClick={() => handleCheckInAll("full")}
                  disabled={saving}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
                >
                  <Users className="mr-2 h-4 w-4" />
                  전체 1공수
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Date Worker Check-in */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              개별 작업자 체크
            </h3>

            {loading ? (
              <p className="text-center text-muted-foreground py-8">로딩 중...</p>
            ) : workers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                등록된 작업자가 없습니다
              </p>
            ) : (
              <div className="space-y-3">
                {workers.map((worker) => {
                  const log = getLogForDate(worker.id, selectedDate);

                  return (
                    <div
                      key={worker.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">{worker.name}</p>
                        <p className="text-sm text-muted-foreground">
                          일당: {worker.daily_wage.toLocaleString()}원
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {log ? (
                          <>
                            <span
                              className={`px-3 py-2 rounded-md font-medium ${
                                log.status === "full"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {log.status === "full" ? "1공수" : "0.5공수"}
                            </span>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemove(log.id)}
                              disabled={saving}
                            >
                              삭제
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => handleCheckIn(worker.id, "half")}
                              disabled={saving}
                              className="h-12 px-4"
                            >
                              0.5공수
                            </Button>
                            <Button
                              onClick={() => handleCheckIn(worker.id, "full")}
                              disabled={saving}
                              className="h-12 px-4 bg-blue-600 hover:bg-blue-700"
                            >
                              1공수
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
