/**
 * Function to retrieve block children from Notion.
 *
 * @param {Object} args - Arguments for the retrieval.
 * @param {string} args.pageId - The ID of the page whose block children are to be retrieved.
 * @param {number} [args.pageSize=100] - The number of block children to return.
 * @returns {Promise<Object>} - The result of the block children retrieval.
 */
const executeFunction = async ({ pageId, pageSize = 100 }) => {
  const baseUrl = 'https://api.notion.com/v1/blocks';
  const token = process.env.NOTION_S_API_WORKSPACE_API_KEY;
  const notionVersion = '2022-02-22'; // or use the variable from the environment

  try {
    // Construct the URL for the request
    const url = `${baseUrl}/${pageId}/children?page_size=${pageSize}`;

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
    console.error('Error retrieving block children:', error);
    return { error: 'An error occurred while retrieving block children.' };
  }
};

/**
 * Tool configuration for retrieving block children from Notion.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'retrieve_block_children',
      description: 'Retrieve block children from Notion.',
      parameters: {
        type: 'object',
        properties: {
          pageId: {
            type: 'string',
            description: 'The ID of the page whose block children are to be retrieved.'
          },
          pageSize: {
            type: 'integer',
            description: 'The number of block children to return.'
          }
        },
        required: ['pageId']
      }
    }
  }
};

export { apiTool };