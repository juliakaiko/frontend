import React, { useState } from "react";
import axiosInstance from "../utils/axiosInterceptor";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../utils/constants";
import "./css/AddCardForm.css";

function AddCardForm({ onClose, onCardAdded }) {
    const { auth } = useAuth();
    const [formData, setFormData] = useState({
        number: "",
        holder: "",
        expirationDate: ""
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

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

        // Expiration date validation - UPDATED for date input
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // date input returns YYYY-MM-DD format
            const cardData = {
                number: formData.number.replace(/\s/g, ''), // Remove spaces
                holder: formData.holder,
                expirationDate: formData.expirationDate, // in correct YYYY-MM-DD format
                userId: auth.user.id
            };

            console.log("Sending card data:", cardData);

            const response = await axiosInstance.post(
                `${API_BASE_URL}/api/cards/add`,
                cardData
            );

            console.log("Card created successfully:", response.data);
            alert("Card added successfully!");

            // Notify parent component about new card
            onCardAdded();

        } catch (error) {
            console.error("Error creating card:", error);
            if (error.response?.data) {
                console.error("Error details:", error.response.data);

                // Handle validation errors from backend
                if (error.response.status === 400) {
                    const backendErrors = error.response.data;
                    if (typeof backendErrors === 'object') {
                        const fieldErrors = {};
                        Object.keys(backendErrors).forEach(key => {
                            if (key === 'number' || key === 'holder' || key === 'expirationDate') {
                                fieldErrors[key] = backendErrors[key];
                            }
                        });
                        setErrors(fieldErrors);
                    } else {
                        setErrors({
                            submit: backendErrors.message || "Validation failed. Please check your input."
                        });
                    }
                } else {
                    setErrors({
                        submit: error.response?.data?.message || "Failed to create card. Please try again."
                    });
                }
            } else {
                setErrors({
                    submit: "Network error. Please check your connection and try again."
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Format card number as user types (add spaces every 4 digits)
    const handleCardNumberChange = (e) => {
        let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);

        // Add spaces every 4 digits
        value = value.replace(/(\d{4})/g, '$1 ').trim();

        setFormData(prev => ({
            ...prev,
            number: value
        }));

        if (errors.number) {
            setErrors(prev => ({
                ...prev,
                number: ""
            }));
        }
    };

    return (
        <div className="modal-overlay">
            <div className="add-card-modal" onClick={(e) => e.stopPropagation()}>
                <div className="add-card-header">
                    <h3>Add New Card</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="add-card-form">
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
                            {isSubmitting ? "Adding Card..." : "Add Card"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddCardForm;