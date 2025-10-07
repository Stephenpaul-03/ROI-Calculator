// netlify/functions/simulate.ts
import { Handler } from '@netlify/functions';
import { calculateROI, validateInputs, SimulationInputs } from './utils/calculator';

export const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

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

    // Calculate ROI
    const results = calculateROI(inputs);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        inputs,
        results,
        success: true,
      }),
    };
  } catch (error) {
    console.error('Simulation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to calculate simulation',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};