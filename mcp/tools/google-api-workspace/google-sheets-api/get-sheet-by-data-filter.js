/**
 * Function to get a sheet by data filter from Google Sheets.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} args.spreadsheetId - The ID of the spreadsheet to operate on.
 * @param {Array} args.dataFilters - An array of data filters to apply when retrieving the sheet.
 * @param {boolean} [args.includeGridData=true] - Indicates whether to include grid data (cell values and formatting).
 * @returns {Promise<Object>} - The result of the request to get the sheet by data filter.
 */
const executeFunction = async ({ spreadsheetId, dataFilters, includeGridData = true }) => {
  const baseUrl = 'https://sheets.googleapis.com';
  const accessToken = ''; // will be provided by the user
  const url = `${baseUrl}/v4/spreadsheets/${spreadsheetId}:getByDataFilter?access_token=${accessToken}`;

  const body = {
    dataFilters,
    includeGridData
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting sheet by data filter:', error);
    return { error: 'An error occurred while getting the sheet by data filter.' };
  }
};

/**
 * Tool configuration for getting a sheet by data filter from Google Sheets.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'get_sheet_by_data_filter',
      description: 'Get a sheet by data filter from Google Sheets.',
      parameters: {
        type: 'object',
        properties: {
          spreadsheetId: {
            type: 'string',
            description: 'The ID of the spreadsheet to operate on.'
          },
          dataFilters: {
            type: 'array',
            description: 'An array of data filters to apply when retrieving the sheet.'
          },
          includeGridData: {
            type: 'boolean',
            description: 'Indicates whether to include grid data (cell values and formatting).'
          }
        },
        required: ['spreadsheetId', 'dataFilters']
      }
    }
  }
};

export { apiTool };