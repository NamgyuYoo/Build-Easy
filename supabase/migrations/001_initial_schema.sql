-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE,
  budget INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workers table
CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  daily_wage INTEGER NOT NULL,
  resident_number TEXT, -- 주민번호 앞자리
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('material', 'food', 'fuel', 'labor', 'other')),
  amount INTEGER NOT NULL,
  vendor_name TEXT,
  description TEXT,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Labor logs table
CREATE TABLE IF NOT EXISTS labor_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('full', 'half')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, worker_id, work_date)
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for workers
CREATE POLICY "Users can view their own workers"
  ON workers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workers"
  ON workers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workers"
  ON workers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workers"
  ON workers FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for expenses (via project ownership)
CREATE POLICY "Users can view expenses from their projects"
  ON expenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = expenses.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert expenses to their projects"
  ON expenses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = expenses.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update expenses in their projects"
  ON expenses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = expenses.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete expenses from their projects"
  ON expenses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = expenses.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for labor_logs (via project ownership)
CREATE POLICY "Users can view labor logs from their projects"
  ON labor_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = labor_logs.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert labor logs to their projects"
  ON labor_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = labor_logs.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update labor logs in their projects"
  ON labor_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = labor_logs.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete labor logs from their projects"
  ON labor_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = labor_logs.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_workers_user_id ON workers(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_project_id ON expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_labor_logs_project_id ON labor_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_labor_logs_date ON labor_logs(work_date);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workers_updated_at
  BEFORE UPDATE ON workers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_labor_logs_updated_at
  BEFORE UPDATE ON labor_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
