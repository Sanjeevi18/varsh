class CloudinaryService {
  constructor() {
    // Cloudinary Configuration
    this.cloudName = "SVGT-Products";
    this.uploadPreset = "svgt_items"; // Your upload preset
    this.baseUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}`;
    this.resourceUrl = `https://res.cloudinary.com/${this.cloudName}`;

    // Upload Configuration
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    this.folderStructure = "svgt-products/items";
  }

  // Validate file before upload
  validateFile(file) {
    const errors = [];

    // Check file type
    if (!this.allowedTypes.includes(file.type)) {
      errors.push(
        `Invalid file type: ${file.type}. Only JPEG, PNG, and WebP are allowed.`,
      );
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      errors.push(
        `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size is ${this.maxFileSize / 1024 / 1024}MB.`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Upload single image to Cloudinary with enhanced metadata
  async uploadImage(file, options = {}) {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(", "),
          file: file.name,
        };
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", this.uploadPreset);
      formData.append("cloud_name", this.cloudName);
      formData.append("folder", options.folder || this.folderStructure);

      // Add transformation options
      if (options.transformation) {
        formData.append(
          "transformation",
          JSON.stringify(options.transformation),
        );
      }

      // Add tags for organization
      if (options.tags) {
        formData.append("tags", options.tags.join(","));
      }

      const response = await fetch(`${this.baseUrl}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Upload failed");
      }

      const data = await response.json();
      return {
        success: true,
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
        format: data.format,
        bytes: data.bytes,
        createdAt: data.created_at,
        folder: data.folder,
        tags: data.tags || [],
        metadata: {
          originalName: file.name,
          size: file.size,
          type: file.type,
        },
        thumbnails: {
          small: this.generateOptimizedUrl(data.public_id, {
            width: 150,
            height: 150,
          }),
          medium: this.generateOptimizedUrl(data.public_id, {
            width: 300,
            height: 300,
          }),
          large: this.generateOptimizedUrl(data.public_id, {
            width: 800,
            height: 800,
          }),
        },
      };
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return {
        success: false,
        error: error.message,
        file: file.name,
      };
    }
  }

  // Generate optimized URL with comprehensive transformation options
  generateOptimizedUrl(publicId, options = {}) {
    if (!publicId) return null;

    const {
      width = 500,
      height = 500,
      crop = "fill",
      quality = "auto",
      format = "auto",
      gravity = "auto",
      dpr = "auto",
    } = options;

    const transformations = [
      `c_${crop}`,
      `w_${width}`,
      `h_${height}`,
      `q_${quality}`,
      `f_${format}`,
      `g_${gravity}`,
      `dpr_${dpr}`,
    ].join(",");

    return `${this.resourceUrl}/image/upload/${transformations}/${publicId}`;
  }

  // Generate responsive image URLs for different screen sizes
  generateResponsiveUrls(publicId) {
    if (!publicId) return {};

    return {
      thumbnail: this.generateOptimizedUrl(publicId, {
        width: 150,
        height: 150,
        crop: "thumb",
      }),
      small: this.generateOptimizedUrl(publicId, { width: 300, height: 300 }),
      medium: this.generateOptimizedUrl(publicId, { width: 600, height: 600 }),
      large: this.generateOptimizedUrl(publicId, { width: 1200, height: 1200 }),
      xlarge: this.generateOptimizedUrl(publicId, {
        width: 1920,
        height: 1920,
      }),
    };
  }

  // Note: Image deletion requires server-side implementation
  // This would need to be implemented on your backend
  async deleteImage(publicId) {
    console.warn(
      `Image deletion requires server-side implementation for: ${publicId}`,
    );
    return {
      success: false,
      error: `Delete functionality requires backend implementation for image: ${publicId}`,
    };
  }

  // Upload multiple images with progress tracking and comprehensive error handling
  async uploadMultipleImages(files, options = {}) {
    try {
      const {
        onProgress,
        concurrent = 3,
        tags = ["item-image"],
        folder,
      } = options;

      const results = {
        successful: [],
        failed: [],
        total: files.length,
        progress: 0,
      };

      // Process files in batches to avoid overwhelming the API
      for (let i = 0; i < files.length; i += concurrent) {
        const batch = Array.from(files).slice(i, i + concurrent);

        const batchPromises = batch.map(async (file) => {
          try {
            const result = await this.uploadImage(file, {
              folder,
              tags,
              transformation: { quality: "auto", fetch_format: "auto" },
            });

            if (result.success) {
              results.successful.push(result);
            } else {
              results.failed.push(result);
            }

            // Update progress
            results.progress = Math.round(
              ((results.successful.length + results.failed.length) /
                results.total) *
                100,
            );

            if (onProgress) {
              onProgress(
                results.progress,
                results.successful.length,
                results.failed.length,
              );
            }

            return result;
          } catch (error) {
            const failedResult = {
              success: false,
              error: error.message,
              file: file.name,
            };
            results.failed.push(failedResult);
            return failedResult;
          }
        });

        await Promise.all(batchPromises);
      }

      return {
        success: results.failed.length === 0,
        successful: results.successful,
        failed: results.failed,
        total: results.total,
        summary: {
          totalUploaded: results.successful.length,
          totalFailed: results.failed.length,
          successRate: Math.round(
            (results.successful.length / results.total) * 100,
          ),
        },
      };
    } catch (error) {
      console.error("Multiple upload error:", error);
      return {
        success: false,
        error: error.message,
        successful: [],
        failed: Array.from(files).map((file) => ({
          success: false,
          error: error.message,
          file: file.name,
        })),
      };
    }
  }
}

const cloudinaryService = new CloudinaryService();
export default cloudinaryService;
