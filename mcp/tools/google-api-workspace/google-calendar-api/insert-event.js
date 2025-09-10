/**
 * Function to insert an event into Google Calendar.
 *
 * @param {Object} args - Arguments for the event insertion.
 * @param {string} args.calendarId - The ID of the calendar to operate on.
 * @param {string} args.eventId - The ID of the event to retrieve instances for.
 * @param {boolean} [args.alwaysIncludeEmail=true] - Whether to always include email addresses in the response.
 * @param {number} [args.maxAttendees=10] - The maximum number of attendees to include in the response.
 * @param {number} [args.maxResults=10] - The maximum number of results to return.
 * @param {string} [args.originalStart] - The original start time of the event.
 * @param {string} [args.pageToken] - Token for pagination.
 * @param {boolean} [args.showDeleted=false] - Whether to include deleted events.
 * @param {string} [args.timeMax] - The maximum time for event instances.
 * @param {string} [args.timeMin] - The minimum time for event instances.
 * @param {string} [args.timeZone] - The time zone for the event.
 * @param {string} [args.alt='json'] - Data format for the response.
 * @param {string} [args.fields] - Selector specifying which fields to include in a partial response.
 * @param {string} [args.key] - API key for the project.
 * @param {string} [args.oauth_token] - OAuth 2.0 token for the current user.
 * @param {boolean} [args.prettyPrint=true] - Whether to return the response with indentations and line breaks.
 * @param {string} [args.quotaUser] - An opaque string that represents a user for quota purposes.
 * @param {string} [args.userIp] - Deprecated. Please use quotaUser instead.
 * @returns {Promise<Object>} - The result of the event insertion.
 */
const executeFunction = async ({
  calendarId,
  eventId,
  alwaysIncludeEmail = true,
  maxAttendees = 10,
  maxResults = 10,
  originalStart,
  pageToken,
  showDeleted = false,
  timeMax,
  timeMin,
  timeZone,
  alt = 'json',
  fields,
  key,
  oauth_token,
  prettyPrint = true,
  quotaUser,
  userIp
}) => {
  const baseUrl = 'https://www.googleapis.com/calendar/v3';
  const token = process.env.GOOGLE_API_WORKSPACE_API_KEY;
  try {
    // Construct the URL with path and query parameters
    const url = new URL(`${baseUrl}/calendars/${calendarId}/events/${eventId}/instances`);
    url.searchParams.append('alwaysIncludeEmail', alwaysIncludeEmail);
    url.searchParams.append('maxAttendees', maxAttendees);
    url.searchParams.append('maxResults', maxResults);
    if (originalStart) url.searchParams.append('originalStart', originalStart);
    if (pageToken) url.searchParams.append('pageToken', pageToken);
    url.searchParams.append('showDeleted', showDeleted);
    if (timeMax) url.searchParams.append('timeMax', timeMax);
    if (timeMin) url.searchParams.append('timeMin', timeMin);
    if (timeZone) url.searchParams.append('timeZone', timeZone);
    url.searchParams.append('alt', alt);
    if (fields) url.searchParams.append('fields', fields);
    if (key) url.searchParams.append('key', key);
    if (oauth_token) url.searchParams.append('oauth_token', oauth_token);
    url.searchParams.append('prettyPrint', prettyPrint);
    if (quotaUser) url.searchParams.append('quotaUser', quotaUser);
    if (userIp) url.searchParams.append('userIp', userIp);

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
    console.error('Error inserting event:', error);
    return { error: 'An error occurred while inserting the event.' };
  }
};

/**
 * Tool configuration for inserting an event into Google Calendar.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'insert_event',
      description: 'Insert an event into Google Calendar.',
      parameters: {
        type: 'object',
        properties: {
          calendarId: {
            type: 'string',
            description: 'The ID of the calendar to operate on.'
          },
          eventId: {
            type: 'string',
            description: 'The ID of the event to retrieve instances for.'
          },
          alwaysIncludeEmail: {
            type: 'boolean',
            description: 'Whether to always include email addresses in the response.'
          },
          maxAttendees: {
            type: 'integer',
            description: 'The maximum number of attendees to include in the response.'
          },
          maxResults: {
            type: 'integer',
            description: 'The maximum number of results to return.'
          },
          originalStart: {
            type: 'string',
            description: 'The original start time of the event.'
          },
          pageToken: {
            type: 'string',
            description: 'Token for pagination.'
          },
          showDeleted: {
            type: 'boolean',
            description: 'Whether to include deleted events.'
          },
          timeMax: {
            type: 'string',
            description: 'The maximum time for event instances.'
          },
          timeMin: {
            type: 'string',
            description: 'The minimum time for event instances.'
          },
          timeZone: {
            type: 'string',
            description: 'The time zone for the event.'
          },
          alt: {
            type: 'string',
            description: 'Data format for the response.'
          },
          fields: {
            type: 'string',
            description: 'Selector specifying which fields to include in a partial response.'
          },
          key: {
            type: 'string',
            description: 'API key for the project.'
          },
          oauth_token: {
            type: 'string',
            description: 'OAuth 2.0 token for the current user.'
          },
          prettyPrint: {
            type: 'boolean',
            description: 'Whether to return the response with indentations and line breaks.'
          },
          quotaUser: {
            type: 'string',
            description: 'An opaque string that represents a user for quota purposes.'
          },
          userIp: {
            type: 'string',
            description: 'Deprecated. Please use quotaUser instead.'
          }
        },
        required: ['calendarId', 'eventId']
      }
    }
  }
};

export { apiTool };