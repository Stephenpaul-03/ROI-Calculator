// netlify/functions/generate-report.ts
import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

function generateHTMLReport(scenario: any, email: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ROI Analysis Report - ${scenario.scenario_name}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f5f5f5;
    }
    .report-container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      color: #2563eb;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 10px;
    }
    h2 {
      color: #1e40af;
      margin-top: 30px;
    }
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    .metric-card {
      background: #f8fafc;
      padding: 20px;
      border-radius: 6px;
      border-left: 4px solid #2563eb;
    }
    .metric-label {
      font-size: 14px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .metric-value {
      font-size: 28px;
      font-weight: bold;
      color: #1e293b;
      margin-top: 5px;
    }
    .highlight {
      background: #dbeafe;
      padding: 20px;
      border-radius: 6px;
      margin: 20px 0;
      border-left: 4px solid #2563eb;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    th {
      background: #f1f5f9;
      font-weight: 600;
      color: #475569;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 14px;
      color: #64748b;
    }
    .positive {
      color: #059669;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="report-container">
    <h1>📊 ROI Analysis Report</h1>
    <p><strong>Scenario:</strong> ${scenario.scenario_name}</p>
    <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
    <p><strong>Prepared for:</strong> ${email}</p>

    <div class="highlight">
      <h3 style="margin-top: 0;">Executive Summary</h3>
      <p>By switching to automated invoicing, your organization can achieve significant cost savings and operational efficiency improvements.</p>
    </div>

    <h2>Key Results</h2>
    <div class="metric-grid">
      <div class="metric-card">
        <div class="metric-label">Monthly Savings</div>
        <div class="metric-value positive">$${scenario.monthly_savings.toLocaleString()}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Payback Period</div>
        <div class="metric-value">${scenario.payback_months.toFixed(1)} months</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">ROI (${scenario.time_horizon_months} months)</div>
        <div class="metric-value positive">${scenario.roi_percentage.toFixed(1)}%</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Net Savings</div>
        <div class="metric-value positive">$${scenario.net_savings.toLocaleString()}</div>
      </div>
    </div>

    <h2>Input Parameters</h2>
    <table>
      <tr>
        <th>Parameter</th>
        <th>Value</th>
      </tr>
      <tr>
        <td>Monthly Invoice Volume</td>
        <td>${scenario.monthly_invoice_volume.toLocaleString()}</td>
      </tr>
      <tr>
        <td>AP Staff</td>
        <td>${scenario.num_ap_staff}</td>
      </tr>
      <tr>
        <td>Avg Hours per Invoice</td>
        <td>${scenario.avg_hours_per_invoice}</td>
      </tr>
      <tr>
        <td>Hourly Wage</td>
        <td>$${scenario.hourly_wage}</td>
      </tr>
      <tr>
        <td>Manual Error Rate</td>
        <td>${scenario.error_rate_manual}%</td>
      </tr>
      <tr>
        <td>Cost per Error</td>
        <td>$${scenario.error_cost}</td>
      </tr>
      <tr>
        <td>Time Horizon</td>
        <td>${scenario.time_horizon_months} months</td>
      </tr>
      <tr>
        <td>Implementation Cost</td>
        <td>$${scenario.one_time_implementation_cost.toLocaleString()}</td>
      </tr>
    </table>

    <h2>Financial Projection</h2>
    <div class="highlight">
      <p><strong>Cumulative Savings (${scenario.time_horizon_months} months):</strong> <span class="positive">$${scenario.cumulative_savings.toLocaleString()}</span></p>
      <p><strong>Less Implementation Cost:</strong> -$${scenario.one_time_implementation_cost.toLocaleString()}</p>
      <p><strong>Net Savings:</strong> <span class="positive">$${scenario.net_savings.toLocaleString()}</span></p>
    </div>

    <div class="footer">
      <p>This report was generated automatically based on the input parameters provided. Results are estimates and actual savings may vary based on specific implementation and operational factors.</p>
      <p><strong>ROI Invoicing Simulator</strong> | ${new Date().toLocaleDateString()}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export const handler: Handler = async (event) => {
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { scenario_id, email } = JSON.parse(event.body || '{}');

    if (!scenario_id || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'scenario_id and email are required' }),
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email format' }),
      };
    }

    // Fetch scenario
    const { data: scenario, error: fetchError } = await supabase
      .from('scenarios')
      .select('*')
      .eq('id', scenario_id)
      .single();

    if (fetchError) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Scenario not found' }),
      };
    }

    // Log email capture
    await supabase.from('reports').insert([
      {
        scenario_id,
        email,
      },
    ]);

    // Generate HTML report
    const htmlReport = generateHTMLReport(scenario, email);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'text/html',
      },
      body: htmlReport,
    };
  } catch (error) {
    console.error('Report generation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to generate report',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};