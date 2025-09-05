/**
 * Function to query a database in Notion.
 *
 * @param {Object} args - Arguments for the query.
 * @param {string} args.databaseId - The ID of the database to query.
 * @param {Object} args.filter - The filter criteria for the query.
 * @param {Array} args.sorts - The sorting criteria for the query.
 * @param {Object} args.authContext - Authentication context from landing app.
 * @param {Object} args.userContext - User context information.
 * @returns {Promise<Object>} - The result of the database query.
 */
const executeFunction = async ({ databaseId, filter, sorts, authContext, userContext }) => {
  const baseUrl = 'https://api.notion.com/v1/databases';
  const notionVersion = '2022-02-22'; // default Notion version

  try {
    // Get authentication token from auth context
    let token;
    if (authContext && authContext.notion && authContext.notion.access_token) {
      token = authContext.notion.access_token;
    } else {
      throw new Error('Notion authentication token not found. Please ensure you have connected your Notion account.');
    }

    // Construct the URL for the database query
    const url = `${baseUrl}/${databaseId}/query`;

    // Set up headers for the request
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': notionVersion
    };

    // Prepare the body of the request
    const body = JSON.stringify({ filter, sorts });

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
    console.error('Error querying the database:', error);
    return { error: 'An error occurred while querying the database.' };
  }
};

/**
 * Tool configuration for querying a database in Notion.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'query_database',
      description: 'Query a database in Notion.',
      parameters: {
        type: 'object',
        properties: {
          databaseId: {
            type: 'string',
            description: 'The ID of the database to query.'
          },
          filter: {
            type: 'object',
            description: 'The filter criteria for the query.'
          },
          sorts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                property: {
                  type: 'string',
                  description: 'The property to sort by.'
                },
                direction: {
                  type: 'string',
                  enum: ['ascending', 'descending'],
                  description: 'The direction to sort.'
                }
              },
              required: ['property', 'direction']
            },
            description: 'The sorting criteria for the query.'
          },
          userId: {
            type: 'string',
            description: 'The ID of the user making the request (required for authentication).'
          }
        },
        required: ['databaseId', 'userId']
      }
    }
  }
};

export { apiTool };