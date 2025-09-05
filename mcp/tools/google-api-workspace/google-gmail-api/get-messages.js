/**
 * Function to get a specified message from Gmail.
 *
 * @param {Object} args - Arguments for the message retrieval.
 * @param {string} args.userId - The user's email address or "me" to indicate the authenticated user.
 * @param {string} args.id - The ID of the message to retrieve.
 * @param {string} [args.format] - The format of the response (e.g., "full", "metadata").
 * @param {string} [args.metadataHeaders] - Comma-separated list of metadata headers to return.
 * @param {string} [args.alt] - The data format for the response (e.g., "json").
 * @param {string} [args.fields] - Selector specifying which fields to include in a partial response.
 * @param {string} [args.prettyPrint] - Returns response with indentations and line breaks.
 * @returns {Promise<Object>} - The result of the message retrieval.
 */
const executeFunction = async ({ userId, id, format, metadataHeaders, alt, fields, prettyPrint }) => {
  const baseUrl = 'https://gmail.googleapis.com';
  const accessToken = ''; // will be provided by the user

  try {
    // Construct the URL with path and query parameters
    const url = new URL(`${baseUrl}/gmail/v1/users/${userId}/messages/${id}`);
    if (format) url.searchParams.append('format', format);
    if (metadataHeaders) url.searchParams.append('metadataHeaders', metadataHeaders);
    if (alt) url.searchParams.append('alt', alt);
    if (fields) url.searchParams.append('fields', fields);
    if (prettyPrint) url.searchParams.append('prettyPrint', prettyPrint);
    
    // Set up headers for the request
    const headers = {
      'Accept': 'application/json',
    };

    // If an access token is provided, add it to the Authorization header
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
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
    console.error('Error retrieving message:', error);
    return { error: 'An error occurred while retrieving the message.' };
  }
};

/**
 * Tool configuration for getting messages from Gmail.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_message',
      description: 'Get a specified message from Gmail.',
      parameters: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'The user\'s email address or "me" to indicate the authenticated user.'
          },
          id: {
            type: 'string',
            description: 'The ID of the message to retrieve.'
          },
          format: {
            type: 'string',
            description: 'The format of the response.'
          },
          metadataHeaders: {
            type: 'string',
            description: 'Comma-separated list of metadata headers to return.'
          },
          alt: {
            type: 'string',
            description: 'The data format for the response.'
          },
          fields: {
            type: 'string',
            description: 'Selector specifying which fields to include in a partial response.'
          },
          prettyPrint: {
            type: 'string',
            description: 'Returns response with indentations and line breaks.'
          }
        },
        required: ['userId', 'id']
      }
    }
  }
};

export { apiTool };