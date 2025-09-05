/**
 * Function to search for pages in Notion.
 *
 * @param {Object} args - Arguments for the search.
 * @param {string} args.query - The search query for pages.
 * @param {string} [args.sortDirection="ascending"] - The direction to sort the results.
 * @param {string} [args.sortTimestamp="last_edited_time"] - The timestamp to sort by.
 * @returns {Promise<Object>} - The result of the search operation.
 */
const executeFunction = async ({ query, sortDirection = 'ascending', sortTimestamp = 'last_edited_time' }) => {
  const url = 'https://api.notion.com/v1/search';
  const token = process.env.NOTION_S_API_WORKSPACE_API_KEY;
  const notionVersion = '2022-02-22'; // Notion API version

  const body = JSON.stringify({
    query,
    sort: {
      direction: sortDirection,
      timestamp: sortTimestamp
    }
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': notionVersion
      },
      body
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching for pages:', error);
    return { error: 'An error occurred while searching for pages.' };
  }
};

/**
 * Tool configuration for searching pages in Notion.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'search_notion_pages',
      description: 'Search for pages in Notion.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query for pages.'
          },
          sortDirection: {
            type: 'string',
            enum: ['ascending', 'descending'],
            description: 'The direction to sort the results.'
          },
          sortTimestamp: {
            type: 'string',
            description: 'The timestamp to sort by.'
          }
        },
        required: ['query']
      }
    }
  }
};

export { apiTool };