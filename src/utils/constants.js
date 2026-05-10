/*const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

export const API_BASE_URL = isLocal
    ? "http://localhost:8080"
    : "http://innowise-project.local";*/

//in IDEA
export const API_BASE_URL = "http://localhost:8080";
// in k8s
//export const API_BASE_URL = "http://innowise-project.local";
// in Docker
//export const API_BASE_URL = "";

// Keys for localStorage
export const AUTH_TOKEN = "authToken";
export const USER_INFO = "userInfo";

console.log("🔧 API_BASE_URL configured as:", API_BASE_URL);
console.log("🔧 Current hostname:", window.location.hostname);
console.log("🔧 NODE_ENV:", process.env.NODE_ENV);
