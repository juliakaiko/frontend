import React, { useState } from "react";
import { register } from "../api/auth";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Register() {
    // Hook for navigation between routes
    const navigate = useNavigate();

    // Get login function from AuthContext to save tokens and user info
    const { login } = useAuth();

    // Form state for all input fields
    const [form, setForm] = useState({
        name: "",
        surname: "",
        birthDate: "",
        email: "",
        password: ""
    });

    // State to store field-specific errors and general errors
    const [errors, setErrors] = useState({
        fieldErrors: {},
        general: ""
    });

    // Update form state on input change
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({ fieldErrors: {}, general: "" });

        try {
            // Call registration API with user data and default role
            const result = await register({ ...form, role: "USER" });
            console.log("Registration success:", result);
            alert("Registration successful!");

            // If login function exists and tokens are returned, save user session
            if (login && result.tokens && result.userDto) {
                login(result.tokens, {
                    id: result.userDto.userId,
                    email: result.userDto.email,
                    name: result.userDto.name,
                    surname: result.userDto.surname,
                    birthDate: result.userDto.birthDate
                });
            }

            // Redirect to welcome page after successful registration
            navigate("/welcome");
        } catch (err) {
            // Handle validation errors
            if (err.fieldErrors) {
                setErrors({ fieldErrors: err.fieldErrors, general: err.message || "Validation failed" });
            } else {
                // Handle general server errors
                setErrors({ fieldErrors: {}, general: err.message || "Server error" });
            }
        }
    };

    // Render registration form
    return (
        <Box
            sx={{
                minHeight: "100vh",
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
                <Typography variant="h5" align="center" gutterBottom>
                    Register
                </Typography>

                {/* First Name input */}
                <TextField
                    label="First Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    error={!!errors.fieldErrors.name}
                    helperText={errors.fieldErrors.name || ""}
                    fullWidth
                />

                {/* Last Name input */}
                <TextField
                    label="Last Name"
                    name="surname"
                    value={form.surname}
                    onChange={handleChange}
                    error={!!errors.fieldErrors.surname}
                    helperText={errors.fieldErrors.surname || ""}
                    fullWidth
                />

                {/* Birth Date input */}
                <TextField
                    label="Birth Date"
                    name="birthDate"
                    type="date"
                    value={form.birthDate}
                    onChange={handleChange}
                    error={!!errors.fieldErrors.birthDate}
                    helperText={errors.fieldErrors.birthDate || ""}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                />

                {/* Email input */}
                <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    error={!!errors.fieldErrors.email}
                    helperText={errors.fieldErrors.email || ""}
                    fullWidth
                />

                {/* Password input */}
                <TextField
                    label="Password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    error={!!errors.fieldErrors.password}
                    helperText={errors.fieldErrors.password || ""}
                    fullWidth
                />

                {/* General error message */}
                {errors.general && (
                    <Typography color="error" align="center">
                        {errors.general}
                    </Typography>
                )}

                {/* Submit button */}
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Register
                </Button>
            </Box>
        </Box>
    );
}
