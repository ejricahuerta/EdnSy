/**
 * Function to append block children in Notion.
 *
 * @param {Object} args - Arguments for appending block children.
 * @param {string} args.pageId - The ID of the page where the block children will be appended.
 * @param {Array} args.children - An array of block objects to append.
 * @returns {Promise<Object>} - The result of the append operation.
 */
const executeFunction = async ({ pageId, children }) => {
  const baseUrl = 'https://api.notion.com/v1/blocks';
  const token = process.env.NOTION_S_API_WORKSPACE_API_KEY;
  const notionVersion = '2022-02-22'; // default Notion API version

  try {
    // Construct the URL for appending block children
    const url = `${baseUrl}/${pageId}/children`;

    // Set up headers for the request
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': notionVersion
    };

    // Create the body for the request
    const body = JSON.stringify({ children });

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'PATCH',
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
    console.error('Error appending block children:', error);
    return { error: 'An error occurred while appending block children.' };
  }
};

/**
 * Tool configuration for appending block children in Notion.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'append_block_children',
      description: 'Append block children to a Notion page.',
      parameters: {
        type: 'object',
        properties: {
          pageId: {
            type: 'string',
            description: 'The ID of the page where the block children will be appended.'
          },
          children: {
            type: 'array',
            items: {
              type: 'object',
              description: 'A block object to append.'
            },
            description: 'An array of block objects to append.'
          }
        },
        required: ['pageId', 'children']
      }
    }
  }
};

export { apiTool };