/**
 * Function to create an event in Google Calendar.
 *
 * @param {Object} args - Arguments for the event creation.
 * @param {string} args.calendarId - The ID of the calendar to create the event in.
 * @param {Object} args.event - The event details to create.
 * @param {Object} args.authContext - Authentication context from landing app.
 * @param {Object} args.userContext - User context information.
 * @returns {Promise<Object>} - The result of the event creation.
 */
const executeFunction = async ({ calendarId, event, authContext, userContext }) => {
  const baseUrl = 'https://www.googleapis.com/calendar/v3';
  
  try {
    // Get authentication token from auth context
    let oauth_token;
    if (authContext && authContext.google && authContext.google.access_token) {
      oauth_token = authContext.google.access_token;
    } else {
      throw new Error('Google authentication token not found. Please ensure you have connected your Google account.');
    }

    // Construct the URL with query parameters
    const url = new URL(`${baseUrl}/calendars/${calendarId}/events`);
    url.searchParams.append('oauth_token', oauth_token);

    // Set up headers for the request
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Perform the fetch request
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify(event)
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
    console.error('Error creating event:', error);
    return { error: 'An error occurred while creating the event.' };
  }
};

/**
 * Tool configuration for creating an event in Google Calendar.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'create_event',
      description: 'Create an event in Google Calendar.',
      parameters: {
        type: 'object',
        properties: {
          calendarId: {
            type: 'string',
            description: 'The ID of the calendar to create the event in.'
          },
          event: {
            type: 'object',
            description: 'The event details to create.'
          },
          mcpUserId: {
            type: 'string',
            description: 'The ID of the user making the request (required for authentication).'
          }
        },
        required: ['calendarId', 'event', 'mcpUserId']
      }
    }
  }
};

export { apiTool };