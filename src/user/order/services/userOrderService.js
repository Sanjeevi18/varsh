import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";

/**
 * User Order Service - Handles orders stored under users/{uid}/orders
 */

// Get orders collection for a specific user
const getUserOrdersCollection = (userId) => {
  return collection(db, "users", userId, "orders");
};

// Add a new order to user's orders subcollection
export const addUserOrder = async (userId, orderData) => {
  try {
    console.log("Adding order for user:", userId, orderData);

    if (!userId) {
      throw new Error("User ID is required");
    }

    const ordersRef = getUserOrdersCollection(userId);

    // Generate order number
    const orderNumber = await generateOrderNumber(userId);

    // Prepare comprehensive order data with all checkout details
    const order = {
      orderNumber,
      userId,
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      tax: orderData.tax || 0,
      total: orderData.total || 0,
      customerNotes: orderData.customerNotes || "",
      status: orderData.status || "pending",
      paymentStatus: orderData.paymentStatus || "pending",
      paymentMethod: orderData.paymentMethod || "cod",
      deliveryAddress: orderData.deliveryAddress || null,
      plumberService: orderData.plumberService || null,
      plumberServiceFee: orderData.plumberServiceFee || 0,
      orderSource: orderData.orderSource || "website",
      hasPlumberService: orderData.hasPlumberService || false,
      checkoutStages: orderData.checkoutStages || {
        addressCompleted: false,
        paymentMethodSelected: false,
        plumberSelected: false,
        orderConfirmed: false,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(ordersRef, order);

    console.log("Order added successfully:", docRef.id);

    return {
      success: true,
      orderId: docRef.id,
      order: { ...order, id: docRef.id },
      message: "Order placed successfully!",
    };
  } catch (error) {
    console.error("Error adding user order:", error);
    return {
      success: false,
      error: error.message || "Failed to place order",
    };
  }
};

// Get all orders for a specific user
export const getUserOrders = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const ordersRef = getUserOrdersCollection(userId);
    const q = query(ordersRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const orders = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      });
    });

    return {
      success: true,
      orders,
    };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch orders",
    };
  }
};

// Get a specific order by ID for a user
export const getUserOrderById = async (userId, orderId) => {
  try {
    if (!userId || !orderId) {
      throw new Error("User ID and Order ID are required");
    }

    const orderRef = doc(db, "users", userId, "orders", orderId);
    const orderDoc = await getDoc(orderRef);

    if (!orderDoc.exists()) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    const data = orderDoc.data();
    const order = {
      id: orderDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    };

    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error("Error fetching user order:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch order",
    };
  }
};

// Get recent orders for a user (for footer display)
export const getRecentUserOrders = async (userId, limit = 3) => {
  try {
    if (!userId) {
      return {
        success: true,
        orders: [],
      };
    }

    const ordersRef = getUserOrdersCollection(userId);
    const q = query(ordersRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const orders = [];
    let count = 0;
    snapshot.forEach((doc) => {
      if (count < limit) {
        const data = doc.data();
        orders.push({
          id: doc.id,
          orderNumber: data.orderNumber,
          total: data.total || 0,
          status: data.status || "pending",
          createdAt: data.createdAt?.toDate?.() || new Date(),
          itemCount: data.items?.length || 0,
        });
        count++;
      }
    });

    return {
      success: true,
      orders,
    };
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch recent orders",
      orders: [],
    };
  }
};

// Generate order number
const generateOrderNumber = async (userId) => {
  try {
    const ordersRef = getUserOrdersCollection(userId);
    const q = query(ordersRef, orderBy("orderNumber", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return "ORD-00001";
    }

    const lastOrder = snapshot.docs[0].data();
    const lastNumber = parseInt(lastOrder.orderNumber?.split("-")[1] || "0");
    const newNumber = lastNumber + 1;
    return `ORD-${String(newNumber).padStart(5, "0")}`;
  } catch (error) {
    console.error("Error generating order number:", error);
    // Fallback to timestamp-based order number
    const timestamp = Date.now().toString().slice(-5);
    return `ORD-${timestamp}`;
  }
};

// Update order status
export const updateUserOrderStatus = async (userId, orderId, status) => {
  try {
    if (!userId || !orderId || !status) {
      throw new Error("User ID, Order ID, and status are required");
    }

    const orderRef = doc(db, "users", userId, "orders", orderId);

    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: "Order status updated successfully",
    };
  } catch (error) {
    console.error("Error updating order status:", error);
    return {
      success: false,
      error: error.message || "Failed to update order status",
    };
  }
};

export default {
  addUserOrder,
  getUserOrders,
  getUserOrderById,
  getRecentUserOrders,
  updateUserOrderStatus,
};
