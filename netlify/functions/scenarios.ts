// netlify/functions/scenarios.ts
import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { calculateROI, validateInputs, SimulationInputs } from './utils/calculator';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

export const handler: Handler = async (event) => {
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // GET - List all scenarios
    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ scenarios: data, success: true }),
      };
    }

    // POST - Save a new scenario
    if (event.httpMethod === 'POST') {
      const inputs: SimulationInputs = JSON.parse(event.body || '{}');

      // Set default for optional field
      if (inputs.one_time_implementation_cost === undefined) {
        inputs.one_time_implementation_cost = 0;
      }

      // Validate inputs
      const validationError = validateInputs(inputs);
      if (validationError) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: validationError }),
        };
      }

      // Calculate results
      const results = calculateROI(inputs);

      // Save to database
      const { data, error } = await supabase
        .from('scenarios')
        .insert([
          {
            scenario_name: inputs.scenario_name,
            monthly_invoice_volume: inputs.monthly_invoice_volume,
            num_ap_staff: inputs.num_ap_staff,
            avg_hours_per_invoice: inputs.avg_hours_per_invoice,
            hourly_wage: inputs.hourly_wage,
            error_rate_manual: inputs.error_rate_manual,
            error_cost: inputs.error_cost,
            time_horizon_months: inputs.time_horizon_months,
            one_time_implementation_cost: inputs.one_time_implementation_cost,
            monthly_savings: results.monthly_savings,
            payback_months: results.payback_months,
            roi_percentage: results.roi_percentage,
            cumulative_savings: results.cumulative_savings,
            net_savings: results.net_savings,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          scenario: data,
          results,
          success: true,
        }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Scenarios error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Database operation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};