/**
 * Function to update page properties in Notion.
 *
 * @param {Object} args - Arguments for updating the page.
 * @param {string} args.pageId - The ID of the page to update.
 * @param {Object} args.properties - The properties to update in the page.
 * @returns {Promise<Object>} - The result of the update operation.
 */
const executeFunction = async ({ pageId, properties }) => {
  const baseUrl = 'https://api.notion.com/v1/pages';
  const token = process.env.NOTION_S_API_WORKSPACE_API_KEY;
  const notionVersion = '2022-02-22'; // default version, can be overridden if needed

  try {
    // Construct the URL for the page update
    const url = `${baseUrl}/${pageId}`;

    // Set up headers for the request
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Notion-Version': notionVersion
    };

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ properties })
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
    console.error('Error updating page properties:', error);
    return { error: 'An error occurred while updating page properties.' };
  }
};

/**
 * Tool configuration for updating page properties in Notion.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'update_page_properties',
      description: 'Update properties of a page in Notion.',
      parameters: {
        type: 'object',
        properties: {
          pageId: {
            type: 'string',
            description: 'The ID of the page to update.'
          },
          properties: {
            type: 'object',
            description: 'The properties to update in the page.'
          }
        },
        required: ['pageId', 'properties']
      }
    }
  }
};

export { apiTool };