import React, { useEffect, useState } from "react";
//import axios from "axios";
import axiosInstance from "../utils/axiosInterceptor";
import { useAuth } from "../contexts/AuthContext";
import { Box, Typography, Button } from "@mui/material";
import { API_BASE_URL } from "../utils/constants";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
    const { auth, logout } = useAuth();
    const navigate = useNavigate();
    const [greeting, setGreeting] = useState("");

    useEffect(() => {
        if (!auth) {
            navigate("/login");
            return;
        }

        axiosInstance.get(`${API_BASE_URL}/api/users/hello`)
            .then(res => setGreeting(res.data.message))
            .catch(err => {
                console.error("Failed to fetch greeting:", err);
                setGreeting(`Welcome, ${auth.user.email}`); // ← ИСПОЛЬЗУЙТЕ auth.user.email
            });
    }, [auth, navigate]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (!auth) return null;

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f5f5f5",
                padding: 2,
            }}
        >
            <Typography variant="h4" color="primary" gutterBottom>
                {greeting}
            </Typography>
        </Box>
    );
}
