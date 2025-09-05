/**
 * Function to update an event in Google Calendar.
 *
 * @param {Object} args - Arguments for updating the event.
 * @param {string} args.calendarId - The ID of the calendar containing the event.
 * @param {string} args.eventId - The ID of the event to update.
 * @param {Object} args.eventData - The data to update the event with.
 * @param {boolean} [args.alwaysIncludeEmail=true] - Whether to always include email addresses in the response.
 * @param {number} [args.conferenceDataVersion=54806309] - The version of the conference data.
 * @param {number} [args.maxAttendees=54806309] - The maximum number of attendees.
 * @param {boolean} [args.sendNotifications=true] - Whether to send notifications about the update.
 * @param {string} [args.sendUpdates='all'] - Specifies who should receive updates about the event.
 * @param {boolean} [args.supportsAttachments=true] - Whether the event supports attachments.
 * @returns {Promise<Object>} - The result of the event update.
 */
const executeFunction = async ({ calendarId, eventId, eventData, alwaysIncludeEmail = true, conferenceDataVersion = 54806309, maxAttendees = 54806309, sendNotifications = true, sendUpdates = 'all', supportsAttachments = true }) => {
  const baseUrl = 'https://www.googleapis.com/calendar/v3';
  const token = process.env.GOOGLE_API_WORKSPACE_API_KEY;
  const apiKey = process.env.GOOGLE_API_WORKSPACE_API_KEY;

  try {
    // Construct the URL with path variables and query parameters
    const url = new URL(`${baseUrl}/calendars/${calendarId}/events/${eventId}`);
    url.searchParams.append('alwaysIncludeEmail', alwaysIncludeEmail);
    url.searchParams.append('conferenceDataVersion', conferenceDataVersion);
    url.searchParams.append('maxAttendees', maxAttendees);
    url.searchParams.append('sendNotifications', sendNotifications);
    url.searchParams.append('sendUpdates', sendUpdates);
    url.searchParams.append('supportsAttachments', supportsAttachments);
    url.searchParams.append('key', apiKey);
    url.searchParams.append('oauth_token', token);
    url.searchParams.append('prettyPrint', true);

    // Set up headers for the request
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Perform the fetch request
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers,
      body: JSON.stringify(eventData)
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
    console.error('Error updating event:', error);
    return { error: 'An error occurred while updating the event.' };
  }
};

/**
 * Tool configuration for updating an event in Google Calendar.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'update_event',
      description: 'Update an event in Google Calendar.',
      parameters: {
        type: 'object',
        properties: {
          calendarId: {
            type: 'string',
            description: 'The ID of the calendar containing the event.'
          },
          eventId: {
            type: 'string',
            description: 'The ID of the event to update.'
          },
          eventData: {
            type: 'object',
            description: 'The data to update the event with.'
          },
          alwaysIncludeEmail: {
            type: 'boolean',
            description: 'Whether to always include email addresses in the response.'
          },
          conferenceDataVersion: {
            type: 'integer',
            description: 'The version of the conference data.'
          },
          maxAttendees: {
            type: 'integer',
            description: 'The maximum number of attendees.'
          },
          sendNotifications: {
            type: 'boolean',
            description: 'Whether to send notifications about the update.'
          },
          sendUpdates: {
            type: 'string',
            description: 'Specifies who should receive updates about the event.'
          },
          supportsAttachments: {
            type: 'boolean',
            description: 'Whether the event supports attachments.'
          }
        },
        required: ['calendarId', 'eventId', 'eventData']
      }
    }
  }
};

export { apiTool };