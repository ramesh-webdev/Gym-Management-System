const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, required: true, enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'smoothie'] },
  image: String,
  prepTime: { type: Number, default: 0 }, // minutes
  cookTime: { type: Number, default: 0 }, // minutes
  servings: { type: Number, default: 1 },
  calories: { type: Number, default: 0 },
  macros: {
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fats: { type: Number, default: 0 },
  },
  ingredients: [String],
  instructions: [String],
  tags: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      if (ret.createdAt) ret.createdAt = ret.createdAt.toISOString();
      if (ret.updatedAt) ret.updatedAt = ret.updatedAt.toISOString();
      return ret;
    },
  },
});

const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports = Recipe;
