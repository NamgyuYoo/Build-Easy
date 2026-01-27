import { createClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, UserPlus } from "lucide-react";
import Link from "next/link";

export default async function WorkersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: workers } = await supabase
    .from("workers")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

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
            <h1 className="text-xl font-bold">작업자 관리</h1>
          </div>
          <Link href="/workers/new">
            <Button size="lg" className="h-12">
              <UserPlus className="mr-2 h-4 w-4" />
              작업자 등록
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {workers && workers.length > 0 ? (
          <div className="space-y-3">
            {workers.map((worker: any) => (
              <Card key={worker.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{worker.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {worker.phone || "연락처 미등록"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-orange-600">
                        {worker.daily_wage?.toLocaleString()}원
                      </p>
                      <p className="text-xs text-muted-foreground">일당</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">등록된 작업자가 없습니다</p>
              <Link href="/workers/new">
                <Button size="lg" className="h-14">
                  <Plus className="mr-2" />
                  첫 작업자 등록하기
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
