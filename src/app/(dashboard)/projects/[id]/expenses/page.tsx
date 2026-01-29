"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format, parseISO, isSameMonth, subMonths, addMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { ArrowLeft, Trash2, Plus, Filter, Calendar as CalendarIcon, Loader2, Receipt, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

interface Expense {
    id: string;
    amount: number;
    category: string;
    vendor_name: string;
    expense_date: string;
    description: string;
    image_url?: string;
}

const CATEGORIES = [
    { value: "all", label: "전체" },
    { value: "material", label: "자재비", color: "text-blue-600", bg: "bg-blue-50" },
    { value: "labor", label: "노무비", color: "text-orange-600", bg: "bg-orange-50" },
    { value: "food", label: "식대", color: "text-green-600", bg: "bg-green-50" },
    { value: "fuel", label: "유류비", color: "text-red-600", bg: "bg-red-50" },
    { value: "other", label: "기타", color: "text-gray-600", bg: "bg-gray-50" },
];

export default function ExpensesPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { toast } = useToast();
    const [projectId, setProjectId] = useState<string>("");
    const [projectName, setProjectName] = useState<string>("");
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    // 수정 관련 상태
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [editForm, setEditForm] = useState({
        amount: 0,
        category: "",
        vendor_name: "",
        description: "",
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        params.then((p) => setProjectId(p.id));
    }, [params]);

    useEffect(() => {
        if (projectId) {
            fetchProjectAndExpenses();
        }
    }, [projectId]);

    const fetchProjectAndExpenses = async () => {
        try {
            setLoading(true);
            // Fetch project name (could be optimized, but ok for now)
            const projectRes = await fetch(`/api/projects?id=${projectId}`); // Note: API might need adjustment or use existing
            // Actually the current API /api/projects returns all projects. 
            // Let's rely on the user knowing which project they are in or just show "지출 관리" if fetching name is hard without specific API.
            // But typically we want the name.

            // Since /api/projects lists all, we can filter or maybe there isn't a single fetch API exposed yet.
            // Let's just fetch expenses for now. Title can be generic or we fetch all projects and find one.

            const expensesRes = await fetch(`/api/expenses?project_id=${projectId}`);
            const expensesData = await expensesRes.json();

            if (expensesData.success) {
                setExpenses(expensesData.expenses);
            }
        } catch (error) {
            toast({
                title: "데이터 로딩 실패",
                description: "지출 내역을 불러오지 못했습니다.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;

        setDeletingId(id);
        try {
            const response = await fetch(`/api/expenses/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setExpenses(expenses.filter((e) => e.id !== id));
                toast({
                    title: "삭제 완료",
                    description: "지출 내역이 삭제되었습니다.",
                });
            } else {
                throw new Error("삭제 실패");
            }
        } catch (error) {
            toast({
                title: "삭제 오류",
                description: "지출 내역을 삭제하지 못했습니다.",
                variant: "destructive",
            });
        } finally {
            setDeletingId(null);
        }
    };

    // 수정 모달 열기
    const handleEditOpen = (expense: Expense) => {
        setEditingExpense(expense);
        setEditForm({
            amount: expense.amount,
            category: expense.category,
            vendor_name: expense.vendor_name || "",
            description: expense.description || "",
        });
    };

    // 수정 저장
    const handleEditSave = async () => {
        if (!editingExpense) return;

        setIsSaving(true);
        try {
            const response = await fetch(`/api/expenses/${editingExpense.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            });

            if (response.ok) {
                const data = await response.json();
                // 목록 업데이트
                setExpenses(expenses.map((e) =>
                    e.id === editingExpense.id
                        ? { ...e, ...editForm }
                        : e
                ));
                setEditingExpense(null);
                toast({
                    title: "수정 완료",
                    description: "지출 내역이 수정되었습니다.",
                });
            } else {
                throw new Error("수정 실패");
            }
        } catch (error) {
            toast({
                title: "수정 오류",
                description: "지출 내역을 수정하지 못했습니다.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Filter Logic
    const filteredExpenses = expenses.filter((expense) => {
        const expenseDate = parseISO(expense.expense_date);
        const matchesMonth = isSameMonth(expenseDate, selectedMonth);
        const matchesCategory = selectedCategory === "all" || expense.category === selectedCategory;
        return matchesMonth && matchesCategory;
    });

    // Calculate Summary
    const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const count = filteredExpenses.length;

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link href={`/projects/${projectId}`}>
                            <Button variant="ghost" size="icon" className="mr-2">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <h1 className="text-xl font-bold">지출 관리</h1>
                    </div>
                    <Link href={`/expenses/new?project_id=${projectId}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" />
                            지출 등록
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
                {/* Month & Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center bg-white rounded-lg border p-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
                        >
                            ←
                        </Button>
                        <div className="px-4 font-bold min-w-[140px] text-center">
                            {format(selectedMonth, "yyyy년 MM월", { locale: ko })}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
                        >
                            →
                        </Button>
                    </div>

                    <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                    >
                        <SelectTrigger className="w-full sm:w-[180px] bg-white">
                            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="카테고리" />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Summary Card */}
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1">
                                {format(selectedMonth, "M월", { locale: ko })} 총 지출 ({count}건)
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                                {totalAmount.toLocaleString()}원
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Expenses List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                            <p className="mt-2 text-muted-foreground">불러오는 중...</p>
                        </div>
                    ) : filteredExpenses.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>지출 내역이 없습니다.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredExpenses.map((expense) => {
                            const catInfo = CATEGORIES.find(c => c.value === expense.category) || CATEGORIES[5]; // default other

                            return (
                                <Card key={expense.id} className="overflow-hidden hover:shadow-sm transition-shadow">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-start gap-3 overflow-hidden">
                                            <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${catInfo.bg} ${catInfo.color}`}>
                                                {catInfo.label[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold truncate">
                                                        {expense.vendor_name || "거래처 미입력"}
                                                    </span>
                                                    <span className={`text-xs px-1.5 py-0.5 rounded ${catInfo.bg} ${catInfo.color}`}>
                                                        {catInfo.label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-0.5">
                                                    {format(parseISO(expense.expense_date), "M월 d일 (E)", { locale: ko })}
                                                    {expense.description && ` · ${expense.description}`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pl-4 flex-shrink-0">
                                            <span className="font-bold text-lg">
                                                {expense.amount.toLocaleString()}원
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-gray-400 hover:text-blue-600"
                                                onClick={() => handleEditOpen(expense)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-gray-400 hover:text-red-600"
                                                onClick={() => handleDelete(expense.id)}
                                                disabled={deletingId === expense.id}
                                            >
                                                {deletingId === expense.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </main>

            {/* 수정 모달 */}
            <Dialog open={!!editingExpense} onOpenChange={(open: boolean) => !open && setEditingExpense(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>지출 내역 수정</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="amount">금액</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={editForm.amount}
                                onChange={(e) => setEditForm({ ...editForm, amount: Number(e.target.value) })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category">카테고리</Label>
                            <Select
                                value={editForm.category}
                                onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="카테고리 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.filter(c => c.value !== "all").map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="vendor_name">거래처</Label>
                            <Input
                                id="vendor_name"
                                value={editForm.vendor_name}
                                onChange={(e) => setEditForm({ ...editForm, vendor_name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">메모</Label>
                            <Input
                                id="description"
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingExpense(null)}>
                            취소
                        </Button>
                        <Button onClick={handleEditSave} disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            저장
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
