class Plumber {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || "";
    this.phone = data.phone || "";
    this.email = data.email || "";
    this.address = data.address || "";
    this.city = data.city || "";
    this.area = data.area || "";
    this.pincode = data.pincode || "";
    this.experience = data.experience || "";
    this.specialization = data.specialization || [];
    this.hourlyRate = data.hourlyRate || 0;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.rating = data.rating || 0;
    this.completedJobs = data.completedJobs || 0;
    this.joinedDate = data.joinedDate || new Date();
    this.lastActiveDate = data.lastActiveDate || new Date();
    this.emergencyAvailable = data.emergencyAvailable || false;
    this.profileImage = data.profileImage || "";
    this.documents = data.documents || []; // ID proof, certificates
    this.workingHours = data.workingHours || {
      start: "09:00",
      end: "18:00",
    };
    this.availableDays = data.availableDays || [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  validate() {
    const errors = {};

    if (!this.name || this.name.trim() === "") {
      errors.name = "Plumber name is required";
    }

    if (!this.phone || this.phone.trim() === "") {
      errors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(this.phone.replace(/\D/g, ""))) {
      errors.phone = "Phone number must be 10 digits";
    }

    if (!this.email || this.email.trim() === "") {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      errors.email = "Invalid email format";
    }

    if (!this.address || this.address.trim() === "") {
      errors.address = "Address is required";
    }

    if (!this.city || this.city.trim() === "") {
      errors.city = "City is required";
    }

    if (!this.area || this.area.trim() === "") {
      errors.area = "Area is required";
    }

    if (!this.pincode || this.pincode.trim() === "") {
      errors.pincode = "Pincode is required";
    } else if (!/^[0-9]{6}$/.test(this.pincode)) {
      errors.pincode = "Pincode must be 6 digits";
    }

    if (
      this.hourlyRate !== "" &&
      (isNaN(this.hourlyRate) || Number(this.hourlyRate) < 0)
    ) {
      errors.hourlyRate = "Hourly rate must be a positive number";
    }

    if (!this.experience || this.experience.trim() === "") {
      errors.experience = "Experience is required";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  toFirestore() {
    return {
      name: this.name,
      phone: this.phone,
      email: this.email,
      address: this.address,
      city: this.city,
      area: this.area,
      pincode: this.pincode,
      experience: this.experience,
      specialization: this.specialization,
      hourlyRate: Number(this.hourlyRate),
      isActive: this.isActive,
      rating: Number(this.rating),
      completedJobs: Number(this.completedJobs),
      emergencyAvailable: this.emergencyAvailable,
      profileImage: this.profileImage,
      documents: this.documents,
      workingHours: this.workingHours,
      availableDays: this.availableDays,
      lastActiveDate: this.lastActiveDate,
      updatedAt: new Date(),
      ...(this.createdAt ? {} : { createdAt: new Date() }),
      ...(this.joinedDate ? {} : { joinedDate: new Date() }),
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Plumber({
      id: doc.id,
      ...data,
    });
  }
}

export default Plumber;
