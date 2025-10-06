import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInterceptor";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../utils/constants";
import OrderForm from "../components/OrderForm";
import OrderDetailsModal from "../components/OrderDetailsModal";
import "./css/Orders.css";

function Orders() {
    const { auth } = useAuth();
    const [orders, setOrders] = useState([]);
    const [items, setItems] = useState({}); // Store all items as { itemId: itemData }
    const [loading, setLoading] = useState(true);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Fetch orders and items when component mounts or auth changes
    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }
        fetchOrders();
        fetchAllItems();
    }, [auth]);

    const fetchOrders = () => {
        axiosInstance
            .get(`${API_BASE_URL}/api/orders/by-email`, {
                params: { email: auth.user.email }
            })
            .then((res) => {
                setOrders(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching orders:", err);
                setError("Failed to fetch orders. Please try again later.");
                setLoading(false);
            });
    };

    const fetchAllItems = async () => {
        try {
            setItemsLoading(true);
            const response = await axiosInstance.get(`${API_BASE_URL}/api/items/all`);
            const itemsMap = {};
            response.data.forEach(item => {
                itemsMap[item.id] = item;
            });
            setItems(itemsMap);
        } catch (err) {
            console.error("Error fetching items:", err);
            setError("Failed to load products data. Please try again later.");
        } finally {
            setItemsLoading(false);
        }
    };

    // Get CSS class for order status badge
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

    // Format date string to readable format
    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    };

    // Calculate total amount for an order using items data
    const calculateOrderTotal = (order) => {
        return order.orderItems.reduce((total, orderItem) => {
            const item = items[orderItem.itemId];
            const price = item ? parseFloat(item.price) : 0;
            const quantity = orderItem.quantity || 0;
            return total + (price * quantity);
        }, 0);
    };

    // CRUD operation handlers
    const handleView = (order) => {
        setSelectedOrder(order);
    };

    const handleDelete = async (orderId) => {
        if (!window.confirm("Are you sure you want to delete this order?")) {
            return;
        }

        try {
            await axiosInstance.delete(`${API_BASE_URL}/api/orders/${orderId}`);
            fetchOrders();
            setSelectedOrder(null);
            alert("Order deleted successfully!");
        } catch (err) {
            console.error("Delete error:", err);
            alert("Failed to delete order");
        }
    };

    const handleCreate = async (orderData) => {
        try {
            const newOrder = {
                userId: auth.user.id,
                status: "CREATED",
                orderItems: orderData.orderItems || [],
            };

            await axiosInstance.post(`${API_BASE_URL}/api/orders/`, newOrder);
            setShowCreateForm(false);
            fetchOrders();
            alert("Order created successfully!");
        } catch (err) {
            console.error("Create error:", err);
            alert("Failed to create order");
        }
    };

    const handleUpdate = async (orderData) => {
        try {
            await axiosInstance.put(`${API_BASE_URL}/api/orders/${editingOrder.order.id}`, orderData);
            setEditingOrder(null);
            setSelectedOrder(null);
            fetchOrders();
            alert("Order updated successfully!");
        } catch (err) {
            console.error("Update error:", err);
            alert("Failed to update order");
        }
    };

    // Check if order can be edited based on status
    const canEdit = (status) => {
        return !['PROCESSING', 'PAID'].includes(status);
    };

    // Check if order can be deleted based on status
    const canDelete = (status) => {
        return ['CREATED', 'FAILED', 'CANCELLED'].includes(status);
    };

    // Render loading state if user is not authenticated
    if (!auth) {
        return <p>Please login to view your orders.</p>;
    }

    if (loading) return <div className="loading-spinner">Loading orders...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="orders-container">
            <div className="orders-header">
                <h2>My Orders</h2>
                <button
                    className="btn-create"
                    onClick={() => setShowCreateForm(true)}
                >
                    + Create New Order
                </button>
            </div>

            {orders.length === 0 ? (
                <div className="info-message">You haven't made any orders yet.</div>
            ) : (
                <table className="orders-table">
                    <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Status</th>
                        <th>Creation Date</th>
                        <th>Items Count</th>
                        <th>Total Amount</th>
                        <th>User</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {orders.map((entry) => (
                        <tr key={entry.order.id}>
                            <td>{entry.order.id}</td>
                            <td>
                                <span className={`status-badge ${getStatusClass(entry.order.status)}`}>
                                    {entry.order.status}
                                </span>
                            </td>
                            <td>{formatDate(entry.order.creationDate)}</td>
                            <td>{entry.order.orderItems.length}</td>
                            <td>${calculateOrderTotal(entry.order).toFixed(2)}</td>
                            <td>{entry.user.name} {entry.user.surname}</td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        className="btn-view"
                                        onClick={() => handleView(entry)}
                                    >
                                        View
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    items={items}
                    onClose={() => setSelectedOrder(null)}
                    onUpdate={() => {
                        setSelectedOrder(null);
                        setEditingOrder(selectedOrder);
                    }}
                    onDelete={() => handleDelete(selectedOrder.order.id)}
                    formatDate={formatDate}
                    calculateTotal={calculateOrderTotal}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    itemsLoading={itemsLoading}
                />
            )}

            {editingOrder && (
                <OrderForm
                    order={editingOrder}
                    onSave={handleUpdate}
                    onCancel={() => setEditingOrder(null)}
                    mode="edit"
                />
            )}

            {showCreateForm && (
                <OrderForm
                    onSave={handleCreate}
                    onCancel={() => setShowCreateForm(false)}
                    mode="create"
                />
            )}
        </div>
    );
}

export default Orders;