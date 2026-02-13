const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: '' },
  /** Legacy: external URL. Used if image (DB-stored) is not set. */
  avatar: String,
  /** Image stored in DB (max 1MB). Sent to client as imageBase64 in toJSON. */
  image: { type: Buffer, select: false },
  imageContentType: { type: String, default: 'image/jpeg' },
  content: { type: String, required: true },
  rating: { type: Number, default: 5, min: 0, max: 5 },
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.imageContentType;
      if (doc.image && doc.image.length) {
        const contentType = doc.imageContentType || 'image/jpeg';
        ret.imageBase64 = `data:${contentType};base64,${doc.image.toString('base64')}`;
      }
      delete ret.image;
      return ret;
    },
  },
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);
module.exports = Testimonial;
