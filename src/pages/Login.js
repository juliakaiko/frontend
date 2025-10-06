import React, { useState } from "react";
import axiosInstance from "../utils/axiosInterceptor";
import { useAuth } from "../contexts/AuthContext";
import { TextField, Button, Box, Typography } from "@mui/material";
import { API_BASE_URL } from "../utils/constants";
import { useNavigate } from "react-router-dom";

export default function Login() {
    // Get login function from AuthContext
    const { login } = useAuth();

    // Hook for navigation between routes
    const navigate = useNavigate();

    // Component state variables
    const [email, setEmail] = useState(""); // Stores the user's email input
    const [password, setPassword] = useState(""); // Stores the user's password input
    const [fieldErrors, setFieldErrors] = useState({}); // Stores validation errors for specific fields
    const [generalError, setGeneralError] = useState(""); // Stores general error messages
    const [isLoading, setIsLoading] = useState(false); // Indicates whether login is in progress

    // 🧾 Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        setFieldErrors({});
        setGeneralError("");
        setIsLoading(true);

        try {
            console.log("🔍 Sending login request...");

            const response = await axiosInstance.post(
                `${API_BASE_URL}/auth/login`,
                { email, password },
                { headers: { "Content-Type": "application/json" } }
            );

            const tokens = response.data;
            console.log("✅ Login successful, tokens:", tokens);

            localStorage.setItem("accessToken", tokens.accessToken);
            localStorage.setItem("refreshToken", tokens.refreshToken);

            if (!tokens || !tokens.accessToken) {
                throw new Error("No tokens received from server");
            }

            // Retrieve user information by email
            const userResponse = await axiosInstance.get(
                `${API_BASE_URL}/api/users/find-by-email`,
                {
                    params: { email }
                }
            );

            const userInfo = userResponse.data;
            console.log("✅ User info:", userInfo);

            // Save tokens and user information in authentication context
            login(tokens, {
                id: userInfo.userId,
                email: userInfo.email,
                name: userInfo.name,
                surname: userInfo.surname,
                birthDate: userInfo.birthDate
            });

            // Redirect to the welcome page after successful login
            navigate("/welcome");

        } catch (err) {
            console.error("Login error:", err);

            // ⚠️ Handle different types of login errors
            if (err.response?.status === 400 && err.response?.data?.fieldErrors) {
                // Field validation errors (e.g., invalid email format)
                setFieldErrors(err.response.data.fieldErrors);
            } else if (err.response?.status === 401) {
                // Invalid credentials
                setGeneralError("Invalid email or password");
            } else if (err.response?.status === 400) {
                // Other bad request errors
                setGeneralError(err.response?.data?.message || "Invalid request");
            } else if (err.code === 'NETWORK_ERROR' || err.code === 'ECONNREFUSED') {
                // Server connection issues
                setGeneralError("Cannot connect to server");
            } else {
                // Generic fallback error
                setGeneralError(err.response?.data?.message || "An error occurred during login");
            }
        } finally {
            // Reset loading state
            setIsLoading(false);
        }
    };

    // Render login form UI
    return (
        <Box
            sx={{
                minHeight: "100vh", // Full screen height
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f5f5f5",
                padding: 2,
            }}
        >
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    width: 360,
                    padding: 4,
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
            >
                {/* Form title */}
                <Typography variant="h5" align="center" gutterBottom>
                    Login
                </Typography>

                {/* Email input field */}
                <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    error={!!fieldErrors.email}
                    helperText={fieldErrors.email}
                    disabled={isLoading}
                />

                {/* Password input field */}
                <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    error={!!fieldErrors.password}
                    helperText={fieldErrors.password}
                    disabled={isLoading}
                />

                {/* Display general error message */}
                {generalError && (
                    <Typography color="error" align="center">
                        {generalError}
                    </Typography>
                )}

                {/* Submit button */}
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={isLoading}
                >
                    {isLoading ? "Logging in..." : "Login"}
                </Button>
            </Box>
        </Box>
    );
}
