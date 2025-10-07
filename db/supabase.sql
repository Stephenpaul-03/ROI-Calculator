-- Create scenarios table
CREATE TABLE scenarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_name TEXT NOT NULL,
  monthly_invoice_volume INTEGER NOT NULL,
  num_ap_staff INTEGER NOT NULL,
  avg_hours_per_invoice DECIMAL(10, 4) NOT NULL,
  hourly_wage DECIMAL(10, 2) NOT NULL,
  error_rate_manual DECIMAL(5, 2) NOT NULL,
  error_cost DECIMAL(10, 2) NOT NULL,
  time_horizon_months INTEGER NOT NULL,
  one_time_implementation_cost DECIMAL(10, 2) DEFAULT 0,
  
  -- Calculated results
  monthly_savings DECIMAL(10, 2),
  payback_months DECIMAL(10, 2),
  roi_percentage DECIMAL(10, 2),
  cumulative_savings DECIMAL(10, 2),
  net_savings DECIMAL(10, 2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table for email capture
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_scenarios_created_at ON scenarios(created_at DESC);
CREATE INDEX idx_reports_email ON reports(email);
CREATE INDEX idx_reports_scenario_id ON reports(scenario_id);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your needs)
CREATE POLICY "Allow public read access to scenarios" ON scenarios
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert to scenarios" ON scenarios
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to scenarios" ON scenarios
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete to scenarios" ON scenarios
  FOR DELETE USING (true);

CREATE POLICY "Allow public insert to reports" ON reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to reports" ON reports
  FOR SELECT USING (true);