import React, { useEffect, useState } from "react";
//import axios from "axios";
import axiosInstance from "../utils/axiosInterceptor";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../utils/constants";
import "./Orders.css";

function Orders() {
    const { auth } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }
        fetchOrders();
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
                console.error(err);
                setError("Failed to fetch orders");
                setLoading(false);
            });
    };

    // Функция для получения класса статуса
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

    // Функция для форматирования даты
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

    // Обработчики CRUD операций
    const handleEdit = (order) => {
        setEditingOrder(order);
    };

    const handleDelete = async (orderId) => {
        if (!window.confirm("Are you sure you want to delete this order?")) {
            return;
        }

        try {
            await axiosInstance.delete(`${API_BASE_URL}/api/orders/${orderId}`);
            fetchOrders(); // Обновляем список
            alert("Order deleted successfully!");
        } catch (err) {
            console.error("Delete error:", err);
            alert("Failed to delete order");
        }
    };

    const handleCreate = async (orderData) => {
        try {
            // Подготовка данных для создания заказа
            const newOrder = {
                userId: auth.user.id,
                status: "CREATED",
                orderItems: orderData.orderItems || [],
                // добавьте другие необходимые поля
            };

            await axiosInstance.post(`${API_BASE_URL}/api/orders/`, newOrder);

            setShowCreateForm(false);
            fetchOrders(); // Обновляем список
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
            fetchOrders(); // Обновляем список
            alert("Order updated successfully!");
        } catch (err) {
            console.error("Update error:", err);
            alert("Failed to update order");
        }
    };

    const canEdit = (status) => {
        return ['CREATED', 'FAILED'].includes(status);
    };

    const canDelete = (status) => {
        return ['CREATED', 'FAILED', 'CANCELLED'].includes(status);
    };

    if (!auth) {
        return <p>Please login to view your orders.</p>;
    }

    if (loading) return <p>Loading orders...</p>;
    if (error) return <p>{error}</p>;

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
                <p className="info-message">You haven't made any orders yet.</p>
            ) : (
                <table className="orders-table">
                    <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Status</th>
                        <th>Creation Date</th>
                        <th>Items Count</th>
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
                            <td>{entry.user.name} {entry.user.surname}</td>
                            <td>
                                <div className="action-buttons">
                                    {canEdit(entry.order.status) && (
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleEdit(entry)}
                                        >
                                            Edit
                                        </button>
                                    )}
                                    {canDelete(entry.order.status) && (
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDelete(entry.order.id)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                    <button
                                        className="btn-view"
                                        onClick={() => handleEdit(entry)}
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

            {/* Форма редактирования */}
            {editingOrder && (
                <OrderForm
                    order={editingOrder}
                    onSave={handleUpdate}
                    onCancel={() => setEditingOrder(null)}
                    mode="edit"
                />
            )}

            {/* Форма создания */}
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

// Компонент формы для создания/редактирования заказа
function OrderForm({ order, onSave, onCancel, mode }) {
    const [formData, setFormData] = useState({
        status: order?.order?.status || "CREATED",
        orderItems: order?.order?.orderItems || []
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="order-form-modal">
                <h3>{mode === 'create' ? 'Create New Order' : 'Edit Order'}</h3>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Status:</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                        >
                            <option value="CREATED">CREATED</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="PAID">PAID</option>
                            <option value="CANCELLED">CANCELLED</option>
                            <option value="FAILED">FAILED</option>
                        </select>
                    </div>

                    {/* Здесь можно добавить поля для orderItems */}
                    <div className="form-group">
                        <label>Order Items (JSON):</label>
                        <textarea
                            value={JSON.stringify(formData.orderItems, null, 2)}
                            onChange={(e) => {
                                try {
                                    const items = JSON.parse(e.target.value);
                                    setFormData({...formData, orderItems: items});
                                } catch (err) {
                                    // Обработка ошибок парсинга JSON
                                }
                            }}
                            rows="4"
                            placeholder='[{"productId": 1, "quantity": 2}, ...]'
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-save">
                            {mode === 'create' ? 'Create' : 'Update'}
                        </button>
                        <button type="button" className="btn-cancel" onClick={onCancel}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Orders;