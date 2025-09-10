/**
 * Function to get an event from Google Calendar.
 *
 * @param {Object} args - Arguments for the event retrieval.
 * @param {string} args.calendarId - The ID of the calendar to retrieve the event from.
 * @param {string} args.eventId - The ID of the event to retrieve.
 * @param {boolean} [args.alwaysIncludeEmail=true] - Whether to include email addresses in the response.
 * @param {number} [args.maxAttendees=100] - The maximum number of attendees to include in the response.
 * @param {string} [args.timeZone='UTC'] - The time zone for the event.
 * @param {boolean} [args.prettyPrint=true] - Whether to format the response for readability.
 * @returns {Promise<Object>} - The event data retrieved from Google Calendar.
 */
const executeFunction = async ({ calendarId, eventId, alwaysIncludeEmail = true, maxAttendees = 100, timeZone = 'UTC', prettyPrint = true }) => {
  const baseUrl = 'https://www.googleapis.com/calendar/v3';
  const apiKey = process.env.GOOGLE_API_WORKSPACE_API_KEY;
  const oauthToken = ''; // will be provided by the user

  try {
    // Construct the URL with path variables and query parameters
    const url = new URL(`${baseUrl}/calendars/${calendarId}/events/${eventId}`);
    url.searchParams.append('alwaysIncludeEmail', alwaysIncludeEmail);
    url.searchParams.append('maxAttendees', maxAttendees);
    url.searchParams.append('timeZone', timeZone);
    url.searchParams.append('alt', 'json');
    url.searchParams.append('key', apiKey);
    url.searchParams.append('oauth_token', oauthToken);
    url.searchParams.append('prettyPrint', prettyPrint);

    // Set up headers for the request
    const headers = {
      'Accept': 'application/json'
    };

    // Perform the fetch request
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers
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
    console.error('Error retrieving event:', error);
    return { error: 'An error occurred while retrieving the event.' };
  }
};

/**
 * Tool configuration for getting an event from Google Calendar.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_event',
      description: 'Retrieve an event from Google Calendar.',
      parameters: {
        type: 'object',
        properties: {
          calendarId: {
            type: 'string',
            description: 'The ID of the calendar to retrieve the event from.'
          },
          eventId: {
            type: 'string',
            description: 'The ID of the event to retrieve.'
          },
          alwaysIncludeEmail: {
            type: 'boolean',
            description: 'Whether to include email addresses in the response.'
          },
          maxAttendees: {
            type: 'integer',
            description: 'The maximum number of attendees to include in the response.'
          },
          timeZone: {
            type: 'string',
            description: 'The time zone for the event.'
          },
          prettyPrint: {
            type: 'boolean',
            description: 'Whether to format the response for readability.'
          }
        },
        required: ['calendarId', 'eventId']
      }
    }
  }
};

export { apiTool };