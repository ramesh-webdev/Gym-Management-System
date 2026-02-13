const Testimonial = require('../models/Testimonial');

const MAX_IMAGE_BYTES = 1024 * 1024; // 1MB

function parseImageBase64(imageBase64) {
  if (!imageBase64 || typeof imageBase64 !== 'string') return null;
  const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const contentType = match[1];
  const base64 = match[2];
  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length > MAX_IMAGE_BYTES) return { error: 'Image must be under 1MB' };
  return { buffer, contentType };
}

async function list(req, res, next) {
  try {
    const testimonials = await Testimonial.find().select('+image').sort({ createdAt: -1 });
    res.json(testimonials.map((doc) => doc.toJSON()));
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const testimonial = await Testimonial.findById(req.params.id).select('+image');
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });
    res.json(testimonial.toJSON());
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, role, content, rating, avatar, imageBase64 } = req.body;
    if (!name || !content) {
      return res.status(400).json({ message: 'Name and content are required' });
    }
    const doc = { name, role: role || '', content, rating: rating ?? 5 };
    if (avatar) doc.avatar = avatar;
    if (imageBase64) {
      const parsed = parseImageBase64(imageBase64);
      if (parsed && parsed.error) return res.status(400).json({ message: parsed.error });
      if (parsed) {
        doc.image = parsed.buffer;
        doc.imageContentType = parsed.contentType;
      }
    }
    const testimonial = await Testimonial.create(doc);
    res.status(201).json(testimonial.toJSON());
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });
    const { name, role, content, rating, avatar, imageBase64 } = req.body;
    if (name !== undefined) testimonial.name = name;
    if (role !== undefined) testimonial.role = role;
    if (content !== undefined) testimonial.content = content;
    if (rating !== undefined) testimonial.rating = Math.min(5, Math.max(0, Number(rating)));
    if (avatar !== undefined) testimonial.avatar = avatar;
    if (imageBase64 !== undefined) {
      if (imageBase64 === null || imageBase64 === '') {
        testimonial.image = undefined;
        testimonial.imageContentType = undefined;
      } else {
        const parsed = parseImageBase64(imageBase64);
        if (parsed && parsed.error) return res.status(400).json({ message: parsed.error });
        if (parsed) {
          testimonial.image = parsed.buffer;
          testimonial.imageContentType = parsed.contentType;
        }
        if (imageBase64 && !parsed) {
          testimonial.avatar = undefined;
          testimonial.image = undefined;
        }
      }
    }
    await testimonial.save();
    res.json(testimonial.toJSON());
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove };
