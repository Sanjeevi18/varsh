/**
 * User Order Model - Represents orders stored under users/{uid}/orders
 */

class UserOrder {
  constructor(
    id = "",
    orderNumber = "",
    userId = "",
    items = [],
    subtotal = 0,
    tax = 0,
    total = 0,
    customerNotes = "",
    status = "pending",
    paymentStatus = "pending",
    deliveryAddress = null,
    plumberService = null,
    plumberServiceFee = 0,
    createdAt = null,
    updatedAt = null,
  ) {
    this.id = id;
    this.orderNumber = orderNumber;
    this.userId = userId;
    this.items = items;
    this.subtotal = subtotal;
    this.tax = tax;
    this.total = total;
    this.customerNotes = customerNotes;
    this.status = status;
    this.paymentStatus = paymentStatus;
    this.deliveryAddress = deliveryAddress;
    this.plumberService = plumberService;
    this.plumberServiceFee = plumberServiceFee;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Convert to Firestore format
  toFirestore() {
    return {
      orderNumber: this.orderNumber,
      userId: this.userId,
      items: this.items,
      subtotal: this.subtotal,
      tax: this.tax,
      total: this.total,
      customerNotes: this.customerNotes,
      status: this.status,
      paymentStatus: this.paymentStatus,
      deliveryAddress: this.deliveryAddress,
      plumberService: this.plumberService,
      plumberServiceFee: this.plumberServiceFee,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Create from Firestore data
  static fromFirestore(data, id) {
    return new UserOrder(
      id,
      data.orderNumber || "",
      data.userId || "",
      data.items || [],
      data.subtotal || 0,
      data.tax || 0,
      data.total || 0,
      data.customerNotes || "",
      data.status || "pending",
      data.paymentStatus || "pending",
      data.deliveryAddress || null,
      data.plumberService || null,
      data.plumberServiceFee || 0,
      data.createdAt?.toDate?.() || data.createdAt,
      data.updatedAt?.toDate?.() || data.updatedAt,
    );
  }

  // Get formatted total amount
  getFormattedTotal() {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(this.total);
  }

  // Get formatted date
  getFormattedDate() {
    const date =
      this.createdAt instanceof Date
        ? this.createdAt
        : new Date(this.createdAt);
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  // Get order status color
  getStatusColor() {
    const statusColors = {
      pending: "#ffc107",
      confirmed: "#17a2b8",
      processing: "#fd7e14",
      shipped: "#6f42c1",
      delivered: "#28a745",
      cancelled: "#dc3545",
    };
    return statusColors[this.status] || "#6c757d";
  }

  // Get total item count
  getTotalItemCount() {
    return this.items.reduce((total, item) => total + (item.quantity || 1), 0);
  }

  // Check if order can be cancelled
  canBeCancelled() {
    return ["pending", "confirmed"].includes(this.status);
  }

  // Check if order is completed
  isCompleted() {
    return this.status === "delivered";
  }

  // Check if order has plumber service
  hasPlumberService() {
    return this.plumberService && this.plumberService.serviceRequested;
  }

  // Get plumber name if service is requested
  getPlumberName() {
    if (this.hasPlumberService() && this.plumberService.plumber) {
      return this.plumberService.plumber.name;
    }
    return null;
  }

  // Get order summary for display
  getOrderSummary() {
    return {
      orderNumber: this.orderNumber,
      itemCount: this.getTotalItemCount(),
      total: this.getFormattedTotal(),
      status: this.status,
      date: this.getFormattedDate(),
      hasPlumber: this.hasPlumberService(),
      plumberName: this.getPlumberName(),
    };
  }

  // Create order from checkout data
  static fromCheckoutData(checkoutData, cartItems, userId) {
    const now = new Date();
    const orderNumber = `ORD${Date.now()}`;

    // Calculate totals
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const plumberServiceFee = checkoutData.plumberService?.serviceFee || 0;
    const total = subtotal + plumberServiceFee;

    return new UserOrder(
      "", // id will be set by Firestore
      orderNumber,
      userId,
      cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        category: item.category || "",
        total: item.price * item.quantity,
      })),
      subtotal,
      0, // tax
      total,
      checkoutData.customerNotes || "",
      "pending",
      "pending",
      checkoutData.deliveryAddress,
      checkoutData.plumberService,
      plumberServiceFee,
      now,
      now,
    );
  }
}

export default UserOrder;
