import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInterceptor";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../utils/constants";
import "./css/OrderForm.css";

function OrderForm({ order, onSave, onCancel, mode }) {
    const { auth } = useAuth();

    // Standardizes form data structure for both create and edit modes
    // Ensures consistent format by mapping existing order items or initializing with default values
    const [formData, setFormData] = useState({
        status: order?.order?.status || "CREATED",
        orderItems: order?.order?.orderItems?.map(item => ({
            itemId: item.item?.id || item.itemId,
            quantity: item.quantity || 1
        })) || [{ itemId: "", quantity: 1 }]
    });
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Load available items from backend
    useEffect(() => {
        const fetchItems = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get(`${API_BASE_URL}/api/items/all`);
                setItems(response.data);
            } catch (err) {
                console.error("Failed to fetch items:", err);
                setErrors(prev => ({ ...prev, items: "Failed to load products" }));
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate form
        const newErrors = {};

        if (!formData.orderItems.length) {
            newErrors.orderItems = "At least one item is required";
        }

        formData.orderItems.forEach((item, index) => {
            if (!item.itemId) {
                newErrors[`item_${index}`] = "Please select a product";
            }
            if (!item.quantity || item.quantity < 1) {
                newErrors[`quantity_${index}`] = "Quantity must be at least 1";
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Prepare data for API
        const orderData = {
            userId: auth.user.id,
            status: formData.status,
            orderItems: formData.orderItems.map(item => ({
                itemId: item.itemId,
                quantity: item.quantity
            }))
        };

        onSave(orderData);
    };

    const addOrderItem = () => {
        setFormData(prev => ({
            ...prev,
            orderItems: [...prev.orderItems, { itemId: "", quantity: 1 }]
        }));
    };

    const removeOrderItem = (index) => {
        if (formData.orderItems.length > 1) {
            setFormData(prev => ({
                ...prev,
                orderItems: prev.orderItems.filter((_, i) => i !== index)
            }));
        }
    };

    const updateOrderItem = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            orderItems: prev.orderItems.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));

        // Clear error when user starts typing
        if (errors[`${field}_${index}`]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`${field}_${index}`];
                return newErrors;
            });
        }
    };

    const getItemPrice = (itemId) => {
        const item = items.find(i => i.id === parseInt(itemId));
        return item ? `$${item.price}` : "";
    };

    const calculateTotal = () => {
        return formData.orderItems.reduce((total, orderItem) => {
            const item = items.find(i => i.id === parseInt(orderItem.itemId));
            if (item && orderItem.quantity) {
                return total + (parseFloat(item.price) * orderItem.quantity);
            }
            return total;
        }, 0);
    };

    return (
        <div className="modal-overlay">
            <div className="order-form-modal" onClick={(e) => e.stopPropagation()}>
                <div className="order-form-header">
                    <h3>{mode === 'create' ? 'Create New Order' : 'Edit Order'}</h3>
                    <button className="close-btn" onClick={onCancel}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="order-form">
                    <div className="order-items-section">
                        <div className="section-header">
                            <label>Order Items</label>
                            <button
                                type="button"
                                className="btn-add-item"
                                onClick={addOrderItem}
                            >
                                + Add Item
                            </button>
                        </div>

                        {loading ? (
                            <div className="loading">Loading products...</div>
                        ) : errors.items ? (
                            <div className="error-message">{errors.items}</div>
                        ) : (
                            formData.orderItems.map((orderItem, index) => (
                                <div key={index} className="order-item-row">
                                    <div className="item-select">
                                        <select
                                            value={orderItem.itemId}
                                            onChange={(e) => updateOrderItem(index, 'itemId', e.target.value)}
                                            className={errors[`item_${index}`] ? "error" : ""}
                                        >
                                            <option value="">Select a product</option>
                                            {items.map(item => (
                                                <option key={item.id} value={item.id}>
                                                    {item.name} - ${item.price}
                                                </option>
                                            ))}
                                        </select>
                                        {errors[`item_${index}`] && (
                                            <span className="error-text">{errors[`item_${index}`]}</span>
                                        )}
                                    </div>

                                    <div className="quantity-input">
                                        <input
                                            type="number"
                                            min="1"
                                            value={orderItem.quantity}
                                            onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                            className={errors[`quantity_${index}`] ? "error" : ""}
                                        />
                                        {errors[`quantity_${index}`] && (
                                            <span className="error-text">{errors[`quantity_${index}`]}</span>
                                        )}
                                    </div>

                                    <div className="item-price">
                                        {getItemPrice(orderItem.itemId)}
                                    </div>

                                    <div className="item-actions">
                                        {formData.orderItems.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn-remove"
                                                onClick={() => removeOrderItem(index)}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {formData.orderItems.length > 0 && (
                        <div className="order-total">
                            <strong>Total: ${calculateTotal().toFixed(2)}</strong>
                        </div>
                    )}

                    {errors.orderItems && (
                        <div className="error-message">{errors.orderItems}</div>
                    )}

                    <div className="form-actions">
                        <button type="submit" className="btn-save">
                            {mode === 'create' ? 'Create Order' : 'Update Order'}
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

export default OrderForm;