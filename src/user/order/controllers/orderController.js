import { useState } from "react";
import * as orderService from "../services/userOrderService";
import Order from "../models/UserOrder";

const useOrderController = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);

  // Create a new order
  const createOrder = async (orderData) => {
    setLoading(true);
    try {
      // Extract userId from orderData or use the current user
      const userId = orderData.userId;
      if (!userId) {
        throw new Error("User ID is required for order creation");
      }

      // Generate order number if not provided
      if (!orderData.orderNumber) {
        orderData.orderNumber = `ORD${Date.now()}`;
      }

      const result = await orderService.addUserOrder(userId, orderData);

      if (result.success) {
        // Refresh orders list if needed
        setOrders((prev) => [result.order, ...prev]);
      }

      return result;
    } catch (error) {
      console.error("Error in createOrder controller:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch user orders
  const fetchUserOrders = async (userId) => {
    setLoading(true);
    try {
      const result = await orderService.getUserOrders(userId);
      if (result.success) {
        setOrders(result.orders);
      }
      return result;
    } catch (error) {
      console.error("Error in fetchUserOrders controller:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch single order
  const fetchOrderById = async (orderId) => {
    setLoading(true);
    try {
      const result = await orderService.getUserOrderById(orderId);
      return result;
    } catch (error) {
      console.error("Error in fetchOrderById controller:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    setLoading(true);
    try {
      const result = await orderService.updateUserOrderStatus(orderId, status);

      if (result.success) {
        // Update local orders state
        setOrders((prev) =>
          prev.map((order) =>
            order.orderId === orderId ? { ...order, status } : order,
          ),
        );
      }

      return result;
    } catch (error) {
      console.error("Error in updateOrderStatus controller:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    orders,
    createOrder,
    fetchUserOrders,
    fetchOrderById,
    updateOrderStatus,
  };
};

export default useOrderController;
