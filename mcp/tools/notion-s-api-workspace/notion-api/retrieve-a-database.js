/**
 * Function to retrieve a database object from Notion using its ID.
 *
 * @param {Object} args - Arguments for the database retrieval.
 * @param {string} args.databaseId - The ID of the database to retrieve.
 * @returns {Promise<Object>} - The result of the database retrieval.
 */
const executeFunction = async ({ databaseId }) => {
  const baseUrl = 'https://api.notion.com/v1/databases';
  const token = process.env.NOTION_S_API_WORKSPACE_API_KEY;
  const notionVersion = '2022-02-22'; // default Notion version

  try {
    // Construct the URL for the database retrieval
    const url = `${baseUrl}/${databaseId}`;

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
    console.error('Error retrieving the database:', error);
    return { error: 'An error occurred while retrieving the database.' };
  }
};

/**
 * Tool configuration for retrieving a database from Notion.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'retrieve_database',
      description: 'Retrieve a database object from Notion.',
      parameters: {
        type: 'object',
        properties: {
          databaseId: {
            type: 'string',
            description: 'The ID of the database to retrieve.'
          }
        },
        required: ['databaseId']
      }
    }
  }
};

export { apiTool };