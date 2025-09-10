/**
 * Function to get values from a Google Sheets spreadsheet.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} args.spreadsheetId - The ID of the spreadsheet to operate on.
 * @param {string} args.range - The range of cells to retrieve values from.
 * @param {string} [args.majorDimension="ROWS"] - The major dimension for the returned values.
 * @param {string} [args.valueRenderOption="FORMATTED_VALUE"] - How to render the values.
 * @param {string} [args.dateTimeRenderOption="SERIAL_NUMBER"] - How to render date/time values.
 * @returns {Promise<Object>} - The result of the API call, containing the values from the specified range.
 */
const executeFunction = async ({ spreadsheetId, range, majorDimension = 'ROWS', valueRenderOption = 'FORMATTED_VALUE', dateTimeRenderOption = 'SERIAL_NUMBER' }) => {
  const baseUrl = 'https://sheets.googleapis.com';
  const accessToken = ''; // will be provided by the user
  const key = ''; // will be provided by the user

  try {
    // Construct the URL with query parameters
    const url = new URL(`${baseUrl}/v4/spreadsheets/${spreadsheetId}/values/${range}`);
    url.searchParams.append('majorDimension', majorDimension);
    url.searchParams.append('valueRenderOption', valueRenderOption);
    url.searchParams.append('dateTimeRenderOption', dateTimeRenderOption);
    url.searchParams.append('access_token', accessToken);
    url.searchParams.append('key', key);

    // Set up headers for the request
    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    };

    // Perform the fetch request
    const response = await fetch(url.toString(), {
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
    console.error('Error getting values from spreadsheet:', error);
    return { error: 'An error occurred while retrieving values from the spreadsheet.' };
  }
};

/**
 * Tool configuration for getting values from a Google Sheets spreadsheet.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_values',
      description: 'Retrieve values from a specified range in a Google Sheets spreadsheet.',
      parameters: {
        type: 'object',
        properties: {
          spreadsheetId: {
            type: 'string',
            description: 'The ID of the spreadsheet to operate on.'
          },
          range: {
            type: 'string',
            description: 'The range of cells to retrieve values from.'
          },
          majorDimension: {
            type: 'string',
            enum: ['ROWS', 'COLUMNS'],
            description: 'The major dimension for the returned values.'
          },
          valueRenderOption: {
            type: 'string',
            enum: ['FORMATTED_VALUE', 'UNFORMATTED_VALUE', 'FORMULA'],
            description: 'How to render the values.'
          },
          dateTimeRenderOption: {
            type: 'string',
            enum: ['SERIAL_NUMBER', 'FORMATTED_STRING'],
            description: 'How to render date/time values.'
          }
        },
        required: ['spreadsheetId', 'range']
      }
    }
  }
};

export { apiTool };