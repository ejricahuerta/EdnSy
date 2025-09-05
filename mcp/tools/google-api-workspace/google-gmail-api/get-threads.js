/**
 * Function to get a specific thread from Gmail.
 *
 * @param {Object} args - Arguments for the thread retrieval.
 * @param {string} args.userId - The user's email address or "me" to indicate the authenticated user.
 * @param {string} args.id - The ID of the thread to retrieve.
 * @param {string} [args.format] - The format of the response (e.g., json).
 * @param {string} [args.metadataHeaders] - Metadata headers to include in the response.
 * @param {string} [args.alt] - Alternative data format for the response.
 * @param {string} [args.callback] - JSONP callback function name.
 * @param {string} [args.fields] - Fields to include in the response.
 * @param {string} [args.key] - API key for the request.
 * @param {string} [args.oauth_token] - OAuth 2.0 token for the current user.
 * @param {boolean} [args.prettyPrint] - Whether to format the response for readability.
 * @param {string} [args.quotaUser] - User-specific quota identifier.
 * @param {string} [args.upload_protocol] - Upload protocol for media.
 * @param {string} [args.uploadType] - Legacy upload protocol for media.
 * @param {string} [args.xgafv] - Version of the Google API front-end to use.
 * @returns {Promise<Object>} - The result of the thread retrieval.
 */
const executeFunction = async ({ userId, id, format, metadataHeaders, alt, callback, fields, key, oauth_token, prettyPrint, quotaUser, upload_protocol, uploadType, xgafv }) => {
  const baseUrl = 'https://gmail.googleapis.com';
  const accessToken = ''; // will be provided by the user
  try {
    // Construct the URL with path variables and query parameters
    const url = new URL(`${baseUrl}/gmail/v1/users/${userId}/threads/${id}`);
    const params = new URLSearchParams();
    if (format) params.append('format', format);
    if (metadataHeaders) params.append('metadataHeaders', metadataHeaders);
    if (alt) params.append('alt', alt);
    if (callback) params.append('callback', callback);
    if (fields) params.append('fields', fields);
    if (key) params.append('key', key);
    if (oauth_token) params.append('oauth_token', oauth_token);
    if (prettyPrint) params.append('prettyPrint', prettyPrint);
    if (quotaUser) params.append('quotaUser', quotaUser);
    if (upload_protocol) params.append('upload_protocol', upload_protocol);
    if (uploadType) params.append('uploadType', uploadType);
    if (xgafv) params.append('$.xgafv', xgafv);
    url.search = params.toString();

    // Set up headers for the request
    const headers = {
      'Accept': 'application/json'
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
    console.error('Error retrieving thread:', error);
    return { error: 'An error occurred while retrieving the thread.' };
  }
};

/**
 * Tool configuration for getting threads from Gmail.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_threads',
      description: 'Get a specific thread from Gmail.',
      parameters: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'The user\'s email address or "me" to indicate the authenticated user.'
          },
          id: {
            type: 'string',
            description: 'The ID of the thread to retrieve.'
          },
          format: {
            type: 'string',
            description: 'The format of the response.'
          },
          metadataHeaders: {
            type: 'string',
            description: 'Metadata headers to include in the response.'
          },
          alt: {
            type: 'string',
            description: 'Alternative data format for the response.'
          },
          callback: {
            type: 'string',
            description: 'JSONP callback function name.'
          },
          fields: {
            type: 'string',
            description: 'Fields to include in the response.'
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
            description: 'Whether to format the response for readability.'
          },
          quotaUser: {
            type: 'string',
            description: 'User-specific quota identifier.'
          },
          upload_protocol: {
            type: 'string',
            description: 'Upload protocol for media.'
          },
          uploadType: {
            type: 'string',
            description: 'Legacy upload protocol for media.'
          },
          xgafv: {
            type: 'string',
            description: 'Version of the Google API front-end to use.'
          }
        },
        required: ['userId', 'id']
      }
    }
  }
};

export { apiTool };