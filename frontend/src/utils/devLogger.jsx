/**
 * Logs a message to the console only when the application is running in development mode.
 *
 * The 'import.meta.env.DEV' variable is automatically provided by Vite.
 * It is 'true' when Vite is running in development mode (e.g., via 'npm run dev').
 * It is 'false' when the application is built for production (e.g., via 'npm run build').
 *
 * @param {string} message - The message string or object to log.
 * @param {...any} optionalParams - Additional parameters to include in the log.
 */
export function devLog(message, ...optionalParams) {
  if (import.meta.env.DEV) {
    console.log('[DEV LOG]', message, ...optionalParams);
  }
}
