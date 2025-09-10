/**
 * Function to quickly add an event to a Google Calendar.
 *
 * @param {Object} args - Arguments for adding the event.
 * @param {string} args.calendarId - The ID of the calendar to which the event will be added.
 * @param {string} args.text - The text description of the event to be created.
 * @param {boolean} [args.sendNotifications=true] - Whether to send notifications about the event.
 * @param {string} [args.sendUpdates="all"] - Specifies who should receive updates about the event.
 * @returns {Promise<Object>} - The result of the event creation.
 */
const executeFunction = async ({ calendarId, text, sendNotifications = true, sendUpdates = 'all' }) => {
  const baseUrl = 'https://www.googleapis.com/calendar/v3';
  const apiKey = process.env.GOOGLE_API_WORKSPACE_API_KEY;
  const oauthToken = ''; // will be provided by the user

  try {
    // Construct the URL for the quick add event
    const url = new URL(`${baseUrl}/calendars/${calendarId}/events/quickAdd`);
    url.searchParams.append('text', text);
    url.searchParams.append('sendNotifications', sendNotifications.toString());
    url.searchParams.append('sendUpdates', sendUpdates);
    url.searchParams.append('alt', 'json');
    url.searchParams.append('key', apiKey);
    url.searchParams.append('oauth_token', oauthToken);
    url.searchParams.append('prettyPrint', 'true');

    // Set up headers for the request
    const headers = {
      'Accept': 'application/json'
    };

    // Perform the fetch request
    const response = await fetch(url.toString(), {
      method: 'POST',
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
    console.error('Error adding event to calendar:', error);
    return { error: 'An error occurred while adding the event to the calendar.' };
  }
};

/**
 * Tool configuration for quickly adding an event to Google Calendar.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'quick_add_event',
      description: 'Quickly add an event to a Google Calendar.',
      parameters: {
        type: 'object',
        properties: {
          calendarId: {
            type: 'string',
            description: 'The ID of the calendar to which the event will be added.'
          },
          text: {
            type: 'string',
            description: 'The text description of the event to be created.'
          },
          sendNotifications: {
            type: 'boolean',
            description: 'Whether to send notifications about the event.'
          },
          sendUpdates: {
            type: 'string',
            description: 'Specifies who should receive updates about the event.'
          }
        },
        required: ['calendarId', 'text']
      }
    }
  }
};

export { apiTool };