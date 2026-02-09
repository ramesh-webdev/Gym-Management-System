const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 },
}, {
  timestamps: true,
});

const Counter = mongoose.model('Counter', counterSchema);

/**
 * Get next value for a counter (increment and return).
 * Creates the counter if it doesn't exist.
 */
async function getNextValue(name) {
  const counter = await Counter.findOneAndUpdate(
    { name },
    { $inc: { value: 1 } },
    { upsert: true, new: true }
  );
  return counter.value;
}

module.exports = { Counter, getNextValue };
