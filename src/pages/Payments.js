import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInterceptor";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../utils/constants";
import "./css/Payments.css";

/**
 * Payments component that displays user's payment history
 * Fetches payments data from API and renders in a table format
 * @component
 * @returns {JSX.Element} Rendered payments component
 */
function Payments() {
    /** @type {Object} Authentication context from AuthProvider */
    const { auth } = useAuth();

    /** @type {Array} State for storing payments list */
    const [payments, setPayments] = useState([]);

    /** @type {boolean} State for loading status */
    const [loading, setLoading] = useState(true);

    /** @type {string|null} State for error messages */
    const [error, setError] = useState(null);

    /**
     * useEffect hook to fetch payments when component mounts or auth changes
     * @effect
     */
    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        /**
         * Fetches payments data from API for the current user
         * @async
         */
        const fetchPayments = async () => {
            try {
                // Use direct API call to fetch user payments
                // Assumes user object contains id property
                const userId = auth.user.id || 1; // Fallback to 1 if no id present

                const response = await axiosInstance.get(
                    `${API_BASE_URL}/api/payments/user/${userId}`);

                setPayments(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching payments:", err);
                setError("Failed to fetch payments. Please try again later.");
                setLoading(false);
            }
        };

        fetchPayments();
    }, [auth]);

    /**
     * Formats date string to readable localized format
     * @param {string} dateString - ISO date string to format
     * @returns {string} Formatted date string
     */
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    /**
     * Determines CSS class for payment status badge (ONLY for PAID/FAILED statuses)
     * @param {string} status - Payment status string
     * @returns {string} CSS class name for status styling
     */
    const getStatusClass = (status) => {
        if (!status) return 'status-default';

        switch (status.toUpperCase()) {
            case 'PAID':
                return 'status-completed';
            case 'FAILED':
                return 'status-failed';
            default:
                return 'status-default';
        }
    };

    /**
     * Formats amount as USD currency with 2 decimal places
     * @param {number} amount - Payment amount to format
     * @returns {string} Formatted currency string
     */
    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    if (!auth) {
        return (
            <div className="payments-container">
                <p className="error-message">Please login to view your payments.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="payments-container">
                <div className="loading-spinner">Loading payments...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="payments-container">
                <p className="error-message">{error}</p>
            </div>
        );
    }

    if (payments.length === 0) {
        return (
            <div className="payments-container">
                <p className="info-message">You haven't made any payments yet.</p>
            </div>
        );
    }

    return (
        <div className="payments-container">
            <h2>My Payments</h2>
            <table className="payments-table">
                <thead>
                <tr>
                    <th>Payment ID</th>
                    <th>Order ID</th>
                    <th>User ID</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment Date</th>
                </tr>
                </thead>
                <tbody>
                {payments.map((payment) => (
                    <tr key={payment.id}>
                        <td>{payment.id}</td>
                        <td>{payment.orderId}</td>
                        <td>{payment.userId}</td>
                        <td>${formatAmount(payment.paymentAmount)}</td>
                        <td>
                                <span className={`status-badge ${getStatusClass(payment.status)}`}>
                                    {payment.status}
                                </span>
                        </td>
                        <td>{formatDate(payment.timestamp)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default Payments;