/**
 * Function to create a new file in Google Drive.
 *
 * @param {Object} args - Arguments for creating the file.
 * @param {Object} args.fileMetadata - Metadata for the file being created.
 * @param {string} args.fileMetadata.name - The name of the file.
 * @param {string} args.fileMetadata.mimeType - The MIME type of the file.
 * @param {Buffer} args.fileContent - The content of the file to be uploaded.
 * @param {string} [args.oauthToken] - The OAuth 2.0 token for the current user.
 * @param {string} [args.key] - The API key for the project.
 * @returns {Promise<Object>} - The result of the file creation.
 */
const executeFunction = async ({ fileMetadata, fileContent, oauthToken, key }) => {
  const baseUrl = 'https://www.googleapis.com/drive/v3';
  const token = process.env.GOOGLE_API_WORKSPACE_API_KEY;
  const apiKey = process.env.GOOGLE_API_WORKSPACE_API_KEY;

  try {
    // Construct the URL with query parameters
    const url = new URL(`${baseUrl}/files`);
    url.searchParams.append('key', apiKey);
    if (oauthToken) {
      url.searchParams.append('oauth_token', oauthToken);
    }

    // Set up headers for the request
    const headers = {
      'Content-Type': 'application/octet-stream',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Perform the fetch request
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify(fileMetadata),
      // The file content should be sent as a separate request if needed
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
    console.error('Error creating file in Google Drive:', error);
    return { error: 'An error occurred while creating the file.' };
  }
};

/**
 * Tool configuration for creating a new file in Google Drive.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'create_file',
      description: 'Create a new file in Google Drive.',
      parameters: {
        type: 'object',
        properties: {
          fileMetadata: {
            type: 'object',
            description: 'Metadata for the file being created.',
            properties: {
              name: {
                type: 'string',
                description: 'The name of the file.'
              },
              mimeType: {
                type: 'string',
                description: 'The MIME type of the file.'
              }
            },
            required: ['name', 'mimeType']
          },
          fileContent: {
            type: 'string',
            description: 'The content of the file to be uploaded.'
          },
          oauthToken: {
            type: 'string',
            description: 'OAuth 2.0 token for the current user.'
          },
          key: {
            type: 'string',
            description: 'API key for the project.'
          }
        },
        required: ['fileMetadata', 'fileContent']
      }
    }
  }
};

export { apiTool };