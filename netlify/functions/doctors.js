// Netlify Function to proxy Airtable API requests
// Keeps the API key server-side and secure

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = 'appR8sQwaCx42Z6GP';
const TABLE_NAME = 'Eon Doctors Database';

export async function handler(event, context) {
  // Only accept GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Validate API key is configured
  if (!AIRTABLE_API_KEY) {
    console.error('AIRTABLE_API_KEY is not configured');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' }),
    };
  }

  const allRecords = [];
  let offset = null;

  try {
    // Fetch all records from Airtable with pagination
    do {
      const url = new URL(
        `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`
      );

      if (offset) {
        url.searchParams.set('offset', offset);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      allRecords.push(...data.records);
      offset = data.offset; // Will be undefined when no more pages
    } while (offset);

    // Return the records with appropriate headers
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
      body: JSON.stringify(allRecords),
    };
  } catch (error) {
    console.error('Error fetching doctors from Airtable:', error);

    // Return appropriate error status based on error type
    if (error.message.includes('429')) {
      return {
        statusCode: 429,
        body: JSON.stringify({ error: 'Rate limited by Airtable' }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch doctor data' }),
    };
  }
}
