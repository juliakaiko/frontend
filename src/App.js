import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import OrderCreate from './pages/OrderCreate';
import OrderUpdate from './pages/OrderUpdate';
import OrderPay from './pages/OrderPay';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Welcome from './pages/Welcome';
import Account from "./pages/Account";

function PrivateRoute({ children }) {
  const { auth } = useAuth();
  return auth ? children : <Navigate to="/login" />;
}

function App() {
  return (
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
            <Route path="/payments" element={<PrivateRoute><Payments /></PrivateRoute>} />
            <Route path="/orders/create" element={<PrivateRoute><OrderCreate /></PrivateRoute>} />
            <Route path="/orders/update/:id" element={<PrivateRoute><OrderUpdate /></PrivateRoute>} />
            <Route path="/orders/pay/:id" element={<PrivateRoute><OrderPay /></PrivateRoute>} />
            <Route path="/welcome" element={<PrivateRoute><Welcome /></PrivateRoute>} />
            <Route path="/account" element={<PrivateRoute><Account /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/orders" />} />
            <Route path="/" element={<h2>Welcome to the app!</h2>} />
          </Routes>
        </Router>
      </AuthProvider>
  );
}

export default App;
