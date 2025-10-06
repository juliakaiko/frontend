import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./css/Navbar.css";

function Navbar() {
    const { auth, logout } = useAuth();

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/" className="nav-link brand">👜 Shop</Link>

                {!auth && (
                    <>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="nav-link">Register</Link>
                    </>
                )}

                {auth && (
                    <>
                        <Link to="/account" className="nav-link">My Account</Link>
                        <Link to="/orders" className="nav-link">My Orders</Link>
                        <Link to="/payments" className="nav-link">My Payments</Link>
                    </>
                )}
            </div>

            <div className="navbar-right">
                {auth && (
                    <button onClick={logout} className="logout-btn">Logout</button>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
