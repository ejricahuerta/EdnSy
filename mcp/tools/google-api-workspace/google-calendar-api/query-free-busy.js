/**
 * Function to query free/busy information for a set of calendars using the Google Calendar API.
 *
 * @param {Object} args - Arguments for the free/busy query.
 * @param {Array} args.items - An array of objects containing calendar IDs to query.
 * @param {string} args.timeMin - The minimum time for event instances.
 * @param {string} args.timeMax - The maximum time for event instances.
 * @param {string} [args.timeZone="UTC"] - The time zone for the query.
 * @returns {Promise<Object>} - The result of the free/busy query.
 */
const executeFunction = async ({ items, timeMin, timeMax, timeZone = "UTC" }) => {
  const baseUrl = 'https://www.googleapis.com/calendar/v3';
  const token = process.env.GOOGLE_API_WORKSPACE_API_KEY;
  try {
    // Construct the request body
    const body = {
      items,
      timeMin,
      timeMax,
      timeZone
    };

    // Set up headers for the request
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // If a token is provided, add it to the Authorization header
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Perform the fetch request
    const response = await fetch(`${baseUrl}/freeBusy`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData);
    }

    // Parse and return the response data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error querying free/busy information:', error);
    return { error: 'An error occurred while querying free/busy information.' };
  }
};

/**
 * Tool configuration for querying free/busy information on Google Calendar.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'query_free_busy',
      description: 'Query free/busy information for a set of calendars.',
      parameters: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            description: 'An array of objects containing calendar IDs to query.'
          },
          timeMin: {
            type: 'string',
            description: 'The minimum time for event instances.'
          },
          timeMax: {
            type: 'string',
            description: 'The maximum time for event instances.'
          },
          timeZone: {
            type: 'string',
            description: 'The time zone for the query.'
          }
        },
        required: ['items', 'timeMin', 'timeMax']
      }
    }
  }
};

export { apiTool };