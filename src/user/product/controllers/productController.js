import { useState, useEffect, useCallback } from "react";
import productService from "../services/productService";
import cartService from "../../cart/services/cartService";

const useProductController = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  const filterProducts = useCallback(() => {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm.trim()) {
      const lowercaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(lowercaseSearchTerm) ||
          product.description.toLowerCase().includes(lowercaseSearchTerm) ||
          product.category.toLowerCase().includes(lowercaseSearchTerm),
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) =>
          product.category.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

  // Filter products when products, searchTerm, or selectedCategory changes
  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const productsData = await productService.getAllProducts();
      setProducts(productsData);
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  const handleAddToCart = async (product, quantity = 1) => {
    try {
      await cartService.addToCart(product, quantity);
      return { success: true, message: "Product added to cart!" };
    } catch (err) {
      console.error("Error adding to cart:", err);
      return {
        success: false,
        message: err.message || "Failed to add to cart",
      };
    }
  };

  // Static categories from ItemAddScreen - display all categories regardless of products
  const getAllCategories = () => {
    return [
      "PVC Pipes",
      "Water Tanks",
      "Bathware",
      "Bathroom Accessories",
      "Plumbing Tools",
      "Hardware",
    ];
  };

  const refreshProducts = () => {
    loadProducts();
  };

  return {
    products: filteredProducts,
    allProducts: products,
    loading,
    error,
    searchTerm,
    selectedCategory,
    categories: getAllCategories(),
    handleSearch,
    handleCategoryFilter,
    handleAddToCart,
    refreshProducts,
  };
};

export default useProductController;
