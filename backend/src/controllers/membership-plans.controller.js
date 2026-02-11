const mongoose = require('mongoose');
const MembershipPlan = require('../models/MembershipPlan');

function toResponse(doc) {
  if (!doc) return null;
  const d = doc.toObject ? doc.toObject() : doc;
  return { ...d, id: (d._id || doc._id).toString(), _id: undefined, __v: undefined };
}

/** GET / - List plans. If admin (auth), return all; otherwise active only. */
async function list(req, res, next) {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    const filter = isAdmin ? {} : { isActive: true };
    const plans = await MembershipPlan.find(filter).sort({ price: 1 }).lean();
    const withIds = plans.map((p) => ({ ...p, id: p._id.toString(), _id: undefined, __v: undefined }));
    res.json(withIds);
  } catch (err) {
    next(err);
  }
}

/** GET /:id - Get one plan by id. */
async function getById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid plan id' });
    }
    const plan = await MembershipPlan.findById(id).lean();
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ ...plan, id: plan._id.toString(), _id: undefined, __v: undefined });
  } catch (err) {
    next(err);
  }
}

/** POST / - Create plan (admin). Only one add-on plan allowed at a time. */
async function create(req, res, next) {
  try {
    const { name, description, price, duration, features, isPopular, isActive, isAddOn } = req.body;
    if (!name || price == null) {
      return res.status(400).json({ message: 'name and price are required' });
    }
    const isAddOnPlan = isAddOn === true;
    if (isAddOnPlan) {
      const existingAddOn = await MembershipPlan.findOne({ isAddOn: true }).lean();
      if (existingAddOn) {
        return res.status(400).json({
          message: 'Only one add-on plan is allowed at a time. Edit or remove the existing add-on plan first.',
          existingAddOnPlanId: existingAddOn._id.toString(),
          existingAddOnPlanName: existingAddOn.name,
        });
      }
    }
    const durationVal = duration != null ? Number(duration) : (isAddOnPlan ? 0 : 1);
    if (!isAddOnPlan && durationVal < 1) {
      return res.status(400).json({ message: 'duration (months) is required for monthly plans' });
    }
    const plan = await MembershipPlan.create({
      name: String(name).trim(),
      description: description ? String(description).trim() : '',
      price: Number(price),
      duration: durationVal,
      features: Array.isArray(features) ? features : (typeof features === 'string' ? features.split(',').map((f) => f.trim()).filter(Boolean) : []),
      isPopular: Boolean(isPopular),
      isActive: isActive !== false,
      isAddOn: isAddOnPlan,
    });
    res.status(201).json(toResponse(plan));
  } catch (err) {
    next(err);
  }
}

/** PUT /:id - Update plan (admin). Only one add-on plan allowed at a time. */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid plan id' });
    }
    const { name, description, price, duration, features, isPopular, isActive, isAddOn } = req.body;
    if (isAddOn === true) {
      const existingAddOn = await MembershipPlan.findOne({ isAddOn: true, _id: { $ne: id } }).lean();
      if (existingAddOn) {
        return res.status(400).json({
          message: 'Only one add-on plan is allowed at a time. Edit or remove the other add-on plan first.',
          existingAddOnPlanId: existingAddOn._id.toString(),
          existingAddOnPlanName: existingAddOn.name,
        });
      }
    }
    const updateFields = {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(description !== undefined && { description: String(description).trim() }),
      ...(price !== undefined && { price: Number(price) }),
      ...(duration !== undefined && { duration: Number(duration) }),
      ...(features !== undefined && {
        features: Array.isArray(features) ? features : (typeof features === 'string' ? features.split(',').map((f) => f.trim()).filter(Boolean) : []),
      }),
      ...(isPopular !== undefined && { isPopular: Boolean(isPopular) }),
      ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      ...(isAddOn !== undefined && { isAddOn: Boolean(isAddOn) }),
    };
    const plan = await MembershipPlan.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    ).lean();
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ ...plan, id: plan._id.toString(), _id: undefined, __v: undefined });
  } catch (err) {
    next(err);
  }
}

/** DELETE /:id - Delete plan (admin). */
async function remove(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid plan id' });
    }
    const plan = await MembershipPlan.findByIdAndDelete(id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove };
