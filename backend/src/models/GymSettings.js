const mongoose = require('mongoose');

const workingHoursEntrySchema = new mongoose.Schema({
  days: { type: String, default: 'Monday - Sunday' },
  open: { type: String, default: '06:00' },
  close: { type: String, default: '22:00' },
}, { _id: false });

const gymSettingsSchema = new mongoose.Schema({
  name: { type: String, default: 'KO Fitness' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  logo: String,
  workingHours: {
    entries: { type: [workingHoursEntrySchema], default: [{ days: 'Monday - Sunday', open: '06:00', close: '22:00' }] },
  },
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String,
  },
  personalTrainingPrice: { type: Number, default: 500, min: 0 },
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

const GymSettings = mongoose.model('GymSettings', gymSettingsSchema);
module.exports = GymSettings;
