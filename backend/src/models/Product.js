const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, enum: ['supplements', 'gear', 'clothing', 'other'] },
  image: { type: String, default: '' },
  cloudinaryId: { type: String, default: '' },
  stock: { type: Number, default: 0, min: 0 },
  status: { type: String, default: 'active', enum: ['active', 'inactive'] },
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

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
