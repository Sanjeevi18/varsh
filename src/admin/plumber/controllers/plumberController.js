import plumberService from "../services/plumberService";
import Plumber from "../models/Plumber";

const plumberController = {
  async fetchPlumbers() {
    try {
      const plumbers = await plumberService.getAllPlumbers();
      return { success: true, data: plumbers };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async fetchActivePlumbers() {
    try {
      const plumbers = await plumberService.getActivePlumbers();
      return { success: true, data: plumbers };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async fetchPlumbersByArea(area) {
    try {
      const plumbers = await plumberService.getPlumbersByArea(area);
      return { success: true, data: plumbers };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createPlumber(plumberData) {
    try {
      const plumber = new Plumber(plumberData);
      const validation = plumber.validate();

      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      const plumberId = await plumberService.addPlumber(plumberData);
      return { success: true, data: plumberId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updatePlumber(plumberId, plumberData) {
    try {
      const plumber = new Plumber(plumberData);
      const validation = plumber.validate();

      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      await plumberService.updatePlumber(plumberId, plumberData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deletePlumber(plumberId) {
    try {
      await plumberService.deletePlumber(plumberId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async togglePlumberStatus(plumberId, isActive) {
    try {
      await plumberService.togglePlumberStatus(plumberId, isActive);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default plumberController;
