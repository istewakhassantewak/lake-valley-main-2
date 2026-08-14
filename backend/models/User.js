const mongoose = require('mongoose');

const socialLinksSchema = new mongoose.Schema(
  {
    facebook: { type: String, trim: true, default: '' },
    twitter: { type: String, trim: true, default: '' },
    linkedin: { type: String, trim: true, default: '' },
    instagram: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    displayName: { type: String, trim: true, default: '' },
    username: { type: String, trim: true, lowercase: true, sparse: true, unique: true },
    photoURL: { type: String, default: '' },
    bannerURL: { type: String, default: '' },
    phone: { type: String, trim: true, default: '' },
    dateOfBirth: { type: Date, default: null },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say', ''], default: '' },
    country: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    bio: { type: String, trim: true, maxlength: 500, default: '' },
    socialLinks: { type: socialLinksSchema, default: () => ({}) },
    provider: { type: String, enum: ['email', 'google'], default: 'email' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    accountStatus: { type: String, enum: ['active', 'suspended', 'deleted'], default: 'active' },
    lastLoginAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.methods.getProfileCompletion = function getProfileCompletion() {
  const fields = [
    this.displayName,
    this.username,
    this.photoURL,
    this.phone,
    this.dateOfBirth,
    this.gender,
    this.country,
    this.address,
    this.bio,
  ];
  const filled = fields.filter((f) => f && String(f).trim()).length;
  return Math.round((filled / fields.length) * 100);
};

module.exports = mongoose.model('User', userSchema);
