import React, { useState, useEffect } from "react";
//import axios from "axios";
import axiosInstance from "../utils/axiosInterceptor";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../utils/constants";
import "./css/UpdateCardForm.css";

function UpdateCardForm({ card, onClose, onCardUpdated }) {
    const { auth } = useAuth();
    const [formData, setFormData] = useState({
        number: "",
        holder: "",
        expirationDate: ""
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize form with card data when component mounts or card changes
    useEffect(() => {
        if (card) {
            // Format expiration date to YYYY-MM-DD for date input
            const formattedDate = card.expirationDate
                ? card.expirationDate.substring(0, 10)
                : "";

            setFormData({
                number: card.number || "",
                holder: card.holder || "",
                expirationDate: formattedDate
            });
        }
    }, [card]);

    // Handle input changes for all form fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing in the field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    // Validate form inputs before submission
    const validateForm = () => {
        const newErrors = {};

        // Card number validation (16 digits)
        if (!formData.number.trim()) {
            newErrors.number = "Card number is required";
        } else if (!/^\d{16}$/.test(formData.number.replace(/\s/g, ''))) {
            newErrors.number = "Card number must contain exactly 16 digits";
        }

        // Cardholder name validation
        if (!formData.holder.trim()) {
            newErrors.holder = "Cardholder name is required";
        } else if (formData.holder.trim().length < 2) {
            newErrors.holder = "Cardholder name must be at least 2 characters";
        }

        // Expiration date validation
        if (!formData.expirationDate) {
            newErrors.expirationDate = "Expiration date is required";
        } else {
            const selectedDate = new Date(formData.expirationDate);
            const currentDate = new Date();
            if (selectedDate <= currentDate) {
                newErrors.expirationDate = "Expiration date must be in the future";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Extract and process backend validation errors
    const processBackendErrors = (errorResponse) => {
        const backendErrors = errorResponse.data;
        const fieldErrors = {};

        if (typeof backendErrors === 'object') {
            // Map backend field errors to form fields
            Object.keys(backendErrors).forEach(key => {
                if (key === 'number' || key === 'holder' || key === 'expirationDate') {
                    fieldErrors[key] = backendErrors[key];
                }
            });

            // If no specific field errors but there's a general message
            if (Object.keys(fieldErrors).length === 0 && backendErrors.message) {
                fieldErrors.submit = backendErrors.message;
            }
        } else if (typeof backendErrors === 'string') {
            // Handle string error responses
            fieldErrors.submit = backendErrors;
        }

        return fieldErrors;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form before submission
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare card data for API request
            const cardData = {
                number: formData.number.replace(/\s/g, ''), // Remove spaces from card number
                holder: formData.holder,
                expirationDate: formData.expirationDate // Already in YYYY-MM-DD format
            };

            console.log("Updating card:", card.cardId, cardData);

            // Send PUT request to update card
            const response = await axiosInstance.put(
                `${API_BASE_URL}/api/cards/${card.cardId}`,
                cardData
            );

            console.log("Card updated successfully:", response.data);
            alert("Card updated successfully!");
            onCardUpdated();

        } catch (error) {
            console.error("Error updating card:", error);

            // Handle different types of errors from backend
            if (error.response?.data) {
                console.error("Error details:", error.response.data);

                if (error.response.status === 400) {
                    // Process validation errors from backend
                    const fieldErrors = processBackendErrors(error.response);
                    setErrors(fieldErrors);
                } else {
                    // Handle other API errors
                    setErrors({
                        submit: error.response?.data?.message || "Failed to update card. Please try again."
                    });
                }
            } else {
                // Handle network errors
                setErrors({
                    submit: "Network error. Please check your connection and try again."
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Format card number with spaces as user types
    const handleCardNumberChange = (e) => {
        let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);

        // Add space every 4 digits for better readability
        value = value.replace(/(\d{4})/g, '$1 ').trim();

        setFormData(prev => ({
            ...prev,
            number: value
        }));

        // Clear card number error when user starts typing
        if (errors.number) {
            setErrors(prev => ({
                ...prev,
                number: ""
            }));
        }
    };

    return (
        <div className="modal-overlay">
            <div className="update-card-modal" onClick={(e) => e.stopPropagation()}>
                <div className="update-card-header">
                    <h3>Update Card</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="update-card-form">
                    <div className="form-group">
                        <label htmlFor="number">Card Number *</label>
                        <input
                            type="text"
                            id="number"
                            name="number"
                            value={formData.number}
                            onChange={handleCardNumberChange}
                            maxLength="19" // 16 digits + 3 spaces
                            className={errors.number ? "error" : ""}
                            disabled={isSubmitting}
                        />
                        {errors.number && <span className="error-text">{errors.number}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="holder">Cardholder Name *</label>
                        <input
                            type="text"
                            id="holder"
                            name="holder"
                            value={formData.holder}
                            onChange={handleChange}
                            className={errors.holder ? "error" : ""}
                            disabled={isSubmitting}
                        />
                        {errors.holder && <span className="error-text">{errors.holder}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="expirationDate">Expiration Date *</label>
                        <input
                            type="date"
                            id="expirationDate"
                            name="expirationDate"
                            value={formData.expirationDate}
                            onChange={handleChange}
                            className={errors.expirationDate ? "error" : ""}
                            disabled={isSubmitting}
                        />
                        {errors.expirationDate && <span className="error-text">{errors.expirationDate}</span>}
                    </div>

                    {errors.submit && (
                        <div className="error-message">{errors.submit}</div>
                    )}

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Updating Card..." : "Update Card"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UpdateCardForm;