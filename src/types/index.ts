// Common interfaces for type safety across the application

export interface Worker {
    id: string;
    name: string;
    phone?: string;
    daily_wage: number;
    user_id: string;
    created_at: string;
}

export interface LaborLog {
    id: string;
    project_id: string;
    worker_id: string;
    work_date: string;
    status: "full" | "half";
    notes?: string;
    created_at: string;
    workers?: Worker;
}

export interface Project {
    id: string;
    name: string;
    client?: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    budget?: number;
    status?: "active" | "completed" | "paused";
    user_id: string;
    created_at: string;
}

export interface Expense {
    id: string;
    project_id: string;
    amount: number;
    category: string;
    vendor_name?: string;
    expense_date: string;
    description?: string;
    image_url?: string;
    ocr_data?: Record<string, unknown>;
    user_id: string;
    created_at: string;
}

export type ExpenseCategory = "material" | "labor" | "food" | "fuel" | "other";

export interface CategoryInfo {
    value: string;
    label: string;
    color?: string;
    bg?: string;
}
