import CartItem from "../models/CartItem";

const CART_STORAGE_PREFIX = "seagull-cart";

const cartService = {
  currentUserId: null,

  // Set current user ID for cart isolation
  setCurrentUser(userId) {
    const previousUserId = this.currentUserId;
    this.currentUserId = userId;

    // If user just signed in and had a guest cart, migrate it to their user cart
    if (userId && !previousUserId) {
      this.migrateGuestCartToUser();
    }
  },

  // Migrate guest cart to user cart when signing in
  migrateGuestCartToUser() {
    try {
      const guestKey = `${CART_STORAGE_PREFIX}-guest`;
      const userKey = this.getStorageKey();

      const guestCart = localStorage.getItem(guestKey);
      if (guestCart && !localStorage.getItem(userKey)) {
        // Only migrate if user doesn't already have a cart
        localStorage.setItem(userKey, guestCart);
        localStorage.removeItem(guestKey);

        // Dispatch update event
        window.dispatchEvent(
          new CustomEvent("cartUpdated", {
            detail: { cartCount: this.getCartItemCount() },
          }),
        );
      }
    } catch (error) {
      console.error("Error migrating guest cart:", error);
    }
  },

  // Get user-specific storage key
  getStorageKey() {
    if (!this.currentUserId) {
      return `${CART_STORAGE_PREFIX}-guest`; // For guests/unsigned users
    }
    return `${CART_STORAGE_PREFIX}-${this.currentUserId}`;
  },

  // Clear cart when user logs out
  clearUserCart(userId = null) {
    try {
      const keyToClear = userId
        ? `${CART_STORAGE_PREFIX}-${userId}`
        : this.getStorageKey();
      localStorage.removeItem(keyToClear);

      // Dispatch events to update UI
      window.dispatchEvent(
        new CustomEvent("cartUpdated", {
          detail: { cartCount: 0 },
        }),
      );
    } catch (error) {
      console.error("Error clearing user cart:", error);
    }
  },
  getCart() {
    try {
      const storageKey = this.getStorageKey();
      const savedCart = localStorage.getItem(storageKey);
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        return cartData.map((item) => CartItem.fromJSON(item));
      }
      return [];
    } catch (error) {
      console.error("Error loading cart:", error);
      return [];
    }
  },

  saveCart(cart) {
    try {
      const storageKey = this.getStorageKey();
      const cartData = cart.map((item) => item.toJSON());
      localStorage.setItem(storageKey, JSON.stringify(cartData));

      // Dispatch custom event for cart updates
      window.dispatchEvent(
        new CustomEvent("cartUpdated", {
          detail: { cartCount: this.getCartItemCount() },
        }),
      );
    } catch (error) {
      console.error("Error saving cart:", error);
      throw error;
    }
  },

  addToCart(product, quantity = 1) {
    try {
      const cart = this.getCart();
      const existingItemIndex = cart.findIndex(
        (item) =>
          item.productId === product.id && item.adminId === product.adminId,
      );

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const existingItem = cart[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity <= product.stockQuantity) {
          cart[existingItemIndex].quantity = newQuantity;
        } else {
          throw new Error("Not enough stock available");
        }
      } else {
        // Add new item to cart
        if (quantity <= product.stockQuantity) {
          const cartItem = new CartItem({
            id: Date.now().toString(), // Simple ID generation
            productId: product.id,
            adminId: product.adminId,
            name: product.name,
            price: product.sellingPrice,
            quantity: quantity,
            image: product.getMainImage(),
            maxStock: product.stockQuantity,
          });
          cart.push(cartItem);
        } else {
          throw new Error("Not enough stock available");
        }
      }

      this.saveCart(cart);
      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  },

  removeFromCart(itemId) {
    try {
      const cart = this.getCart();
      const updatedCart = cart.filter((item) => item.id !== itemId);
      this.saveCart(updatedCart);
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  },

  updateQuantity(itemId, newQuantity) {
    try {
      const cart = this.getCart();
      const itemIndex = cart.findIndex((item) => item.id === itemId);

      if (itemIndex >= 0) {
        if (newQuantity <= 0) {
          // Remove item if quantity is 0 or less
          this.removeFromCart(itemId);
        } else if (newQuantity <= cart[itemIndex].maxStock) {
          cart[itemIndex].quantity = newQuantity;
          this.saveCart(cart);
        } else {
          throw new Error("Quantity exceeds available stock");
        }
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      throw error;
    }
  },

  clearCart() {
    try {
      const storageKey = this.getStorageKey();
      localStorage.removeItem(storageKey);

      // Dispatch multiple events to ensure navbar updates
      window.dispatchEvent(
        new CustomEvent("cartUpdated", {
          detail: { cartCount: 0 },
        }),
      );

      // Also trigger storage event manually since removeItem might not trigger it
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: storageKey,
          oldValue: localStorage.getItem(storageKey),
          newValue: null,
          storageArea: localStorage,
        }),
      );
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  },

  getCartTotal() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + item.getTotalPrice(), 0);
  },

  getCartItemCount() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  },

  isProductInCart(productId, adminId) {
    const cart = this.getCart();
    return cart.some(
      (item) => item.productId === productId && item.adminId === adminId,
    );
  },
};

export default cartService;
