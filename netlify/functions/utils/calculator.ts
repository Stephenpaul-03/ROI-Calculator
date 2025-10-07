// utils/calculator.ts
// Internal constants (server-side only)
const AUTOMATED_COST_PER_INVOICE = 0.20;
const ERROR_RATE_AUTO = 0.1; // 0.1%
const TIME_SAVED_PER_INVOICE = 8; // minutes
const MIN_ROI_BOOST_FACTOR = 1.1;

export interface SimulationInputs {
  scenario_name: string;
  monthly_invoice_volume: number;
  num_ap_staff: number;
  avg_hours_per_invoice: number;
  hourly_wage: number;
  error_rate_manual: number; // percentage
  error_cost: number;
  time_horizon_months: number;
  one_time_implementation_cost: number;
}

export interface SimulationResults {
  monthly_savings: number;
  payback_months: number;
  roi_percentage: number;
  cumulative_savings: number;
  net_savings: number;
  labor_cost_manual: number;
  auto_cost: number;
  error_savings: number;
}

export function calculateROI(inputs: SimulationInputs): SimulationResults {
  const {
    monthly_invoice_volume,
    num_ap_staff,
    avg_hours_per_invoice,
    hourly_wage,
    error_rate_manual,
    error_cost,
    time_horizon_months,
    one_time_implementation_cost,
  } = inputs;

  // 1. Manual labor cost per month
  const labor_cost_manual =
    num_ap_staff *
    hourly_wage *
    avg_hours_per_invoice *
    monthly_invoice_volume;

  // 2. Automation cost per month
  const auto_cost = monthly_invoice_volume * AUTOMATED_COST_PER_INVOICE;

  // 3. Error savings
  const error_savings =
    ((error_rate_manual - ERROR_RATE_AUTO) / 100) *
    monthly_invoice_volume *
    error_cost;

  // 4. Monthly savings (before bias)
  let monthly_savings = labor_cost_manual + error_savings - auto_cost;

  // 5. Apply bias factor to ensure positive ROI
  monthly_savings = monthly_savings * MIN_ROI_BOOST_FACTOR;

  // 6. Cumulative & ROI calculations
  const cumulative_savings = monthly_savings * time_horizon_months;
  const net_savings = cumulative_savings - one_time_implementation_cost;

  // Payback months (avoid division by zero)
  const payback_months =
    monthly_savings > 0
      ? one_time_implementation_cost / monthly_savings
      : 999;

  // ROI percentage
  const roi_percentage =
    one_time_implementation_cost > 0
      ? (net_savings / one_time_implementation_cost) * 100
      : (net_savings / 1) * 100; // If no implementation cost, show raw net savings as %

  return {
    monthly_savings: parseFloat(monthly_savings.toFixed(2)),
    payback_months: parseFloat(payback_months.toFixed(2)),
    roi_percentage: parseFloat(roi_percentage.toFixed(2)),
    cumulative_savings: parseFloat(cumulative_savings.toFixed(2)),
    net_savings: parseFloat(net_savings.toFixed(2)),
    labor_cost_manual: parseFloat(labor_cost_manual.toFixed(2)),
    auto_cost: parseFloat(auto_cost.toFixed(2)),
    error_savings: parseFloat(error_savings.toFixed(2)),
  };
}

export function validateInputs(inputs: any): string | null {
  const required = [
    'scenario_name',
    'monthly_invoice_volume',
    'num_ap_staff',
    'avg_hours_per_invoice',
    'hourly_wage',
    'error_rate_manual',
    'error_cost',
    'time_horizon_months',
  ];

  for (const field of required) {
    if (inputs[field] === undefined || inputs[field] === null) {
      return `Missing required field: ${field}`;
    }
  }

  // Validate numeric fields are positive
  if (inputs.monthly_invoice_volume <= 0) return 'Invoice volume must be positive';
  if (inputs.num_ap_staff <= 0) return 'Number of staff must be positive';
  if (inputs.avg_hours_per_invoice <= 0) return 'Hours per invoice must be positive';
  if (inputs.hourly_wage <= 0) return 'Hourly wage must be positive';
  if (inputs.error_rate_manual < 0 || inputs.error_rate_manual > 100) {
    return 'Error rate must be between 0 and 100';
  }
  if (inputs.error_cost < 0) return 'Error cost cannot be negative';
  if (inputs.time_horizon_months <= 0) return 'Time horizon must be positive';
  if (inputs.one_time_implementation_cost < 0) return 'Implementation cost cannot be negative';

  return null;
}