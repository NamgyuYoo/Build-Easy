"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Camera, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const CATEGORY_OPTIONS = [
  { value: "material", label: "자재비", color: "bg-blue-600" },
  { value: "labor", label: "노무비", color: "bg-orange-600" },
  { value: "food", label: "식대", color: "bg-green-600" },
  { value: "fuel", label: "유류비", color: "bg-red-600" },
  { value: "other", label: "기타", color: "bg-gray-600" },
];

const AMOUNT_CHIPS = [
  { label: "+1만", value: 10000 },
  { label: "+5만", value: 50000 },
  { label: "+10만", value: 100000 },
  { label: "+50만", value: 500000 },
];

function NewExpensePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [extractedData, setExtractedData] = useState<{
    amount?: string;
    vendor_name?: string;
    date?: string;
    category?: string;
  }>({});
  const [formData, setFormData] = useState({
    amount: "",
    vendor_name: "",
    date: new Date().toISOString().split("T")[0],
    category: "material",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [projects, setProjects] = useState<any[]>([]);

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects");
        const data = await response.json();
        if (response.ok && data.projects) {
          setProjects(data.projects);

          // Check if project_id is in URL
          const urlProjectId = searchParams.get("project_id");

          if (urlProjectId && data.projects.some((p: any) => p.id === urlProjectId)) {
            setSelectedProject(urlProjectId);
          } else if (data.projects.length > 0 && !selectedProject) {
            setSelectedProject(data.projects[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };
    fetchProjects();
  }, [searchParams]);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "파일 크기 오류",
        description: "이미지는 10MB 이하여야 합니다",
        variant: "destructive",
      });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-extract data with AI
    extractReceiptData(file);
  };

  const extractReceiptData = async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ocr/receipt", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "OCR 처리에 실패했습니다");
      }

      setExtractedData(data.extracted || {});
      setFormData((prev) => ({
        ...prev,
        amount: data.extracted?.amount || prev.amount,
        vendor_name: data.extracted?.vendor_name || prev.vendor_name,
        date: data.extracted?.date || prev.date,
        category: data.extracted?.category || prev.category,
      }));

      toast({
        title: "영수증 분석 완료",
        description: "자동으로 정보를 추출했습니다. 확인 후 수정하세요",
      });
    } catch (error) {
      toast({
        title: "OCR 오류",
        description: error instanceof Error ? error.message : "이미지 처리에 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChip = (amount: number) => {
    const currentAmount = parseInt(formData.amount.replace(/,/g, "")) || 0;
    const newAmount = currentAmount + amount;
    setFormData((prev) => ({
      ...prev,
      amount: newAmount.toLocaleString(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject) {
      toast({
        title: "현장 선택 오류",
        description: "현장을 선택해주세요",
        variant: "destructive",
      });
      return;
    }

    if (!formData.amount) {
      toast({
        title: "금액 입력 오류",
        description: "금액을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      let imageUrl = "";

      // Upload image if exists
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("file", imageFile);

        const uploadResponse = await fetch("/api/upload/image", {
          method: "POST",
          body: imageFormData,
        });

        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) {
          throw new Error(uploadData.error || "이미지 업로드에 실패했습니다");
        }
        imageUrl = uploadData.url;
      }

      // Create expense
      const expenseResponse = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: selectedProject,
          image_url: imageUrl,
          category: formData.category,
          amount: parseInt(formData.amount.replace(/,/g, "")),
          vendor_name: formData.vendor_name,
          expense_date: formData.date,
          description: formData.description,
        }),
      });

      const expenseData = await expenseResponse.json();

      if (!expenseResponse.ok) {
        throw new Error(expenseData.error || "지출 등록에 실패했습니다");
      }

      toast({
        title: "등록 완료",
        description: "지출 내역이 등록되었습니다",
      });

      router.back();
    } catch (error) {
      toast({
        title: "등록 오류",
        description: error instanceof Error ? error.message : "지출 등록에 실패했습니다",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">영수증 등록</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Camera Capture */}
        <Card>
          <CardContent className="p-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImageCapture}
              disabled={loading}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-16 text-lg"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  AI 분석 중...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-5 w-5" />
                  사진 촬영 또는 선택
                </>
              )}
            </Button>
            {imagePreview && (
              <div className="mt-3 relative">
                <img
                  src={imagePreview}
                  alt="Receipt preview"
                  className="w-full rounded-lg"
                />
                {extractedData.amount && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    분석 완료
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>지출 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Project Selection */}
              <div className="space-y-2">
                <Label className="text-base">현장 *</Label>
                {projects.length === 0 ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      등록된 현장이 없습니다. 먼저 현장을 등록해주세요.
                    </p>
                    <Link href="/projects/new" className="text-sm text-blue-600 underline">
                      현장 등록하기
                    </Link>
                  </div>
                ) : (
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full min-h-12 px-3 text-lg border rounded-md bg-white"
                    required
                  >
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <Label className="text-base">분류 *</Label>
                <div className="grid grid-cols-5 gap-2">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.value })}
                      className={`h-14 rounded-md font-medium text-sm ${
                        formData.category === cat.value
                          ? `${cat.color} text-white`
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-base">금액 (원) *</Label>
                <Input
                  id="amount"
                  type="text"
                  placeholder="예: 150,000"
                  value={formData.amount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, "");
                    setFormData({
                      ...formData,
                      amount: value.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                    });
                  }}
                  className="min-h-12 text-lg"
                  required
                />
                <div className="flex gap-2 flex-wrap">
                  {AMOUNT_CHIPS.map((chip) => (
                    <Button
                      key={chip.label}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAmountChip(chip.value)}
                    >
                      {chip.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Vendor */}
              <div className="space-y-2">
                <Label htmlFor="vendor" className="text-base">거래처</Label>
                <Input
                  id="vendor"
                  type="text"
                  placeholder="예: 홈플러스"
                  value={formData.vendor_name}
                  onChange={(e) =>
                    setFormData({ ...formData, vendor_name: e.target.value })
                  }
                  className="min-h-12 text-lg"
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date" className="text-base">지출일 *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="min-h-12 text-lg"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base">메모</Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="비고 사항"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="min-h-12 text-lg"
                />
              </div>

              {/* Submit Button - Fixed at bottom */}
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
                <Button
                  type="submit"
                  className="w-full h-16 text-xl font-semibold bg-green-700 hover:bg-green-800"
                  disabled={saving || loading}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    "저장하기"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function NewExpensePageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">로딩 중...</div>}>
      <NewExpensePage />
    </Suspense>
  );
}

export default NewExpensePageWrapper;
