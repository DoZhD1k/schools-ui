/**
 * Standardizes error handling for API responses
 */
export function handleApiError(error: any, defaultMessage: string): Error {
  console.error(defaultMessage, error);

  // If it's already an Error object with a message, use that
  if (error instanceof Error) {
    return error;
  }

  // Try to extract error message from API response
  if (error && typeof error === "object") {
    if (error.message) {
      return new Error(error.message);
    }

    if (error.error) {
      return new Error(
        typeof error.error === "string" ? error.error : defaultMessage
      );
    }
  }

  // Fallback to default message
  return new Error(defaultMessage);
}
