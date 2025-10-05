import axios from 'axios';
import { API_BASE_URL } from "../utils/constants";

const API_URL = '${API_BASE_URL}'; // адрес твоего API Gateway

export const getOrders = async (token) => {
    const res = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const createOrder = async (order, token) => {
    const res = await axios.post(`${API_URL}/orders`, order, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const updateOrder = async (id, order, token) => {
    const res = await axios.put(`${API_URL}/orders/${id}`, order, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};

export const deleteOrder = async (id, token) => {
    const res = await axios.delete(`${API_URL}/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
};
