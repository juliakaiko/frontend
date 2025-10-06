import React, { createContext, useState, useContext, useCallback } from "react";
import { USER_INFO, API_BASE_URL } from "../utils/constants";
import axios from "axios";

/**
 * Create the authentication context
 * This acts as a "global store" to avoid passing tokens through props between components
 */
const AuthContext = createContext(null);

/**
 * Provider component that will "wrap" the entire application
 * and provide access to authentication state (auth, login, logout)
 */
export function AuthProvider({ children }) {
    /**
     * Authentication state
     * On startup, check localStorage: if there's already a token, the user is authenticated
     */
    const [auth, setAuth] = useState(() => {
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        const user = localStorage.getItem(USER_INFO);
        return accessToken ? {
            token: accessToken,
            refreshToken: refreshToken,
            user: user ? JSON.parse(user) : null
        } : null;
    });

    /**
     * Function to refresh access token using refresh token
     */
    const refreshAccessToken = useCallback(async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");

            if (!refreshToken) {
                throw new Error("No refresh token available");
            }

            console.log("Refreshing access token...");

            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                refreshToken: refreshToken
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;

            // Save new tokens to localStorage
            localStorage.setItem("accessToken", accessToken);
            if (newRefreshToken) {
                localStorage.setItem("refreshToken", newRefreshToken);
            }

            // Update state
            const user = localStorage.getItem(USER_INFO);
            const updatedAuth = {
                token: accessToken,
                refreshToken: newRefreshToken || refreshToken,
                user: user ? JSON.parse(user) : null
            };

            setAuth(updatedAuth);

            console.log("Access token refreshed successfully");
            return accessToken;

        } catch (error) {
            console.error("Token refresh failed:", error);
            // If refresh fails, log out the user
            logout();
            throw error;
        }
    }, []);

    /**
     * Function to check if token is expired
     */
    const isTokenExpired = useCallback((token) => {
        if (!token) return true;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = payload.exp * 1000; // Convert to milliseconds
            const currentTime = Date.now();

            // Add 1 minute buffer for preemptive refresh
            return expirationTime - currentTime < 60000;
        } catch (error) {
            console.error('Error decoding token:', error);
            return true;
        }
    }, []);

    /**
     * Function to check if token needs refresh
     */
    const shouldRefreshToken = useCallback(() => {
        const accessToken = localStorage.getItem("accessToken");
        return isTokenExpired(accessToken);
    }, [isTokenExpired]);

    /**
     * Login function
     * Save tokens to localStorage (to survive page reload) and update auth state
     */
    const login = (tokens, userInfo) => {
        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);
        localStorage.setItem(USER_INFO, JSON.stringify(userInfo));
        setAuth({
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: userInfo
        });
    };

    /**
     * Logout function
     * Remove tokens and reset auth state → user becomes "guest"
     */
    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem(USER_INFO);
        setAuth(null);
    };

    /**
     * Return provider that passes current state and login/logout functions
     * to children (the entire application inside)
     */
    return (
        <AuthContext.Provider value={{
            auth,
            login,
            logout,
            refreshAccessToken,
            isTokenExpired,
            shouldRefreshToken
        }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Custom hook for convenient context usage
 * Instead of useContext(AuthContext), you can simply call useAuth()
 */
export function useAuth() {
    return useContext(AuthContext);
}