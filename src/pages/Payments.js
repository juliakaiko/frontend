import React, { useEffect, useState } from "react";
//import axios from "axios";
import axiosInstance from "../utils/axiosInterceptor";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../utils/constants";
import "./Payments.css";

function Payments() {
    const { auth } = useAuth(); // ← Получаем объект авторизации из контекста
    const [payments, setPayments] = useState([]); // ← Состояние для хранения списка платежей
    const [loading, setLoading] = useState(true); // ← Состояние загрузки (изначально true)
    const [error, setError] = useState(null); // ← Состояние для ошибок

    // ВРЕМЕННО: для проверки что в auth.user
    console.log("Auth object:", auth);
    console.log("Auth user:", auth?.user);
    console.log("User ID:", auth?.user?.id);
    console.log("User email:", auth?.user?.email);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        const fetchPayments = async () => {
            try {
                // Используем прямой запрос к вашему API
                // Предполагаем, что у пользователя есть id в auth.user
                const userId = auth.user.id || 1; // если id нет, используем 1 как fallback

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

    // Функция для форматирования даты
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Функция для получения класса статуса (ТОЛЬКО для PAID/FAILED)
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

    // Функция для форматирования суммы
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