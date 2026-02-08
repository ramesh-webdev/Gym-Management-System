const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: '' },
  avatar: String,
  content: { type: String, required: true },
  rating: { type: Number, default: 5, min: 0, max: 5 },
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

const Testimonial = mongoose.model('Testimonial', testimonialSchema);
module.exports = Testimonial;
