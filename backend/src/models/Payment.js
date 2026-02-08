const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  memberName: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  type: { type: String, required: true, enum: ['membership', 'personal_training', 'product', 'other'] },
  status: { type: String, default: 'pending', enum: ['paid', 'pending', 'overdue', 'cancelled'] },
  date: { type: Date, default: Date.now },
  dueDate: Date,
  invoiceNumber: { type: String, required: true, unique: true },
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id.toString();
      ret.memberId = ret.member?.toString?.() || ret.member;
      delete ret._id;
      delete ret.__v;
      delete ret.member;
      if (ret.date) ret.date = ret.date.toISOString();
      if (ret.dueDate) ret.dueDate = ret.dueDate.toISOString();
      return ret;
    },
  },
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
