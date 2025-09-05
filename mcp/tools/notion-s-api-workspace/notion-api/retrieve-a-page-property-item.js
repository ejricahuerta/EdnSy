/**
 * Function to retrieve a page property item from Notion.
 *
 * @param {Object} args - Arguments for the retrieval.
 * @param {string} args.page_id - The ID of the page to retrieve the property from.
 * @param {string} args.property_id - The ID of the property to retrieve.
 * @returns {Promise<Object>} - The result of the property retrieval.
 */
const executeFunction = async ({ page_id, property_id }) => {
  const baseUrl = 'https://api.notion.com/v1/pages';
  const token = process.env.NOTION_S_API_WORKSPACE_API_KEY;
  const notionVersion = '2022-02-22'; // default version, can be overridden by user

  try {
    // Construct the URL for the request
    const url = `${baseUrl}/${page_id}/properties/${property_id}`;

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
    console.error('Error retrieving page property item:', error);
    return { error: 'An error occurred while retrieving the page property item.' };
  }
};

/**
 * Tool configuration for retrieving a page property item from Notion.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'retrieve_page_property_item',
      description: 'Retrieve a page property item from Notion.',
      parameters: {
        type: 'object',
        properties: {
          page_id: {
            type: 'string',
            description: 'The ID of the page to retrieve the property from.'
          },
          property_id: {
            type: 'string',
            description: 'The ID of the property to retrieve.'
          }
        },
        required: ['page_id', 'property_id']
      }
    }
  }
};

export { apiTool };