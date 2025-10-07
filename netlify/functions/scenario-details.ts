// netlify/functions/scenario-detail.ts
import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

export const handler: Handler = async (event) => {
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Extract ID from path
  const id = event.path.split('/').pop();

  if (!id) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Scenario ID is required' }),
    };
  }

  try {
    // GET - Retrieve specific scenario
    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Scenario not found' }),
          };
        }
        throw error;
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ scenario: data, success: true }),
      };
    }

    // DELETE - Delete specific scenario
    if (event.httpMethod === 'DELETE') {
      const { error } = await supabase
        .from('scenarios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Scenario deleted successfully' 
        }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Scenario detail error:', error);
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