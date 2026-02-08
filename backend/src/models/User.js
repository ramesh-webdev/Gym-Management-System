const mongoose = require('mongoose');

const onboardingDataSchema = new mongoose.Schema({
  age: Number,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  weight: Number,
  height: Number,
  fitnessGoals: [String],
  medicalConditions: String,
  emergencyContact: {
    name: String,
    phone: String,
  },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'member', 'trainer'] },
  avatar: String,
  status: { type: String, default: 'active', enum: ['active', 'inactive', 'suspended'] },
  /** When true, admin has full access. When false/undefined, access is limited by permissions (admin created by super-admin). */
  isSuperAdmin: { type: Boolean, default: false },
  /** Menu/feature IDs this admin can access. Only used when isSuperAdmin is false. */
  permissions: [String],
  isOnboarded: { type: Boolean, default: true },
  // Member-specific (when role === 'member')
  membershipId: String,
  membershipPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlan' },
  membershipType: String,
  membershipExpiry: Date,
  joinDate: Date,
  hasPersonalTraining: { type: Boolean, default: false },
  onboardingData: onboardingDataSchema,
  // Trainer-specific (when role === 'trainer')
  specialization: [String],
  experience: Number,
  bio: String,
  rating: { type: Number, default: 0 },
  clients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastLogin: Date,
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.passwordHash;
      if (ret.createdAt) ret.createdAt = ret.createdAt.toISOString();
      if (ret.updatedAt) ret.updatedAt = ret.updatedAt.toISOString();
      if (ret.lastLogin) ret.lastLogin = ret.lastLogin.toISOString();
      if (ret.membershipExpiry) ret.membershipExpiry = ret.membershipExpiry.toISOString();
      if (ret.joinDate) ret.joinDate = ret.joinDate.toISOString();
      return ret;
    },
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
