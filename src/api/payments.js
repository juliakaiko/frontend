import axiosInstance from "../utils/axiosInterceptor";
import { API_BASE_URL } from "../utils/constants";

export const paymentService = {
    createPayment: async (paymentData) => {

        // Converting the data to a string for the backend
        const requestData = {
            orderId: paymentData.orderId.toString(),
            userId: paymentData.userId.toString(),
            paymentAmount: parseFloat(paymentData.paymentAmount)
        };

        console.log("Sending payment request:", requestData);

        try {
            const response = await axiosInstance.post(`${API_BASE_URL}/api/payments/`, requestData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Payment service error:", error);
            throw error;
        }
    }
};