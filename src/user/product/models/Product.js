class Product {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || "";
    this.category = data.category || "";
    this.stockQuantity = data.stockQuantity || 0;
    this.purchasePrice = data.purchasePrice || 0;
    this.sellingPrice = data.sellingPrice || 0;
    this.gstPercentage = data.gstPercentage || 0;
    this.description = data.description || "";
    this.images = data.images || [];
    this.imageUrl = data.imageUrl || ""; // Cloudinary URL for backward compatibility
    this.imagePublicId = data.imagePublicId || "";
    this.firebaseImageUrl = data.firebaseImageUrl || ""; // Firebase Storage URL
    this.firebaseImagePath = data.firebaseImagePath || "";
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static fromFirestore(doc) {
    if (!doc.exists()) {
      throw new Error("Document does not exist");
    }

    const data = doc.data();
    return new Product({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    });
  }

  toFirestore() {
    return {
      name: this.name,
      category: this.category,
      stockQuantity: this.stockQuantity,
      purchasePrice: this.purchasePrice,
      sellingPrice: this.sellingPrice,
      gstPercentage: this.gstPercentage,
      description: this.description,
      images: this.images,
      imageUrl: this.imageUrl,
      imagePublicId: this.imagePublicId,
      firebaseImageUrl: this.firebaseImageUrl,
      firebaseImagePath: this.firebaseImagePath,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  getDisplayPrice() {
    return this.sellingPrice;
  }

  getDiscountedPrice() {
    // Can add discount logic here later
    return this.sellingPrice;
  }

  isInStock() {
    return this.stockQuantity > 0;
  }

  getMainImage() {
    // Priority order: Cloudinary URL -> Firebase URL -> Images array -> Placeholder

    // First check if there's a direct imageUrl (from Cloudinary)
    if (this.imageUrl && this.imageUrl.trim() !== "") {
      return this.imageUrl;
    }

    // Then check Firebase image URL
    if (this.firebaseImageUrl && this.firebaseImageUrl.trim() !== "") {
      return this.firebaseImageUrl;
    }

    // Then check if there are images array
    if (this.images && this.images.length > 0) {
      return this.images[0].url || this.images[0];
    }

    // Default placeholder
    return "https://via.placeholder.com/300x300?text=No+Image";
  }
}

export default Product;
