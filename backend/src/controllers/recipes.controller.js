const Recipe = require('../models/Recipe');

/**
 * List all recipes. Public (optional auth).
 * Query params: category?, isActive? (default true for public, all for admin/trainer).
 */
async function list(req, res, next) {
  try {
    const { category, isActive } = req.query;
    const filter = {};
    if (category) filter.category = category;
    // If authenticated admin or trainer, show all. Otherwise, show only active.
    if (req.user && (req.user.role === 'admin' || req.user.role === 'trainer')) {
      if (isActive !== undefined) filter.isActive = isActive === 'true';
    } else {
      filter.isActive = true; // Public sees only active recipes
    }
    const recipes = await Recipe.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .lean();
    const list = recipes.map((r) => {
      const { _id, createdBy, ...rest } = r;
      const item = {
        ...rest,
        id: _id.toString(),
        createdBy: createdBy?._id?.toString() || createdBy || '',
        createdByName: createdBy?.name,
      };
      if (item.createdAt) item.createdAt = item.createdAt.toISOString();
      if (item.updatedAt) item.updatedAt = item.updatedAt.toISOString();
      return item;
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
}

/**
 * Get one recipe by id. Public.
 */
async function getById(req, res, next) {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('createdBy', 'name')
      .lean();
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    // Public can only see active recipes
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'trainer')) {
      if (!recipe.isActive) {
        return res.status(404).json({ message: 'Recipe not found' });
      }
    }
    const { _id, createdBy, ...rest } = recipe;
    const out = {
      ...rest,
      id: _id.toString(),
      createdBy: createdBy?._id?.toString() || createdBy || '',
      createdByName: createdBy?.name,
    };
    if (out.createdAt) out.createdAt = out.createdAt.toISOString();
    if (out.updatedAt) out.updatedAt = out.updatedAt.toISOString();
    res.json(out);
  } catch (err) {
    next(err);
  }
}

/**
 * Create recipe. Admin only.
 * Body: name, description, category, image?, prepTime, cookTime, servings, calories, macros, ingredients[], instructions[], tags[], isActive?.
 */
async function create(req, res, next) {
  try {
    const { name, description, category, image, prepTime, cookTime, servings, calories, macros, ingredients, instructions, tags, isActive } = req.body;
    if (!name || !category) {
      return res.status(400).json({ message: 'Name and category are required' });
    }
    const recipe = await Recipe.create({
      name: name.trim(),
      description: description?.trim() || '',
      category,
      image: image?.trim() || undefined,
      prepTime: Number(prepTime) || 0,
      cookTime: Number(cookTime) || 0,
      servings: Number(servings) || 1,
      calories: Number(calories) || 0,
      macros: {
        protein: macros?.protein ? Number(macros.protein) : 0,
        carbs: macros?.carbs ? Number(macros.carbs) : 0,
        fats: macros?.fats ? Number(macros.fats) : 0,
      },
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      instructions: Array.isArray(instructions) ? instructions : [],
      tags: Array.isArray(tags) ? tags : [],
      createdBy: req.user.id,
      isActive: isActive !== undefined ? isActive === true : true,
    });
    res.status(201).json(recipe.toJSON());
  } catch (err) {
    next(err);
  }
}

/**
 * Update recipe. Admin only.
 */
async function update(req, res, next) {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    const { name, description, category, image, prepTime, cookTime, servings, calories, macros, ingredients, instructions, tags, isActive } = req.body;
    if (name !== undefined) recipe.name = name.trim();
    if (description !== undefined) recipe.description = description.trim();
    if (category !== undefined) recipe.category = category;
    if (image !== undefined) recipe.image = image?.trim() || undefined;
    if (prepTime !== undefined) recipe.prepTime = Number(prepTime) || 0;
    if (cookTime !== undefined) recipe.cookTime = Number(cookTime) || 0;
    if (servings !== undefined) recipe.servings = Number(servings) || 1;
    if (calories !== undefined) recipe.calories = Number(calories) || 0;
    if (macros !== undefined) {
      recipe.macros = {
        protein: macros.protein !== undefined ? Number(macros.protein) : recipe.macros.protein,
        carbs: macros.carbs !== undefined ? Number(macros.carbs) : recipe.macros.carbs,
        fats: macros.fats !== undefined ? Number(macros.fats) : recipe.macros.fats,
      };
    }
    if (ingredients !== undefined && Array.isArray(ingredients)) {
      recipe.ingredients = ingredients;
    }
    if (instructions !== undefined && Array.isArray(instructions)) {
      recipe.instructions = instructions;
    }
    if (tags !== undefined && Array.isArray(tags)) {
      recipe.tags = tags;
    }
    if (isActive !== undefined) recipe.isActive = isActive === true;
    await recipe.save();
    res.json(recipe.toJSON());
  } catch (err) {
    next(err);
  }
}

/**
 * Delete recipe. Admin only.
 */
async function remove(req, res, next) {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove };
