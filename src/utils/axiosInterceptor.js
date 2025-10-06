import axios from 'axios';
import { API_BASE_URL } from './constants';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Create axios instance
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

//!!!Without withCredentials: true, the X-Internal-Call and X-Source-Service headers were NOT transmitted between the services
axiosInstance.defaults.withCredentials = true;

// Request interceptor to add access token
axiosInstance.interceptors.request.use(
    async (config) => {
        const accessToken = localStorage.getItem("accessToken");
        console.log("=== REQUEST DEBUG ===");
        console.log("URL:", config.url);
        console.log("Method:", config.method);
        console.log("Access Token:", accessToken ? "Present" : "Missing");
        console.log("With Credentials:", config.withCredentials);
        console.log("Headers:", config.headers);
        console.log("🔍 AXIOS REQUEST - URL:", config.url);
        console.log("🔍 AXIOS REQUEST - Params:", config.params);
        console.log("🔍 AXIOS REQUEST - Full URL:", config.baseURL + config.url);
        console.log("======================");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
    (response) => {
        console.log("=== RESPONSE DEBUG ===");
        console.log("URL:", response.config.url);
        console.log("Status:", response.status);
        console.log("Response Headers:", response.headers);
        console.log("======================");
        return response;
    },
    async (error) => {
        console.log("=== ERROR DEBUG ===");
        console.log("URL:", error.config?.url);
        console.log("Status:", error.response?.status);
        console.log("Error Message:", error.message);
        console.log("Response Headers:", error.response?.headers);
        console.log("Request Headers:", error.config?.headers);
        console.log("====================");
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, add request to queue
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem("refreshToken");
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                console.log("refreshToken:", localStorage.getItem("refreshToken"));

                // Call refresh endpoint
                const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refreshToken: refreshToken
                });

                const newAccessToken = refreshResponse.data.accessToken;
                const newRefreshToken = refreshResponse.data.refreshToken;

                // Update tokens in localStorage
                localStorage.setItem("accessToken", newAccessToken);
                if (newRefreshToken) {
                    localStorage.setItem("refreshToken", newRefreshToken);
                }

                // Update Authorization header
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // Process queued requests
                processQueue(null, newAccessToken);

                // Retry original request
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);

                // If refresh fails, clear tokens and redirect to login
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("userInfo");

                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;