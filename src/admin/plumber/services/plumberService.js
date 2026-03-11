import { db, auth } from "../../../firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import Plumber from "../models/Plumber";

const getPlumbersCollectionRef = () => {
  const user = auth.currentUser;
  console.log("🔍 Auth check - Current user:", user ? user.email : "No user");
  console.log("🔍 Auth check - User UID:", user ? user.uid : "No UID");

  if (!user) {
    console.error("❌ User not authenticated");
    throw new Error("User not authenticated");
  }

  // Use subcollection under Admin/{userId}/plumbers
  const collectionPath = `Admin/${user.uid}/plumbers`;
  console.log("📂 Collection path:", collectionPath);
  return collection(db, "Admin", user.uid, "plumbers");
};

const plumberService = {
  async getAllPlumbers() {
    try {
      console.log("🔍 Getting plumbers from subcollection...");
      const user = auth.currentUser;
      console.log("👤 Current user:", user ? user.email : "No user");
      console.log("🆔 User UID:", user ? user.uid : "No UID");

      const plumbersRef = getPlumbersCollectionRef();
      console.log(
        "📂 Plumbers collection ref path: Admin/" + user.uid + "/plumbers",
      );

      const snapshot = await getDocs(plumbersRef);

      console.log("📊 Snapshot size:", snapshot.size);
      console.log("📄 Snapshot empty:", snapshot.empty);
      console.log("📄 Snapshot docs:", snapshot.docs.length);

      if (snapshot.empty) {
        console.log("⚠️ No plumber documents found in collection");
        return [];
      }

      const plumbers = [];
      snapshot.docs.forEach((doc) => {
        console.log("📄 Processing document ID:", doc.id);
        console.log("📄 Document data:", doc.data());
        try {
          const plumber = Plumber.fromFirestore(doc);
          console.log("✅ Plumber object created:", plumber);
          plumbers.push(plumber);
        } catch (error) {
          console.error("❌ Error creating plumber from doc:", doc.id, error);
        }
      });

      console.log("✅ Processed plumbers:", plumbers.length);
      console.log("✅ Final plumbers array:", plumbers);
      return plumbers;
      
    } catch (error) {
      console.error("❌ Error fetching plumbers:", error);
      throw error;
    }
  },

  async getPlumberById(plumberId) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }
      const plumberRef = doc(db, "Admin", user.uid, "plumbers", plumberId);
      const plumberDoc = await getDoc(plumberRef);
      if (plumberDoc.exists()) {
        return Plumber.fromFirestore(plumberDoc);
      }
      return null;
    } catch (error) {
      console.error("Error fetching plumber:", error);
      throw error;
    }
  },

  async getActivePlumbers() {
    try {
      const plumbersRef = getPlumbersCollectionRef();
      const snapshot = await getDocs(
        query(
          plumbersRef,
          where("isActive", "==", true),
          orderBy("rating", "desc"),
        ),
      );

      const plumbers = snapshot.docs.map((doc) => {
        return Plumber.fromFirestore(doc);
      });

      return plumbers;
    } catch (error) {
      console.error("Error fetching active plumbers:", error);
      throw error;
    }
  },

  async getPlumbersByArea(area) {
    try {
      const plumbersRef = getPlumbersCollectionRef();
      const snapshot = await getDocs(
        query(
          plumbersRef,
          where("area", "==", area),
          where("isActive", "==", true),
        ),
      );

      const plumbers = snapshot.docs.map((doc) => {
        return Plumber.fromFirestore(doc);
      });

      return plumbers;
    } catch (error) {
      console.error("Error fetching plumbers by area:", error);
      throw error;
    }
  },

  async addPlumber(plumberData) {
    try {
      const plumbersRef = getPlumbersCollectionRef();
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Add timestamps to plumber data
      const plumberWithTimestamps = {
        ...plumberData,
        createdAt: new Date(),
        updatedAt: new Date(),
        joinedDate: new Date(),
        lastActiveDate: new Date(),
      };

      const plumber = new Plumber(plumberWithTimestamps);
      const docRef = await addDoc(plumbersRef, plumber.toFirestore());
      console.log(
        "✅ Plumber added to Admin subcollection with ID:",
        docRef.id,
      );
      return docRef.id;
    } catch (error) {
      console.error("Error adding plumber:", error);
      throw error;
    }
  },

  async updatePlumber(plumberId, plumberData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const plumberRef = doc(db, "Admin", user.uid, "plumbers", plumberId);

      // Add timestamp to updated data
      const updatedData = {
        ...plumberData,
        updatedAt: new Date(),
      };

      const plumber = new Plumber(updatedData);
      await updateDoc(plumberRef, plumber.toFirestore());
      console.log("✅ Plumber updated successfully");
    } catch (error) {
      console.error("Error updating plumber:", error);
      throw error;
    }
  },

  async deletePlumber(plumberId) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const plumberRef = doc(db, "Admin", user.uid, "plumbers", plumberId);
      await deleteDoc(plumberRef);
      console.log("✅ Plumber deleted successfully");
    } catch (error) {
      console.error("Error deleting plumber:", error);
      throw error;
    }
  },

  async togglePlumberStatus(plumberId, isActive) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const plumberRef = doc(db, "Admin", user.uid, "plumbers", plumberId);
      await updateDoc(plumberRef, {
        isActive: isActive,
        lastActiveDate: isActive ? new Date() : null,
        updatedAt: new Date(),
      });
      console.log("✅ Plumber status updated successfully");
    } catch (error) {
      console.error("Error updating plumber status:", error);
      throw error;
    }
  },
};

export default plumberService;
