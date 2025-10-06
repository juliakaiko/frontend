import { API_BASE_URL } from "../utils/constants";

/**
 * Registers a new user.
 * @param {Object} userData - user data for registration
 * @returns {Object} - the object of the response from the server
 * @throws {Object} - an object with fieldErrors and general fields in case of an error
 */
export async function register(userData) {
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
    });

    let data;
    try {
        data = await response.json();
    } catch {
        data = { general: "Server error" };
    }

    if (!response.ok) {
        throw data;
    }

    return data;
}

/**
 * User authorization.
 * @param {Object} credentials - email and password
 * @returns {Object} - the object of the response from the server
 * @throws {Object} - an object with fieldErrors and general fields in case of an error
 */
export async function login(credentials) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });

    let data;
    try {
        data = await response.json();
    } catch {
        data = { general: "Server error" };
    }

    if (!response.ok) {
        throw data;
    }

    return data;
}
