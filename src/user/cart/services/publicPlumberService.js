import { db } from "../../../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  collectionGroup,
} from "firebase/firestore";

const publicPlumberService = {
  async getAllAvailablePlumbers() {
    try {
      console.log("🔍 Fetching plumbers from admin subcollections...");

      // Use collectionGroup to fetch from all Admin/{userId}/plumbers collections
      const plumbersRef = collectionGroup(db, "plumbers");
      const snapshot = await getDocs(plumbersRef);

      console.log("📊 Snapshot size:", snapshot.size);
      console.log("📄 Snapshot empty:", snapshot.empty);

      if (snapshot.empty) {
        console.log(
          "⚠️ No plumber documents found in any admin subcollections",
        );

        // Try alternative: fetch from main plumbers collection as fallback
        console.log("🔄 Trying fallback: main plumbers collection...");
        try {
          const mainPlumbersRef = collection(db, "plumbers");
          const mainSnapshot = await getDocs(mainPlumbersRef);
          console.log("📊 Main collection snapshot size:", mainSnapshot.size);

          if (!mainSnapshot.empty) {
            const plumbers = [];
            mainSnapshot.docs.forEach((doc) => {
              const data = doc.data();
              console.log("📄 Processing main collection document:", doc.id);
              console.log("📄 Document data:", data);

              const plumber = this.createPlumberObject(doc);
              if (plumber.isActive) {
                plumbers.push(plumber);
              }
            });
            return plumbers;
          }
        } catch (fallbackError) {
          console.error("❌ Fallback also failed:", fallbackError);
        }

        return [];
      }

      const plumbers = [];
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        console.log("📄 Processing plumber document ID:", doc.id);
        console.log("📄 Document data:", data);
        console.log("📄 Document path:", doc.ref.path);

        const plumber = this.createPlumberObject(doc);

        // Only include active plumbers
        if (plumber.isActive) {
          console.log("✅ Adding plumber:", plumber.name);
          plumbers.push(plumber);
        } else {
          console.log("⏭️ Skipping inactive plumber:", plumber.name);
        }
      });

      console.log("✅ Total active plumbers found:", plumbers.length);
      console.log("✅ Final plumbers array:", plumbers);
      return plumbers;
    } catch (error) {
      console.error(
        "❌ Error fetching plumbers from admin subcollections:",
        error,
      );
      console.error("❌ Error details:", error.message);
      console.error("❌ Error code:", error.code);
      throw error;
    }
  },

  // Helper method to create plumber object with consistent field mapping
  createPlumberObject(doc) {
    const data = doc.data();

    // Create plumber object from the Firebase data with better field mapping
    const plumber = {
      id: doc.id,
      name:
        data.name ||
        data.plumberName ||
        data.fullName ||
        data.userName ||
        "Professional Plumber",
      phone:
        data.phone ||
        data.phoneNumber ||
        data.mobile ||
        data.contact ||
        "Contact Available",
      email: data.email || data.emailAddress || "",
      area: data.area || data.serviceArea || data.location || "",
      city: data.city || data.cityName || "",
      address: data.address || data.fullAddress || "",
      experience: data.experience || data.experienceYears || data.exp || 2, // Default 2 years
      hourlyRate:
        data.hourlyRate || data.rate || data.pricePerHour || data.cost || 150, // Default rate
      specialization:
        data.specialization ||
        data.specialty ||
        data.skills ||
        "Plumbing Services",
      availableDays: Array.isArray(data.availableDays)
        ? data.availableDays
        : [],
      completedJobs: data.completedJobs || data.jobsCompleted || 0,
      rating: data.rating || data.averageRating || 4.0, // Default good rating
      isActive: data.isActive !== false, // Default to true if not specified
    };

    console.log("🔧 Created plumber object:", {
      id: plumber.id,
      name: plumber.name,
      area: plumber.area,
      city: plumber.city,
      hasRequiredFields: !!(plumber.name && plumber.area),
    });

    return plumber;
  },

  async getPlumbersByArea(area) {
    try {
      console.log("🔍 Fetching plumbers by area:", area);
      const plumbersRef = collectionGroup(db, "plumbers");
      const q = query(plumbersRef, where("area", "==", area));
      const snapshot = await getDocs(q);

      const plumbers = [];
      snapshot.docs.forEach((doc) => {
        const plumber = this.createPlumberObject(doc);
        if (plumber.isActive) {
          plumbers.push(plumber);
        }
      });

      console.log(`✅ Found ${plumbers.length} plumbers in area: ${area}`);
      return plumbers;
    } catch (error) {
      console.error("❌ Error fetching plumbers by area:", error);
      throw error;
    }
  },
};

export default publicPlumberService;
