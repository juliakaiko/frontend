import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import axiosInstance from "../utils/axiosInterceptor";
import "./css/Home.css";

function Home() {
    const { auth } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [creatingOrder, setCreatingOrder] = useState(false);

    // Загрузка товаров
    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await axiosInstance.get("/api/items/all");
            setItems(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error loading items:", error);
            setLoading(false);
        }
    };

    const addToCart = (item) => {
        const existingItem = cart.find(cartItem => cartItem.id === item.id);

        if (existingItem) {
            setCart(cart.map(cartItem =>
                cartItem.id === item.id
                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                    : cartItem
            ));
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }

        alert(`Item "${item.name}" added to cart!`);
    };

    const removeFromCart = (itemId) => {
        setCart(cart.filter(item => item.id !== itemId));
    };

    const updateCartQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(itemId);
            return;
        }

        setCart(cart.map(item =>
            item.id === itemId
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    const getTotalCartPrice = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const createOrderFromCart = async () => {
        if (!auth) {
            alert("Please login to create an order");
            return;
        }

        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        try {
            setCreatingOrder(true);

            const orderData = {
                userId: auth.user.id,
                status: "CREATED",
                orderItems: cart.map(cartItem => ({
                    itemId: cartItem.id,
                    quantity: cartItem.quantity
                }))
            };

            await axiosInstance.post("/api/orders/", orderData);

            // Clear cart after successful order creation
            setCart([]);
            alert("Order created successfully from your cart!");

        } catch (error) {
            console.error("Error creating order:", error);
            alert("Failed to create order. Please try again.");
        } finally {
            setCreatingOrder(false);
        }
    };

    const clearCart = () => {
        if (cart.length === 0) return;
        if (window.confirm("Are you sure you want to clear your cart?")) {
            setCart([]);
        }
    };

    if (loading) {
        return (
            <div className="home-container">
                <div className="loading-section">
                    <div className="loading-spinner"></div>
                    <p>Loading items...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="home-container">
            {/* Hero Section */}
            <div className="hero-section">
                <h1>🛍️ Welcome to Our Store!</h1>
                <p>Discover the best products at great prices</p>
            </div>

            {/* Cart Summary */}
            {cart.length > 0 && (
                <div className="cart-summary">
                    <div className="cart-info">
                        <span>🛒 Cart: {cart.length} item(s)</span>
                        <span>Total: {getTotalCartPrice().toLocaleString()} $</span>
                    </div>
                    <div className="cart-actions">
                        <button
                            className="checkout-btn"
                            onClick={createOrderFromCart}
                            disabled={creatingOrder}
                        >
                            {creatingOrder ? "Creating Order..." : "Create Order"}
                        </button>
                        <button
                            className="clear-cart-btn"
                            onClick={clearCart}
                        >
                            Clear Cart
                        </button>
                    </div>
                </div>
            )}

            {/* Items Grid */}
            <div className="items-section">
                <h2>📦 All Products ({items.length})</h2>

                {items.length === 0 ? (
                    <div className="no-items">
                        <p>😔 No products found</p>
                    </div>
                ) : (
                    <div className="items-grid">
                        {items.map((item) => (
                            <div key={item.id} className="item-card">
                                <div className="item-image">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} />
                                    ) : (
                                        <div className="item-placeholder">📦</div>
                                    )}
                                </div>

                                <div className="item-info">
                                    <h3 className="item-name">{item.name}</h3>
                                    {item.description && (
                                        <p className="item-description">
                                            {item.description}
                                        </p>
                                    )}
                                    <div className="item-price">
                                        {item.price ? `${item.price.toLocaleString()} $` : "Price not specified"}
                                    </div>

                                    <div className="item-stock in-stock">
                                        ✓ In stock
                                    </div>
                                </div>

                                <div className="item-actions">
                                    <button
                                        className="add-to-cart-btn"
                                        onClick={() => addToCart(item)}
                                    >
                                        🛒 Add to Cart
                                    </button>

                                    {cart.find(cartItem => cartItem.id === item.id) && (
                                        <div className="cart-quantity">
                                            In cart: {cart.find(cartItem => cartItem.id === item.id).quantity} pcs.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cart Sidebar */}
            {cart.length > 0 && (
                <div className="cart-sidebar">
                    <div className="cart-header">
                        <h3>🛒 Your Cart</h3>
                        <button className="clear-cart-btn-small" onClick={clearCart}>
                            🗑️
                        </button>
                    </div>
                    <div className="cart-items">
                        {cart.map(item => (
                            <div key={item.id} className="cart-item">
                                <div className="cart-item-info">
                                    <span className="cart-item-name">{item.name}</span>
                                    <div className="cart-item-controls">
                                        <button
                                            className="quantity-btn"
                                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                        >
                                            -
                                        </button>
                                        <span className="cart-item-quantity">{item.quantity}</span>
                                        <button
                                            className="quantity-btn"
                                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <span className="cart-item-price">{(item.price * item.quantity).toLocaleString()} $</span>
                                </div>
                                <button
                                    className="remove-from-cart-btn"
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    ❌
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="cart-footer">
                        <div className="cart-total">
                            <strong>Total: {getTotalCartPrice().toLocaleString()} $</strong>
                        </div>
                        <button
                            className="create-order-btn"
                            onClick={createOrderFromCart}
                            disabled={creatingOrder}
                        >
                            {creatingOrder ? "🔄 Creating..." : "📦 Create Order"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;