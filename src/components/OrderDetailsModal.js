import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./css/OrderDetailsModal.css";
import { paymentService } from "../api/payments";

function OrderDetailsModal({
                               order,
                               items,
                               onClose,
                               onUpdate,
                               onDelete,
                               formatDate,
                               calculateTotal,
                               canEdit,
                               canDelete,
                               itemsLoading
                           }) {
    const { auth } = useAuth(); // Get authentication context for user data
    const [isPaying, setIsPaying] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // Get CSS class for status badge styling
    const getStatusClass = (status) => {
        if (!status) return 'status-default';

        switch (status.toUpperCase()) {
            case 'CREATED':
                return 'status-created';
            case 'PROCESSING':
                return 'status-processing';
            case 'PAID':
                return 'status-paid';
            case 'CANCELLED':
                return 'status-cancelled';
            case 'FAILED':
                return 'status-failed';
            default:
                return 'status-default';
        }
    };

    // Check if order can be paid (only non-PAID orders)
    const canPay = (orderStatus) => {
        return orderStatus !== 'PAID';
    };

    // Payment handler with authentication context integration
    const handlePayment = async () => {
        if (!window.confirm("Are you sure you want to pay for this order?")) {
            return;
        }

        setIsPaying(true);
        setPaymentError(null);
        setPaymentSuccess(false);

        try {
            // Debug logging to understand data structure
            console.log("=== DEBUG Payment Data ===");
            console.log("Order object:", order);
            console.log("Auth user:", auth?.user);
            console.log("=== END DEBUG ===");

            // Validate order data exists
            if (!order) {
                throw new Error("Order data is missing");
            }

            // Get order ID from various possible locations in the data structure
            const orderId = order?.order?.id || order?.id;
            if (!orderId) {
                throw new Error("Order ID not found in order data");
            }

            // Get user ID from authentication context (primary source)
            const userId = auth?.user?.id;
            if (!userId) {
                throw new Error("User ID not found - please ensure you are logged in");
            }

            // Calculate total amount and validate it
            const totalAmount = calculateTotal(order.order || order);
            if (totalAmount <= 0 || isNaN(totalAmount)) {
                throw new Error("Invalid order total amount");
            }

            // Prepare payment data with proper type conversion
            const paymentData = {
                orderId: orderId.toString(),      // Ensure string type
                userId: userId.toString(),        // Ensure string type
                paymentAmount: totalAmount
            };

            console.log("Final payment data being sent:", paymentData);

            // Send payment request to backend
            const result = await paymentService.createPayment(paymentData);
            console.log("Payment successful:", result);

            // Show success message
            setPaymentSuccess(true);

            // Close modal and reload page after successful payment
            setTimeout(() => {
                onClose();
                window.location.reload(); // Refresh to show updated order status
            }, 2000);

        } catch (error) {
            console.error("Payment processing error:", error);

            // Handle different types of errors with appropriate messages
            let errorMessage = "Failed to process payment. Please try again.";

            if (error.response?.status === 400) {
                // Backend validation error
                if (error.response?.data) {
                    errorMessage = `Validation error: ${JSON.stringify(error.response.data)}`;
                } else {
                    errorMessage = "Invalid payment data. Please check that all fields are correct.";
                }
            } else if (error.response?.data?.message) {
                // Backend error with message
                errorMessage = error.response.data.message;
            } else if (error.message) {
                // Frontend error
                errorMessage = error.message;
            }

            setPaymentError(errorMessage);
        } finally {
            setIsPaying(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="order-modal" onClick={(e) => e.stopPropagation()}>
                <div className="order-modal-header">
                    <h3>Order Details</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="order-modal-content">
                    {/* Payment Status Messages */}
                    {paymentSuccess && (
                        <div className="payment-success-message">
                            ✅ Payment successful! Order status updated to PAID.
                        </div>
                    )}
                    {paymentError && (
                        <div className="payment-error-message">
                            ❌ {paymentError}
                        </div>
                    )}

                    <div className="order-basic-info">
                        <div className="info-row">
                            <span className="info-label">Order ID:</span>
                            <span className="info-value">{order.order.id}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Status:</span>
                            <span className={`info-value status-badge ${getStatusClass(order.order.status)}`}>
                                {order.order.status}
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Creation Date:</span>
                            <span className="info-value">{formatDate(order.order.creationDate)}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Customer:</span>
                            <span className="info-value">{order.user.name} {order.user.surname}</span>
                        </div>
                    </div>

                    <div className="order-items-section">
                        <h4>Order Items</h4>
                        {itemsLoading ? (
                            <div className="loading-message">Loading products data...</div>
                        ) : (
                            <table className="order-items-table">
                                <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Subtotal</th>
                                </tr>
                                </thead>
                                <tbody>
                                {order.order.orderItems.map((orderItem, index) => {
                                    const item = items[orderItem.itemId];
                                    const price = item ? parseFloat(item.price) : 0;
                                    const subtotal = price * orderItem.quantity;

                                    return (
                                        <tr key={index}>
                                            <td>{item?.name || 'Unknown Product'}</td>
                                            <td>{orderItem.quantity}</td>
                                            <td>${price.toFixed(2)}</td>
                                            <td>${subtotal.toFixed(2)}</td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="order-total-section">
                        <div className="total-row">
                            <span className="total-label">Total Amount:</span>
                            <span className="total-value">${calculateTotal(order.order).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="order-modal-actions">
                    <div className="order-modal-actions-left">
                        {canEdit(order.order.status) && (
                            <button className="btn-update" onClick={onUpdate}>
                                Update Order
                            </button>
                        )}
                        {canDelete(order.order.status) && (
                            <button className="btn-danger" onClick={onDelete}>
                                Delete Order
                            </button>
                        )}
                    </div>

                    <div className="order-modal-actions-right">
                        {canPay(order.order.status) && (
                            <button className="btn-pay" onClick={handlePayment} disabled={isPaying}>
                                {isPaying ? "Processing..." : "Pay Order"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderDetailsModal;