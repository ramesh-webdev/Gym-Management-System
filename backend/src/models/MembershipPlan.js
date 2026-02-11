const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  duration: { type: Number, required: true, min: 0 }, // calendar months; 0 or unused for add-on plans
  features: [String],
  isPopular: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  /** Add-on plan (e.g. Personal Training) – not a monthly membership; members add it on top of their plan */
  isAddOn: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

const MembershipPlan = mongoose.model('MembershipPlan', membershipPlanSchema);
module.exports = MembershipPlan;
