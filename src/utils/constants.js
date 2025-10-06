const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

export const API_BASE_URL = isLocal
    ? "http://localhost:8080" // "http://innowise-project.local"
    : "http://innowise-project.local";

// Keys for localStorage
export const AUTH_TOKEN = "authToken";
export const USER_INFO = "userInfo";
