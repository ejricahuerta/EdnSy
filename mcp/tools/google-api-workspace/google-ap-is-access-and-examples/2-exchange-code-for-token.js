/**
 * Function to exchange authorization code for an access token using Google OAuth 2.0.
 *
 * @param {Object} args - Arguments for the token exchange.
 * @param {string} args.clientId - The client ID of your Google application.
 * @param {string} args.clientSecret - The client secret of your Google application.
 * @param {string} args.grant_type - The type of grant being requested (typically "authorization_code").
 * @param {string} args.redirectUri - The redirect URI registered in your Google Cloud project.
 * @param {string} args.code - The authorization code received from the OAuth 2.0 server.
 * @returns {Promise<Object>} - The response containing the access token or an error message.
 */
const executeFunction = async ({ clientId, clientSecret, grant_type, redirectUri, code }) => {
  const baseUrl = 'https://oauth2.googleapis.com/token';
  const accessToken = ''; // will be provided by the user

  try {
    // Construct the URL with query parameters
    const url = new URL(baseUrl);
    url.searchParams.append('client_id', clientId);
    url.searchParams.append('client_secret', clientSecret);
    url.searchParams.append('grant_type', grant_type);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('code', code);

    // Perform the fetch request
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${accessToken}`
      }
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
    console.error('Error exchanging code for token:', error);
    return { error: 'An error occurred while exchanging code for token.' };
  }
};

/**
 * Tool configuration for exchanging authorization code for an access token.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'exchange_code_for_token',
      description: 'Exchange authorization code for an access token using Google OAuth 2.0.',
      parameters: {
        type: 'object',
        properties: {
          clientId: {
            type: 'string',
            description: 'The client ID of your Google application.'
          },
          clientSecret: {
            type: 'string',
            description: 'The client secret of your Google application.'
          },
          grant_type: {
            type: 'string',
            description: 'The type of grant being requested (typically "authorization_code").'
          },
          redirectUri: {
            type: 'string',
            description: 'The redirect URI registered in your Google Cloud project.'
          },
          code: {
            type: 'string',
            description: 'The authorization code received from the OAuth 2.0 server.'
          }
        },
        required: ['clientId', 'clientSecret', 'grant_type', 'redirectUri', 'code']
      }
    }
  }
};

export { apiTool };