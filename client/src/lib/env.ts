/**
 * Returns the base URL for the application.
 * Prioritizes VITE_APP_URL environment variable, 
 * otherwise falls back to the current window origin.
 */
export function getAppUrl(): string {
    const envUrl = import.meta.env.VITE_APP_URL;
    if (envUrl) {
        // Remove trailing slash if present
        return envUrl.replace(/\/$/, "");
    }
    return window.location.origin;
}
