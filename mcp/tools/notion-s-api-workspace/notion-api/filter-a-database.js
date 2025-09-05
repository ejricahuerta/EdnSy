/**
 * Function to filter a database in Notion.
 *
 * @param {Object} args - Arguments for filtering the database.
 * @param {string} args.databaseId - The ID of the database to filter.
 * @param {Object} args.filter - The filter criteria for the database.
 * @returns {Promise<Object>} - The result of the database query.
 */
const executeFunction = async ({ databaseId, filter }) => {
  const baseUrl = 'https://api.notion.com/v1/databases';
  const token = process.env.NOTION_S_API_WORKSPACE_API_KEY;
  const notionVersion = '2022-02-22'; // default version

  try {
    // Construct the URL for the request
    const url = `${baseUrl}/${databaseId}/query`;

    // Set up headers for the request
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': notionVersion
    };

    // Create the body of the request
    const body = JSON.stringify({ filter });

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
    console.error('Error filtering the database:', error);
    return { error: 'An error occurred while filtering the database.' };
  }
};

/**
 * Tool configuration for filtering a database in Notion.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'filter_database',
      description: 'Filter a database in Notion.',
      parameters: {
        type: 'object',
        properties: {
          databaseId: {
            type: 'string',
            description: 'The ID of the database to filter.'
          },
          filter: {
            type: 'object',
            description: 'The filter criteria for the database.'
          }
        },
        required: ['databaseId', 'filter']
      }
    }
  }
};

export { apiTool };