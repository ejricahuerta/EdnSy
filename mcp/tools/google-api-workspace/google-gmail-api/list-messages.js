/**
 * Function to list messages in the user's Gmail mailbox.
 *
 * @param {Object} args - Arguments for listing messages.
 * @param {string} [args.userId='me'] - The user's email address. The special value "me" indicates the authenticated user.
 * @param {number} [args.maxResults=10] - The maximum number of messages to return.
 * @param {string} [args.pageToken] - Token for pagination.
 * @param {string} [args.q] - Query string for searching messages.
 * @returns {Promise<Object>} - The result of the messages listing.
 */
const executeFunction = async ({ userId = 'me', maxResults = 10, pageToken, q }) => {
  const baseUrl = 'https://gmail.googleapis.com';
  const accessToken = ''; // will be provided by the user
  try {
    // Construct the URL with query parameters
    const url = new URL(`${baseUrl}/gmail/v1/users/${userId}/messages`);
    url.searchParams.append('maxResults', maxResults.toString());
    if (pageToken) url.searchParams.append('pageToken', pageToken);
    if (q) url.searchParams.append('q', q);

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
    console.error('Error listing messages:', error);
    return { error: 'An error occurred while listing messages.' };
  }
};

/**
 * Tool configuration for listing messages in Gmail.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'list_messages',
      description: 'List messages in the user\'s Gmail mailbox.',
      parameters: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'The user\'s email address or "me" for the authenticated user.'
          },
          maxResults: {
            type: 'integer',
            description: 'The maximum number of messages to return.'
          },
          pageToken: {
            type: 'string',
            description: 'Token for pagination.'
          },
          q: {
            type: 'string',
            description: 'Query string for searching messages.'
          }
        },
        required: []
      }
    }
  }
};

export { apiTool };