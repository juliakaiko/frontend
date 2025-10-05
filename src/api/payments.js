import axios from 'axios';
import { API_BASE_URL } from "../utils/constants";

const API_URL = '${API_BASE_URL}'; // адрес API Gateway

export const getPaymentsByUserId = async (userId, token) => {
    const res = await axios.get(`${API_BASE_URL}/api/payments/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const getPaymentsByUserId = async (userId, token) => {
    const res = await axios.get(`${API_URL}/api/payments/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const getPaymentsByUserEmail = async (email, token) => {
    const res = await axios.get(`${API_URL}/api/payments/user/email`, {
        params: { email },
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const createPayment = async (payment, token) => {
    const res = await axios.post(`${API_URL}/api/payments`, payment, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const updatePayment = async (id, payment, token) => {
    const res = await axios.put(`${API_URL}/api/payments/${id}`, payment, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const deletePayment = async (id, token) => {
    const res = await axios.delete(`${API_URL}/api/payments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};