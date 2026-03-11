import { storage } from "../firebaseConfig";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

class FirebaseStorageService {
  /**
   * Upload image to Firebase Storage
   * @param {File} file - The image file to upload
   * @param {string} folder - The folder path in storage (default: "products")
   * @returns {Promise<{success: boolean, url?: string, path?: string, error?: string}>}
   */
  async uploadImage(file, folder = "products") {
    try {
      if (!file) {
        return { success: false, error: "No file provided" };
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop();
      const fileName = `${timestamp}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
      const filePath = `${folder}/${fileName}`;

      // Create storage reference
      const storageRef = ref(storage, filePath);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        success: true,
        url: downloadURL,
        path: filePath,
        fullPath: snapshot.ref.fullPath,
      };
    } catch (error) {
      console.error("Firebase Storage upload error:", error);
      return {
        success: false,
        error: error.message || "Failed to upload image to Firebase",
      };
    }
  }

  /**
   * Delete image from Firebase Storage
   * @param {string} filePath - The path of the file to delete
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deleteImage(filePath) {
    try {
      if (!filePath) {
        return { success: false, error: "No file path provided" };
      }

      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);

      return { success: true };
    } catch (error) {
      console.error("Firebase Storage delete error:", error);
      return {
        success: false,
        error: error.message || "Failed to delete image from Firebase",
      };
    }
  }

  /**
   * Get download URL for a file
   * @param {string} filePath - The path of the file
   * @returns {Promise<{success: boolean, url?: string, error?: string}>}
   */
  async getDownloadURL(filePath) {
    try {
      if (!filePath) {
        return { success: false, error: "No file path provided" };
      }

      const storageRef = ref(storage, filePath);
      const downloadURL = await getDownloadURL(storageRef);

      return { success: true, url: downloadURL };
    } catch (error) {
      console.error("Firebase Storage URL error:", error);
      return {
        success: false,
        error: error.message || "Failed to get download URL",
      };
    }
  }
}

export default new FirebaseStorageService();
