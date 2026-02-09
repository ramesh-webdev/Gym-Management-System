const DietPlan = require('../models/DietPlan');
const User = require('../models/User');

/**
 * List all diet plans. Admin only.
 * Optionally filter by memberId query param.
 */
async function list(req, res, next) {
  try {
    const { memberId } = req.query;
    const filter = {};
    if (memberId) {
      filter.member = memberId;
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
 * Get one diet plan by id. Admin only.
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
 * Create diet plan. Admin only.
 * Body: memberId, name, dailyCalories, macros: {protein, carbs, fats}, meals: [{type, foods[], calories, time}].
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
    // Use current user as nutritionist (admin creating the plan)
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
 * Update diet plan. Admin only.
 */
async function update(req, res, next) {
  try {
    const plan = await DietPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }
    const { name, dailyCalories, macros, meals, memberId } = req.body;
    if (name !== undefined && name.trim() !== plan.name) {
      // Check if another plan with this name already exists
      const existingPlan = await DietPlan.findOne({ name: name.trim(), _id: { $ne: plan._id } });
      if (existingPlan) {
        return res.status(400).json({ message: 'A diet plan with this name already exists' });
      }
      plan.name = name.trim();
    }
    if (dailyCalories !== undefined) plan.dailyCalories = Number(dailyCalories);
    if (macros !== undefined) {
      plan.macros = {
        protein: macros.protein ? Number(macros.protein) : plan.macros.protein,
        carbs: macros.carbs ? Number(macros.carbs) : plan.macros.carbs,
        fats: macros.fats ? Number(macros.fats) : plan.macros.fats,
      };
    }
    if (meals !== undefined && Array.isArray(meals)) {
      plan.meals = meals.map((m) => ({
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
      plan.member = memberId;
    }
    await plan.save();
    res.json(plan.toJSON());
  } catch (err) {
    next(err);
  }
}

/**
 * Delete diet plan. Admin only.
 */
async function remove(req, res, next) {
  try {
    const plan = await DietPlan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, getMyPlan, create, update, remove };
