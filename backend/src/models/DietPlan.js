const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
  foods: [String],
  calories: { type: Number, default: 0 },
  time: String,
}, { _id: true });

const dietPlanSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nutritionist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  dailyCalories: { type: Number, required: true, min: 0 },
  macros: {
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fats: { type: Number, default: 0 },
  },
  meals: [mealSchema],
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id.toString();
      ret.memberId = ret.member?.toString?.() || ret.member;
      ret.nutritionistId = ret.nutritionist?.toString?.() || ret.nutritionist;
      delete ret._id;
      delete ret.__v;
      delete ret.member;
      delete ret.nutritionist;
      if (ret.meals && ret.meals.length) {
        ret.meals = ret.meals.map((m) => ({
          ...m,
          id: m._id?.toString?.() || m.id,
        }));
      }
      return ret;
    },
  },
});

const DietPlan = mongoose.model('DietPlan', dietPlanSchema);
module.exports = DietPlan;
