import { db } from "../../firebaseConfig";
import {
  getDocs,
  query,
  where,
  orderBy,
  collectionGroup,
} from "firebase/firestore";
import Plumber from "../../admin/plumber/models/Plumber";

/**
 * User Plumber Service - Fetches plumbers from all admin collections
 * This service is used by regular users to find available plumbers
 */
const userPlumberService = {
  /**
   * Get all active plumbers from all admin collections
   */
  async getAllActivePlumbers() {
    try {
      console.log(
        "🔍 Fetching all active plumbers from all admin collections...",
      );

      // Use collectionGroup to search across all Admin/{adminId}/plumbers
      // Simplified query without orderBy to avoid potential index issues
      const plumbersQuery = query(
        collectionGroup(db, "plumbers"),
        where("isActive", "==", true),
      );

      const snapshot = await getDocs(plumbersQuery);

      console.log("📊 Found plumber documents:", snapshot.size);

      if (snapshot.empty) {
        console.log("⚠️ No active plumbers found in any admin collection");
        return [];
      }

      const plumbers = [];
      snapshot.forEach((doc) => {
        try {
          console.log("📄 Processing plumber doc ID:", doc.id);
          console.log("📄 Plumber data:", doc.data());

          const plumberData = doc.data();

          // Create plumber object with the data
          const plumber = {
            id: doc.id,
            name: plumberData.name || "",
            email: plumberData.email || "",
            phone: plumberData.phone || "",
            area: plumberData.area || "",
            city: plumberData.city || "",
            specialization: plumberData.specialization || [],
            experience: plumberData.experience || "",
            rating: plumberData.rating || 4.0,
            hourlyRate: plumberData.hourlyRate || 500,
            isActive: plumberData.isActive || false,
            availableDays: plumberData.availableDays || [],
            workingHours: plumberData.workingHours || {
              start: "09:00",
              end: "18:00",
            },
            emergencyAvailable: plumberData.emergencyAvailable || false,
            completedJobs: plumberData.completedJobs || 0,
            documents: plumberData.documents || {},
            createdAt: plumberData.createdAt,
            updatedAt: plumberData.updatedAt,
          };

          plumbers.push(plumber);
          console.log("✅ Added plumber:", plumber.name);
        } catch (error) {
          console.error("❌ Error processing plumber doc:", doc.id, error);
        }
      });

      console.log("✅ Total active plumbers found:", plumbers.length);

      // Sort by rating on client side instead
      plumbers.sort((a, b) => (b.rating || 0) - (a.rating || 0));

      return plumbers;
    } catch (error) {
      console.error("❌ Error fetching all active plumbers:", error);
      throw error;
    }
  },

  /**
   * Get active plumbers by area
   */
  async getActivePlumbersByArea(area) {
    try {
      console.log("🔍 Fetching active plumbers by area:", area);

      const plumbersQuery = query(
        collectionGroup(db, "plumbers"),
        where("isActive", "==", true),
        where("area", "==", area),
        orderBy("rating", "desc"),
      );

      const snapshot = await getDocs(plumbersQuery);

      if (snapshot.empty) {
        console.log("⚠️ No active plumbers found in area:", area);
        return [];
      }

      const plumbers = [];
      snapshot.forEach((doc) => {
        try {
          const plumberData = doc.data();
          const plumber = {
            id: doc.id,
            name: plumberData.name || "",
            email: plumberData.email || "",
            phone: plumberData.phone || "",
            area: plumberData.area || "",
            city: plumberData.city || "",
            specialization: plumberData.specialization || [],
            experience: plumberData.experience || "",
            rating: plumberData.rating || 4.0,
            hourlyRate: plumberData.hourlyRate || 500,
            isActive: plumberData.isActive || false,
            availableDays: plumberData.availableDays || [],
            workingHours: plumberData.workingHours || {
              start: "09:00",
              end: "18:00",
            },
            emergencyAvailable: plumberData.emergencyAvailable || false,
            completedJobs: plumberData.completedJobs || 0,
            documents: plumberData.documents || {},
            createdAt: plumberData.createdAt,
            updatedAt: plumberData.updatedAt,
          };
          plumbers.push(plumber);
        } catch (error) {
          console.error("❌ Error processing plumber doc:", doc.id, error);
        }
      });

      console.log("✅ Active plumbers found in area:", plumbers.length);
      return plumbers;
    } catch (error) {
      console.error("❌ Error fetching active plumbers by area:", error);
      throw error;
    }
  },

  /**
   * Get all plumbers (active and inactive) for display purposes
   */
  async getAllPlumbers() {
    try {
      console.log("🔍 Fetching all plumbers from all admin collections...");

      const plumbersQuery = query(
        collectionGroup(db, "plumbers"),
        orderBy("name", "asc"),
      );

      const snapshot = await getDocs(plumbersQuery);

      if (snapshot.empty) {
        console.log("⚠️ No plumbers found in any admin collection");
        return [];
      }

      const plumbers = [];
      snapshot.forEach((doc) => {
        try {
          const plumberData = doc.data();
          const plumber = {
            id: doc.id,
            name: plumberData.name || "",
            email: plumberData.email || "",
            phone: plumberData.phone || "",
            area: plumberData.area || "",
            city: plumberData.city || "",
            specialization: plumberData.specialization || [],
            experience: plumberData.experience || "",
            rating: plumberData.rating || 4.0,
            hourlyRate: plumberData.hourlyRate || 500,
            isActive: plumberData.isActive || false,
            availableDays: plumberData.availableDays || [],
            workingHours: plumberData.workingHours || {
              start: "09:00",
              end: "18:00",
            },
            emergencyAvailable: plumberData.emergencyAvailable || false,
            completedJobs: plumberData.completedJobs || 0,
            documents: plumberData.documents || {},
            createdAt: plumberData.createdAt,
            updatedAt: plumberData.updatedAt,
          };
          plumbers.push(plumber);
        } catch (error) {
          console.error("❌ Error processing plumber doc:", doc.id, error);
        }
      });

      console.log("✅ Total plumbers found:", plumbers.length);
      return plumbers;
    } catch (error) {
      console.error("❌ Error fetching all plumbers:", error);
      throw error;
    }
  },
};

export default userPlumberService;
