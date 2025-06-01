/**
 * Handles validation errors from the API response
 * @param {Error} error - The error object from the API
 * @returns {Object|null} Validation errors object or null
 */
export const handleValidationError = (error) => {
  if (error.response?.data?.errors) {
    const validationErrors = {};
    error.response.data.errors.forEach((err) => {
      validationErrors[err.path] = err.message;
    });
    return validationErrors;
  }
  return null;
};

/**
 * Gets a user-friendly error message from an API error
 * @param {Error} error - The error object from the API
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * Formats validation errors for display
 * @param {Object} errors - Validation errors object
 * @returns {string} Formatted error message
 */
export const formatValidationErrors = (errors) => {
  if (!errors) return '';
  return Object.values(errors).join('\n');
}; 