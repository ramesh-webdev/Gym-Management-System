const mongoose = require('mongoose');
const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const { parsePagination, sendPaginated } = require('../utils/pagination');

function toResponse(doc) {
  if (!doc) return null;
  const d = doc.toObject ? doc.toObject() : doc;
  return { ...d, id: (d._id || doc._id).toString(), _id: undefined, __v: undefined };
}

/** GET / - List all products. Query: page, limit, category?, status? */
async function list(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20, maxLimit: 100 });
    const { category, status } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (status && status !== 'all') filter.status = status;
    const [products, total] = await Promise.all([
      Product.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);
    const withIds = products.map((p) => ({ ...p, id: p._id.toString(), _id: undefined, __v: undefined }));
    sendPaginated(res, withIds, total, page, limit);
  } catch (err) {
    next(err);
  }
}

/** GET /:id - Get one product by id. */
async function getById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }
    const product = await Product.findById(id).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ ...product, id: product._id.toString(), _id: undefined, __v: undefined });
  } catch (err) {
    next(err);
  }
}

const CATEGORIES = ['supplements', 'gear', 'clothing', 'other'];
const STATUSES = ['active', 'inactive'];

/** POST / - Create product (admin). */
async function create(req, res, next) {
  try {
    const { name, description, price, category, image, cloudinaryId, stock, status } = req.body;
    if (!name || price == null || !category) {
      return res.status(400).json({ message: 'name, price, and category are required' });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    const product = await Product.create({
      name: String(name).trim(),
      description: description ? String(description).trim() : '',
      price: Number(price),
      category,
      image: image ? String(image).trim() : '',
      cloudinaryId: cloudinaryId ? String(cloudinaryId).trim() : '',
      stock: Number(stock) || 0,
      status: status && STATUSES.includes(status) ? status : 'active',
    });
    res.status(201).json(toResponse(product));
  } catch (err) {
    next(err);
  }
}

/** PUT /:id - Update product (admin). */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }
    const { name, description, price, category, image, cloudinaryId, stock, status } = req.body;
    const updateFields = {};
    if (name !== undefined) updateFields.name = String(name).trim();
    if (description !== undefined) updateFields.description = String(description).trim();
    if (price !== undefined) updateFields.price = Number(price);
    if (category !== undefined) {
      if (!CATEGORIES.includes(category)) return res.status(400).json({ message: 'Invalid category' });
      updateFields.category = category;
    }
    if (image !== undefined) updateFields.image = String(image).trim();
    if (cloudinaryId !== undefined) updateFields.cloudinaryId = String(cloudinaryId).trim();
    if (stock !== undefined) updateFields.stock = Number(stock);
    if (status !== undefined) updateFields.status = STATUSES.includes(status) ? status : 'active';

    // If a new image is being set, delete the old one from Cloudinary
    if (cloudinaryId && updateFields.cloudinaryId) {
      const oldProduct = await Product.findById(id).lean();
      if (oldProduct && oldProduct.cloudinaryId && oldProduct.cloudinaryId !== updateFields.cloudinaryId) {
        cloudinary.uploader.destroy(oldProduct.cloudinaryId).catch(err => {
          console.error('Failed to delete old image from Cloudinary:', err);
        });
      }
    }

    const product = await Product.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true }).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ ...product, id: product._id.toString(), _id: undefined, __v: undefined });
  } catch (err) {
    next(err);
  }
}

/** DELETE /:id - Delete product (admin). */
async function remove(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Delete image from Cloudinary
    if (product.cloudinaryId) {
      cloudinary.uploader.destroy(product.cloudinaryId).catch(err => {
        console.error('Failed to delete image from Cloudinary on product removal:', err);
      });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/** POST /upload - Upload image to Cloudinary (admin). */
async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload buffer to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'products',
      },
      (error, result) => {
        if (error) {
          return res.status(500).json({ message: 'Cloudinary upload failed', error });
        }
        res.json({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove, uploadImage };
