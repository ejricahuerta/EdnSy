/**
 * Function to delete an event from a Google Calendar.
 *
 * @param {Object} args - Arguments for the delete event operation.
 * @param {string} args.calendarId - The ID of the calendar from which to delete the event.
 * @param {string} args.eventId - The ID of the event to delete.
 * @param {boolean} [args.sendNotifications=true] - Whether to send notifications about the deletion.
 * @param {string} [args.sendUpdates] - Indicates who should receive updates about the deletion.
 * @param {Object} args.authContext - Authentication context from landing app.
 * @param {Object} args.userContext - User context information.
 * @returns {Promise<Object>} - The result of the delete event operation.
 */
const executeFunction = async ({ calendarId, eventId, sendNotifications = true, sendUpdates, authContext, userContext }) => {
  const baseUrl = 'https://www.googleapis.com/calendar/v3';
  
  try {
    // Get authentication token from auth context
    let oauth_token;
    if (authContext && authContext.google && authContext.google.access_token) {
      oauth_token = authContext.google.access_token;
    } else {
      throw new Error('Google authentication token not found. Please ensure you have connected your Google account.');
    }

    // Construct the URL with essential parameters
    const url = `${baseUrl}/calendars/${calendarId}/events/${eventId}?sendNotifications=${sendNotifications}&oauth_token=${oauth_token}`;

    // Set up headers for the request
    const headers = {
      'Content-Type': 'application/json'
    };

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'DELETE',
      headers
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData);
    }

    // Return the response data
    return { status: response.status, message: 'Event deleted successfully.' };
  } catch (error) {
    console.error('Error deleting event:', error);
    return { error: 'An error occurred while deleting the event.' };
  }
};

/**
 * Tool configuration for deleting an event from Google Calendar.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'delete_event',
      description: 'Delete an event from Google Calendar.',
      parameters: {
        type: 'object',
        properties: {
          calendarId: {
            type: 'string',
            description: 'The ID of the calendar from which to delete the event.'
          },
          eventId: {
            type: 'string',
            description: 'The ID of the event to delete.'
          },
          sendNotifications: {
            type: 'boolean',
            description: 'Whether to send notifications about the deletion.'
          },
          sendUpdates: {
            type: 'string',
            description: 'Indicates who should receive updates about the deletion.'
          },
          mcpUserId: {
            type: 'string',
            description: 'The ID of the user making the request (required for authentication).'
          }
        },
        required: ['calendarId', 'eventId', 'mcpUserId']
      }
    }
  }
};

export { apiTool };