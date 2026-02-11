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
  // Razorpay-style: order created for checkout; when real Razorpay is used, these will be set
  orderId: { type: String, unique: true, sparse: true },
  razorpayPaymentId: { type: String, default: null },
  razorpaySignature: { type: String, default: null },
  // When type is membership: optional plan to switch to (else renew current plan)
  membershipPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlan', default: null },
  // When type is membership: add personal training add-on to this payment (member-level, not plan)
  addPersonalTraining: { type: Boolean, default: false },
  // When type is product: which product was purchased
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
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
