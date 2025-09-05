/**
 * Function to retrieve a page from Notion using its ID.
 *
 * @param {Object} args - Arguments for the page retrieval.
 * @param {string} args.pageId - The ID of the page to retrieve.
 * @returns {Promise<Object>} - The result of the page retrieval.
 */
const executeFunction = async ({ pageId }) => {
  const baseUrl = 'https://api.notion.com/v1/pages';
  const token = process.env.NOTION_S_API_WORKSPACE_API_KEY;
  const notionVersion = '2022-02-22'; // default version, can be overridden by the user

  try {
    // Construct the URL with the page ID
    const url = `${baseUrl}/${pageId}`;

    // Set up headers for the request
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': notionVersion
    };

    // Perform the fetch request
    const response = await fetch(url, {
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
    console.error('Error retrieving the page:', error);
    return { error: 'An error occurred while retrieving the page.' };
  }
};

/**
 * Tool configuration for retrieving a page from Notion.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'retrieve_page',
      description: 'Retrieve a page from Notion using its ID.',
      parameters: {
        type: 'object',
        properties: {
          pageId: {
            type: 'string',
            description: 'The ID of the page to retrieve.'
          }
        },
        required: ['pageId']
      }
    }
  }
};

export { apiTool };