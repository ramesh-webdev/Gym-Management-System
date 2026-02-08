const mongoose = require('mongoose');

const gymSettingsSchema = new mongoose.Schema({
  name: { type: String, default: 'KO Fitness' },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  logo: String,
  workingHours: {
    open: { type: String, default: '06:00' },
    close: { type: String, default: '22:00' },
    days: { type: [String], default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
  },
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String,
  },
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
