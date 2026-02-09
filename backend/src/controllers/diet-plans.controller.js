const DietPlan = require('../models/DietPlan');
const User = require('../models/User');

/**
 * List all diet plans. Admin/Trainer only.
 * Optionally filter by memberId query param.
 * Trainers only see plans for their assigned clients.
 */
async function list(req, res, next) {
  try {
    const { memberId } = req.query;
    const filter = {};
    if (memberId) {
      filter.member = memberId;
    }
    // If trainer, only show plans for their assigned clients
    if (req.user.role === 'trainer') {
      const trainer = await User.findById(req.user.id).select('clients').lean();
      if (!trainer || !trainer.clients || trainer.clients.length === 0) {
        return res.json([]);
      }
      filter.member = { $in: trainer.clients };
    }
    const plans = await DietPlan.find(filter)
      .populate('member', 'name phone')
      .populate('nutritionist', 'name')
      .sort({ createdAt: -1 })
      .lean();
    const list = plans.map((p) => {
      const { _id, member, nutritionist, ...rest } = p;
      const item = {
        ...rest,
        id: _id.toString(),
        memberId: member?._id?.toString() || member,
        memberName: member?.name,
        nutritionistId: nutritionist?._id?.toString() || nutritionist,
        nutritionistName: nutritionist?.name,
      };
      if (item.createdAt) item.createdAt = item.createdAt.toISOString();
      if (item.updatedAt) item.updatedAt = item.updatedAt.toISOString();
      if (item.meals) {
        item.meals = item.meals.map((m) => ({
          ...m,
          id: m._id?.toString() || m.id,
        }));
      }
      return item;
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
}

/**
 * Get one diet plan by id. Admin/Trainer only.
 * Trainers can only view plans for their assigned clients.
 */
async function getById(req, res, next) {
  try {
    const plan = await DietPlan.findById(req.params.id)
      .populate('member', 'name phone')
      .populate('nutritionist', 'name')
      .lean();
    if (!plan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }
    // If trainer, verify plan is for their assigned client
    if (req.user.role === 'trainer') {
      const trainer = await User.findById(req.user.id).select('clients').lean();
      const memberId = plan.member?._id?.toString() || plan.member?.toString() || '';
      if (!trainer || !trainer.clients || !trainer.clients.some((id) => id.toString() === memberId)) {
        return res.status(403).json({ message: 'Access denied to this diet plan' });
      }
    }
    const { _id, member, nutritionist, ...rest } = plan;
    const out = {
      ...rest,
      id: _id.toString(),
      memberId: member?._id?.toString() || member,
      memberName: member?.name,
      nutritionistId: nutritionist?._id?.toString() || nutritionist,
      nutritionistName: nutritionist?.name,
    };
    if (out.createdAt) out.createdAt = out.createdAt.toISOString();
    if (out.updatedAt) out.updatedAt = out.updatedAt.toISOString();
    if (out.meals) {
      out.meals = out.meals.map((m) => ({
        ...m,
        id: m._id?.toString() || m.id,
      }));
    }
    res.json(out);
  } catch (err) {
    next(err);
  }
}

/**
 * Get diet plan for current member (self-service).
 */
async function getMyPlan(req, res, next) {
  try {
    if (!req.user || req.user.role !== 'member') {
      return res.status(403).json({ message: 'Members only' });
    }
    const plan = await DietPlan.findOne({ member: req.user.id })
      .populate('nutritionist', 'name')
      .lean();
    if (!plan) {
      return res.status(404).json({ message: 'No diet plan assigned' });
    }
    const { _id, member, nutritionist, ...rest } = plan;
    const out = {
      ...rest,
      id: _id.toString(),
      memberId: member?.toString() || member,
      nutritionistId: nutritionist?._id?.toString() || nutritionist,
      nutritionistName: nutritionist?.name,
    };
    if (out.createdAt) out.createdAt = out.createdAt.toISOString();
    if (out.updatedAt) out.updatedAt = out.updatedAt.toISOString();
    if (out.meals) {
      out.meals = out.meals.map((m) => ({
        ...m,
        id: m._id?.toString() || m.id,
      }));
    }
    res.json(out);
  } catch (err) {
    next(err);
  }
}

/**
 * Create diet plan. Admin/Trainer only.
 * Body: memberId, name, dailyCalories, macros: {protein, carbs, fats}, meals: [{type, foods[], calories, time}].
 * Trainers can only create plans for their assigned clients.
 */
async function create(req, res, next) {
  try {
    const { memberId, name, dailyCalories, macros, meals } = req.body;
    if (!memberId || !name || !dailyCalories) {
      return res.status(400).json({ message: 'Member ID, name and daily calories are required' });
    }
    const member = await User.findOne({ _id: memberId, role: 'member' });
    if (!member) {
      return res.status(400).json({ message: 'Member not found' });
    }
    // If trainer, verify member is assigned to them
    if (req.user.role === 'trainer') {
      const trainer = await User.findById(req.user.id).select('clients').lean();
      if (!trainer || !trainer.clients || !trainer.clients.some((id) => id.toString() === memberId)) {
        return res.status(403).json({ message: 'You can only create diet plans for your assigned clients' });
      }
    }
    // Check for unique plan name
    const existingPlan = await DietPlan.findOne({ name: name.trim() });
    if (existingPlan) {
      return res.status(400).json({ message: 'A diet plan with this name already exists' });
    }
    // Use current user as nutritionist (admin/trainer creating the plan)
    const nutritionistId = req.user.id;
    const plan = await DietPlan.create({
      member: memberId,
      nutritionist: nutritionistId,
      name: name.trim(),
      dailyCalories: Number(dailyCalories),
      macros: {
        protein: macros?.protein ? Number(macros.protein) : 0,
        carbs: macros?.carbs ? Number(macros.carbs) : 0,
        fats: macros?.fats ? Number(macros.fats) : 0,
      },
      meals: Array.isArray(meals) ? meals.map((m) => ({
        type: m.type,
        foods: Array.isArray(m.foods) ? m.foods : [],
        calories: Number(m.calories) || 0,
        time: m.time || '',
      })) : [],
    });
    const p = plan.toJSON();
    res.status(201).json(p);
  } catch (err) {
    next(err);
  }
}

/**
 * Update diet plan. Admin/Trainer only.
 * Trainers can only update plans for their assigned clients.
 */
async function update(req, res, next) {
  try {
    const plan = await DietPlan.findById(req.params.id).populate('member').lean();
    if (!plan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }
    // If trainer, verify plan is for their assigned client
    if (req.user.role === 'trainer') {
      const trainer = await User.findById(req.user.id).select('clients').lean();
      const memberId = plan.member?._id?.toString() || plan.member?.toString() || '';
      if (!trainer || !trainer.clients || !trainer.clients.some((id) => id.toString() === memberId)) {
        return res.status(403).json({ message: 'You can only update diet plans for your assigned clients' });
      }
    }
    const planDoc = await DietPlan.findById(req.params.id);
    const { name, dailyCalories, macros, meals, memberId } = req.body;
    if (name !== undefined && name.trim() !== planDoc.name) {
      // Check if another plan with this name already exists
      const existingPlan = await DietPlan.findOne({ name: name.trim(), _id: { $ne: planDoc._id } });
      if (existingPlan) {
        return res.status(400).json({ message: 'A diet plan with this name already exists' });
      }
      planDoc.name = name.trim();
    }
    if (dailyCalories !== undefined) planDoc.dailyCalories = Number(dailyCalories);
    if (macros !== undefined) {
      planDoc.macros = {
        protein: macros.protein ? Number(macros.protein) : planDoc.macros.protein,
        carbs: macros.carbs ? Number(macros.carbs) : planDoc.macros.carbs,
        fats: macros.fats ? Number(macros.fats) : planDoc.macros.fats,
      };
    }
    if (meals !== undefined && Array.isArray(meals)) {
      planDoc.meals = meals.map((m) => ({
        type: m.type,
        foods: Array.isArray(m.foods) ? m.foods : [],
        calories: Number(m.calories) || 0,
        time: m.time || '',
      }));
    }
    if (memberId !== undefined) {
      const member = await User.findOne({ _id: memberId, role: 'member' });
      if (!member) {
        return res.status(400).json({ message: 'Member not found' });
      }
      // If trainer, verify new member is assigned to them
      if (req.user.role === 'trainer') {
        const trainer = await User.findById(req.user.id).select('clients').lean();
        if (!trainer || !trainer.clients || !trainer.clients.some((id) => id.toString() === memberId)) {
          return res.status(403).json({ message: 'You can only assign diet plans to your assigned clients' });
        }
      }
      planDoc.member = memberId;
    }
    await planDoc.save();
    res.json(planDoc.toJSON());
  } catch (err) {
    next(err);
  }
}

/**
 * Delete diet plan. Admin/Trainer only.
 * Trainers can only delete plans for their assigned clients.
 */
async function remove(req, res, next) {
  try {
    const plan = await DietPlan.findById(req.params.id).populate('member').lean();
    if (!plan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }
    // If trainer, verify plan is for their assigned client
    if (req.user.role === 'trainer') {
      const trainer = await User.findById(req.user.id).select('clients').lean();
      const memberId = plan.member?._id?.toString() || plan.member?.toString() || '';
      if (!trainer || !trainer.clients || !trainer.clients.some((id) => id.toString() === memberId)) {
        return res.status(403).json({ message: 'You can only delete diet plans for your assigned clients' });
      }
    }
    await DietPlan.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, getMyPlan, create, update, remove };
