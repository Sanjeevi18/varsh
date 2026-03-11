import userPlumberService from "../services/userPlumberService";

/**
 * User Plumber Controller - For regular users to access plumber services
 */
const userPlumberController = {
  /**
   * Fetch all active plumbers for user selection
   */
  async fetchActivePlumbers() {
    try {
      console.log(
        "🎯 UserPlumberController: Fetching active plumbers for user...",
      );
      const plumbers = await userPlumberService.getAllActivePlumbers();

      console.log("📋 UserPlumberController: Found plumbers:", plumbers.length);

      return {
        success: true,
        data: plumbers,
        message: `Found ${plumbers.length} active plumber${plumbers.length !== 1 ? "s" : ""}`,
      };
    } catch (error) {
      console.error(
        "❌ UserPlumberController: Error fetching active plumbers:",
        error,
      );
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  },

  /**
   * Fetch plumbers by area
   */
  async fetchPlumbersByArea(area) {
    try {
      console.log("🎯 UserPlumberController: Fetching plumbers by area:", area);
      const plumbers = await userPlumberService.getActivePlumbersByArea(area);

      return {
        success: true,
        data: plumbers,
        message: `Found ${plumbers.length} plumber${plumbers.length !== 1 ? "s" : ""} in ${area}`,
      };
    } catch (error) {
      console.error(
        "❌ UserPlumberController: Error fetching plumbers by area:",
        error,
      );
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  },

  /**
   * Get all plumbers for display
   */
  async fetchAllPlumbers() {
    try {
      console.log("🎯 UserPlumberController: Fetching all plumbers...");
      const plumbers = await userPlumberService.getAllPlumbers();

      return {
        success: true,
        data: plumbers,
        message: `Found ${plumbers.length} total plumber${plumbers.length !== 1 ? "s" : ""}`,
      };
    } catch (error) {
      console.error(
        "❌ UserPlumberController: Error fetching all plumbers:",
        error,
      );
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  },

  /**
   * Get plumber by ID from all admin collections
   */
  async fetchPlumberById(plumberId) {
    try {
      console.log(
        "🎯 UserPlumberController: Fetching plumber by ID:",
        plumberId,
      );
      const plumbers = await userPlumberService.getAllPlumbers();
      const plumber = plumbers.find((p) => p.id === plumberId);

      if (plumber) {
        return {
          success: true,
          data: plumber,
          message: "Plumber found",
        };
      } else {
        return {
          success: false,
          error: "Plumber not found",
          data: null,
        };
      }
    } catch (error) {
      console.error(
        "❌ UserPlumberController: Error fetching plumber by ID:",
        error,
      );
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  },
};

export default userPlumberController;
