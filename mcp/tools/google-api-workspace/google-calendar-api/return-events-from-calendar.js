/**
 * Function to return events from a specified Google Calendar.
 *
 * @param {Object} args - Arguments for the event retrieval.
 * @param {string} args.calendarId - The ID of the calendar to retrieve events from.
 * @param {boolean} [args.alwaysIncludeEmail=true] - Whether to include email addresses in the response.
 * @param {string} [args.eventTypes] - Types of events to include in the response.
 * @param {string} [args.iCalUID] - The iCal UID of the events to retrieve.
 * @param {number} [args.maxAttendees] - Maximum number of attendees to include in the response.
 * @param {number} [args.maxResults] - Maximum number of results to return.
 * @param {string} [args.orderBy] - Field to order the results by.
 * @param {string} [args.pageToken] - Token for pagination.
 * @param {string} [args.privateExtendedProperty] - Private extended property to filter events.
 * @param {string} [args.q] - Query string to filter events.
 * @param {string} [args.sharedExtendedProperty] - Shared extended property to filter events.
 * @param {boolean} [args.showDeleted=true] - Whether to include deleted events in the response.
 * @param {boolean} [args.showHiddenInvitations=true] - Whether to include hidden invitations in the response.
 * @param {boolean} [args.singleEvents=true] - Whether to expand recurring events into separate instances.
 * @param {string} [args.syncToken] - Token for synchronization.
 * @param {string} [args.timeMax] - Maximum time for event instances.
 * @param {string} [args.timeMin] - Minimum time for event instances.
 * @param {string} [args.timeZone] - Time zone for the events.
 * @param {string} [args.updatedMin] - Minimum update time for events.
 * @param {string} [args.alt='json'] - Data format for the response.
 * @param {string} [args.fields] - Selector specifying which fields to include in a partial response.
 * @param {string} [args.key] - API key for the request.
 * @param {string} [args.oauth_token] - OAuth 2.0 token for the current user.
 * @param {boolean} [args.prettyPrint=true] - Whether to pretty print the response.
 * @param {string} [args.quotaUser] - An opaque string that represents a user for quota purposes.
 * @param {string} [args.userIp] - Deprecated. Please use quotaUser instead.
 * @returns {Promise<Object>} - The result of the event retrieval.
 */
const executeFunction = async ({
  calendarId,
  alwaysIncludeEmail = true,
  eventTypes,
  iCalUID,
  maxAttendees,
  maxResults,
  orderBy,
  pageToken,
  privateExtendedProperty,
  q,
  sharedExtendedProperty,
  showDeleted = true,
  showHiddenInvitations = true,
  singleEvents = true,
  syncToken,
  timeMax,
  timeMin,
  timeZone,
  updatedMin,
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
  const apiKey = process.env.GOOGLE_API_WORKSPACE_API_KEY;

  try {
    // Construct the URL with query parameters
    const url = new URL(`${baseUrl}/calendars/${calendarId}/events`);
    url.searchParams.append('alwaysIncludeEmail', alwaysIncludeEmail);
    if (eventTypes) url.searchParams.append('eventTypes', eventTypes);
    if (iCalUID) url.searchParams.append('iCalUID', iCalUID);
    if (maxAttendees) url.searchParams.append('maxAttendees', maxAttendees);
    if (maxResults) url.searchParams.append('maxResults', maxResults);
    if (orderBy) url.searchParams.append('orderBy', orderBy);
    if (pageToken) url.searchParams.append('pageToken', pageToken);
    if (privateExtendedProperty) url.searchParams.append('privateExtendedProperty', privateExtendedProperty);
    if (q) url.searchParams.append('q', q);
    if (sharedExtendedProperty) url.searchParams.append('sharedExtendedProperty', sharedExtendedProperty);
    url.searchParams.append('showDeleted', showDeleted);
    url.searchParams.append('showHiddenInvitations', showHiddenInvitations);
    url.searchParams.append('singleEvents', singleEvents);
    if (syncToken) url.searchParams.append('syncToken', syncToken);
    if (timeMax) url.searchParams.append('timeMax', timeMax);
    if (timeMin) url.searchParams.append('timeMin', timeMin);
    if (timeZone) url.searchParams.append('timeZone', timeZone);
    if (updatedMin) url.searchParams.append('updatedMin', updatedMin);
    url.searchParams.append('alt', alt);
    if (fields) url.searchParams.append('fields', fields);
    if (apiKey) url.searchParams.append('key', apiKey);
    if (oauth_token) url.searchParams.append('oauth_token', oauth_token);
    url.searchParams.append('prettyPrint', prettyPrint);
    if (quotaUser) url.searchParams.append('quotaUser', quotaUser);
    if (userIp) url.searchParams.append('userIp', userIp);

    // Set up headers for the request
    const headers = {
      'Accept': 'application/json'
    };

    // If a token is provided, add it to the Authorization header
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

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
    console.error('Error retrieving events from calendar:', error);
    return { error: 'An error occurred while retrieving events from the calendar.' };
  }
};

/**
 * Tool configuration for retrieving events from a Google Calendar.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'return_events_from_calendar',
      description: 'Retrieve events from a specified Google Calendar.',
      parameters: {
        type: 'object',
        properties: {
          calendarId: {
            type: 'string',
            description: 'The ID of the calendar to retrieve events from.'
          },
          alwaysIncludeEmail: {
            type: 'boolean',
            description: 'Whether to include email addresses in the response.'
          },
          eventTypes: {
            type: 'string',
            description: 'Types of events to include in the response.'
          },
          iCalUID: {
            type: 'string',
            description: 'The iCal UID of the events to retrieve.'
          },
          maxAttendees: {
            type: 'integer',
            description: 'Maximum number of attendees to include in the response.'
          },
          maxResults: {
            type: 'integer',
            description: 'Maximum number of results to return.'
          },
          orderBy: {
            type: 'string',
            description: 'Field to order the results by.'
          },
          pageToken: {
            type: 'string',
            description: 'Token for pagination.'
          },
          privateExtendedProperty: {
            type: 'string',
            description: 'Private extended property to filter events.'
          },
          q: {
            type: 'string',
            description: 'Query string to filter events.'
          },
          sharedExtendedProperty: {
            type: 'string',
            description: 'Shared extended property to filter events.'
          },
          showDeleted: {
            type: 'boolean',
            description: 'Whether to include deleted events in the response.'
          },
          showHiddenInvitations: {
            type: 'boolean',
            description: 'Whether to include hidden invitations in the response.'
          },
          singleEvents: {
            type: 'boolean',
            description: 'Whether to expand recurring events into separate instances.'
          },
          syncToken: {
            type: 'string',
            description: 'Token for synchronization.'
          },
          timeMax: {
            type: 'string',
            description: 'Maximum time for event instances.'
          },
          timeMin: {
            type: 'string',
            description: 'Minimum time for event instances.'
          },
          timeZone: {
            type: 'string',
            description: 'Time zone for the events.'
          },
          updatedMin: {
            type: 'string',
            description: 'Minimum update time for events.'
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
            description: 'API key for the request.'
          },
          oauth_token: {
            type: 'string',
            description: 'OAuth 2.0 token for the current user.'
          },
          prettyPrint: {
            type: 'boolean',
            description: 'Whether to pretty print the response.'
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
        required: ['calendarId']
      }
    }
  }
};

export { apiTool };