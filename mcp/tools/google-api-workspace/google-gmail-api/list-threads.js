/**
 * Function to list threads in the user's Gmail mailbox.
 *
 * @param {Object} args - Arguments for listing threads.
 * @param {string} [args.userId='me'] - The user's email address. The special value "me" indicates the authenticated user.
 * @param {number} [args.maxResults] - The maximum number of threads to return.
 * @param {string} [args.pageToken] - Token for pagination.
 * @param {string} [args.q] - Search query.
 * @param {Array<string>} [args.labelIds] - Only return threads with these label IDs.
 * @param {boolean} [args.includeSpamTrash] - Include threads from spam and trash.
 * @returns {Promise<Object>} - The result of the threads listing.
 */
const executeFunction = async ({ userId = 'me', maxResults, pageToken, q, labelIds, includeSpamTrash }) => {
  const baseUrl = 'https://gmail.googleapis.com';
  const accessToken = ''; // will be provided by the user

  try {
    // Construct the URL with query parameters
    const url = new URL(`${baseUrl}/gmail/v1/users/${userId}/threads`);
    if (maxResults) url.searchParams.append('maxResults', maxResults);
    if (pageToken) url.searchParams.append('pageToken', pageToken);
    if (q) url.searchParams.append('q', q);
    if (labelIds) url.searchParams.append('labelIds', labelIds.join(','));
    if (includeSpamTrash) url.searchParams.append('includeSpamTrash', includeSpamTrash);

    // Set up headers for the request
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
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
    console.error('Error listing threads:', error);
    return { error: 'An error occurred while listing threads.' };
  }
};

/**
 * Tool configuration for listing threads in Gmail.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'list_threads',
      description: 'List threads in the user\'s Gmail mailbox.',
      parameters: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'The user\'s email address or "me" for the authenticated user.'
          },
          maxResults: {
            type: 'integer',
            description: 'The maximum number of threads to return.'
          },
          pageToken: {
            type: 'string',
            description: 'Token for pagination.'
          },
          q: {
            type: 'string',
            description: 'Search query.'
          },
          labelIds: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Only return threads with these label IDs.'
          },
          includeSpamTrash: {
            type: 'boolean',
            description: 'Include threads from spam and trash.'
          }
        },
        required: []
      }
    }
  }
};

export { apiTool };