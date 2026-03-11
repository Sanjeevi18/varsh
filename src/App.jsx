import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedAdminRoute from "./user/ProtectedAdminRoute";
import Home from "./user/Home";
import ProductShop from "./user/product/views/ProductShop";
import ProductDetail from "./user/product/views/ProductDetail";
import CartView from "./user/cart/views/CartView";
import CheckoutPage from "./user/checkout/CheckoutPage";
import UPIPaymentScreen from "./user/checkout/UPIPaymentScreen";
import UserOrders from "./user/UserOrders";
import Dashboard from "./admin/Dashboard";
import ItemManagement from "./admin/item/views/ItemManagement";
import ItemAddScreen from "./admin/item/views/ItemAddScreen";
import PlumberManagement from "./admin/plumber/views/PlumberManagement";
import PlumberAddScreen from "./admin/plumber/views/PlumberAddScreen";
import OrderManagement from "./admin/order/views/OrderManagement";
import OrderViewScreen from "./admin/order/views/OrderViewScreen";
import SignUp from "./auth/SignUp";
import SignIn from "./auth/SignIn";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductShop />} />
          <Route path="/user/products" element={<ProductShop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartView />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/user/checkout" element={<CheckoutPage />} />
          <Route path="/user/payment/upi" element={<UPIPaymentScreen />} />
          <Route path="/orders" element={<UserOrders />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <Dashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/items"
            element={
              <ProtectedAdminRoute>
                <ItemManagement />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/items/add"
            element={
              <ProtectedAdminRoute>
                <ItemAddScreen />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/items/edit/:id"
            element={
              <ProtectedAdminRoute>
                <ItemAddScreen />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/plumbers"
            element={
              <ProtectedAdminRoute>
                <PlumberManagement />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/plumbers/add"
            element={
              <ProtectedAdminRoute>
                <PlumberAddScreen />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/plumbers/edit/:id"
            element={
              <ProtectedAdminRoute>
                <PlumberAddScreen />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedAdminRoute>
                <OrderManagement />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/orders/:orderId"
            element={
              <ProtectedAdminRoute>
                <OrderViewScreen />
              </ProtectedAdminRoute>
            }
          />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
