/**
 * Function to initiate the OAuth 2.0 authorization request for Google APIs.
 *
 * @param {Object} args - Arguments for the authorization request.
 * @param {string} args.clientId - The client ID for the OAuth application.
 * @param {string} args.redirectUri - The URI to redirect to after authorization.
 * @param {string} args.scope - The scopes for which access is requested.
 * @param {string} [args.responseType="code"] - The type of response expected from the authorization server.
 * @returns {Promise<string>} - The authorization URL to redirect the user to.
 */
const executeFunction = async ({ clientId, redirectUri, scope, responseType = 'code' }) => {
  const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const accessToken = ''; // will be provided by the user
  try {
    // Construct the authorization URL with query parameters
    const url = new URL(baseUrl);
    url.searchParams.append('client_id', clientId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('scope', scope);
    url.searchParams.append('response_type', responseType);

    // Return the constructed authorization URL
    return url.toString();
  } catch (error) {
    console.error('Error constructing authorization URL:', error);
    return { error: 'An error occurred while constructing the authorization URL.' };
  }
};

/**
 * Tool configuration for initiating the OAuth 2.0 authorization request for Google APIs.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'google_auth_request',
      description: 'Initiate the OAuth 2.0 authorization request for Google APIs.',
      parameters: {
        type: 'object',
        properties: {
          clientId: {
            type: 'string',
            description: 'The client ID for the OAuth application.'
          },
          redirectUri: {
            type: 'string',
            description: 'The URI to redirect to after authorization.'
          },
          scope: {
            type: 'string',
            description: 'The scopes for which access is requested.'
          },
          responseType: {
            type: 'string',
            description: 'The type of response expected from the authorization server.'
          }
        },
        required: ['clientId', 'redirectUri', 'scope']
      }
    }
  }
};

export { apiTool };