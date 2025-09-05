/**
 * Function to send messages using the Gmail API.
 *
 * @param {Object} args - Arguments for sending the email.
 * @param {string} args.userId - The user's email address or "me" to indicate the authenticated user.
 * @param {string} args.encodedMessage - The Base64 URL encoded MIME message to be sent.
 * @param {Object} args.authContext - Authentication context from landing app.
 * @param {Object} args.userContext - User context information.
 * @returns {Promise<Object>} - The result of the send message operation.
 */
const executeFunction = async ({ userId, encodedMessage, authContext, userContext }) => {
  const baseUrl = 'https://gmail.googleapis.com';

  try {
    // Get authentication token from auth context
    let accessToken;
    if (authContext && authContext.google && authContext.google.access_token) {
      accessToken = authContext.google.access_token;
    } else {
      throw new Error('Google authentication token not found. Please ensure you have connected your Google account.');
    }

    // Construct the URL for sending the email
    const url = `${baseUrl}/gmail/v1/users/${userId}/messages/send?access_token=${accessToken}`;

    // Set up headers for the request
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Prepare the request body
    const body = JSON.stringify({ raw: encodedMessage });

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body
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
    console.error('Error sending message:', error);
    return { error: 'An error occurred while sending the message.' };
  }
};

/**
 * Tool configuration for sending messages using the Gmail API.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'send_messages',
      description: 'Send messages using the Gmail API.',
      parameters: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'The user\'s email address or "me" to indicate the authenticated user.'
          },
          encodedMessage: {
            type: 'string',
            description: 'The Base64 URL encoded MIME message to be sent.'
          },
          mcpUserId: {
            type: 'string',
            description: 'The ID of the user making the request (required for authentication).'
          }
        },
        required: ['userId', 'encodedMessage', 'mcpUserId']
      }
    }
  }
};

export { apiTool };