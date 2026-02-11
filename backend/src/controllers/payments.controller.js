const Payment = require('../models/Payment');
const User = require('../models/User');
const MembershipPlan = require('../models/MembershipPlan');
const { getNextValue } = require('../models/Counter');
const notificationService = require('../services/notification.service');

/** Run when a payment is marked paid: extend membership if type=membership (and plan is not add-on), send notifications. */
async function applyPaymentSuccess(payment) {
  if (payment.type === 'membership') {
    const member = await User.findById(payment.member).populate('membershipPlan').lean();
    if (!member) return;

    let planId = payment.membershipPlanId;
    let plan = null;
    if (planId) {
      plan = await MembershipPlan.findById(planId).lean();
    }
    if (!plan) {
      plan = member.membershipPlan;
    }

    if (plan?.isAddOn) {
      // Add-on plan (e.g. Personal Training): do not extend membership or change plan; just enable PT
      await User.updateOne({ _id: payment.member }, { hasPersonalTraining: true });
    } else {
      // Monthly membership plan: extend expiry and optionally set plan
      const durationMonths = plan?.duration ?? 1;
      const base = member.membershipExpiry && new Date(member.membershipExpiry) > new Date()
        ? new Date(member.membershipExpiry)
        : new Date();
      const extended = new Date(base);
      extended.setMonth(extended.getMonth() + durationMonths);

      const update = { membershipExpiry: extended };
      if (payment.membershipPlanId && plan) {
        update.membershipPlan = payment.membershipPlanId;
        update.membershipType = plan.name;
      }
      await User.updateOne({ _id: payment.member }, update);
    }
  }
  if (payment.type === 'personal_training' || (payment.type === 'membership' && payment.addPersonalTraining)) {
    await User.updateOne({ _id: payment.member }, { hasPersonalTraining: true });
  }
  notificationService.notifyAdmins({
    title: 'Payment Received',
    message: `Payment of ₹${payment.amount} from ${payment.memberName} (${payment.invoiceNumber}).`,
    type: 'success',
    kind: 'payment',
    metadata: { paymentId: payment._id.toString(), memberId: payment.member.toString() },
  }).catch((err) => console.error('Notification notifyAdmins:', err));
  notificationService.notifyMember(payment.member.toString(), {
    title: 'Payment Received',
    message: `Your payment of ₹${payment.amount} has been received (${payment.invoiceNumber}). Thank you!`,
    type: 'success',
    kind: 'payment',
    link: '/member/payments',
    metadata: { paymentId: payment._id.toString() },
  }).catch((err) => console.error('Notification notifyMember:', err));
}

/**
 * List payments. Admin: all; Member: own only.
 * Populates plan/product so we can return planName and productName for the "for what" detail.
 */
async function list(req, res, next) {
  try {
    const filter = req.user.role === 'admin' ? {} : { member: req.user.id };
    const payments = await Payment.find(filter)
      .populate('membershipPlanId', 'name')
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .lean();
    const list = payments.map((p) => ({
      id: p._id.toString(),
      memberId: p.member?.toString() || p.member,
      memberName: p.memberName,
      amount: p.amount,
      type: p.type,
      status: p.status,
      date: p.date ? p.date.toISOString() : null,
      dueDate: p.dueDate ? p.dueDate.toISOString() : null,
      invoiceNumber: p.invoiceNumber,
      createdAt: p.createdAt ? p.createdAt.toISOString() : null,
      addPersonalTraining: p.addPersonalTraining || false,
      planName: p.membershipPlanId?.name || null,
      productName: p.product?.name || null,
    }));
    res.json(list);
  } catch (err) {
    next(err);
  }
}

/**
 * Create payment. Admin only.
 * Body: memberId, memberName, amount, type, status?, dueDate?, membershipPlanId?, addPersonalTraining?
 * When type is 'membership', membershipPlanId = specific plan (new/upgrade); omit for renewal (current plan).
 * When status is 'paid', notifies all admins and the member.
 */
async function create(req, res, next) {
  try {
    const { memberId, memberName, amount, type, status = 'pending', dueDate, membershipPlanId, addPersonalTraining } = req.body;
    if (!memberId || !memberName || amount == null || !type) {
      return res.status(400).json({ message: 'memberId, memberName, amount and type are required' });
    }
    const member = await User.findOne({ _id: memberId, role: 'member' });
    if (!member) {
      return res.status(400).json({ message: 'Member not found' });
    }
    if (type === 'membership' && membershipPlanId) {
      const plan = await MembershipPlan.findById(membershipPlanId);
      if (!plan || !plan.isActive) {
        return res.status(400).json({ message: 'Invalid or inactive membership plan' });
      }
    }
    const num = await getNextValue('paymentInvoice');
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(num).padStart(5, '0')}`;
    const payment = await Payment.create({
      member: memberId,
      memberName: memberName.trim(),
      amount: Number(amount),
      type,
      status: status === 'paid' ? 'paid' : status === 'overdue' ? 'overdue' : status === 'cancelled' ? 'cancelled' : 'pending',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      invoiceNumber,
      ...(type === 'membership' && membershipPlanId ? { membershipPlanId } : {}),
      ...(type === 'membership' && addPersonalTraining === true ? { addPersonalTraining: true } : {}),
    });
    const isPaid = payment.status === 'paid';
    if (isPaid) {
      await applyPaymentSuccess(payment);
    }
    const out = {
      id: payment._id.toString(),
      memberId: payment.member.toString(),
      memberName: payment.memberName,
      amount: payment.amount,
      type: payment.type,
      status: payment.status,
      date: payment.date ? payment.date.toISOString() : null,
      dueDate: payment.dueDate ? payment.dueDate.toISOString() : null,
      invoiceNumber: payment.invoiceNumber,
      createdAt: payment.createdAt ? payment.createdAt.toISOString() : null,
    };
    res.status(201).json(out);
  } catch (err) {
    next(err);
  }
}

/**
 * Update payment (e.g. set status to paid). Admin only.
 * When status is updated to 'paid', notifies admins and member.
 */
async function update(req, res, next) {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    const { status } = req.body;
    const wasPaid = payment.status === 'paid';
    if (status && ['paid', 'pending', 'overdue', 'cancelled'].includes(status)) {
      payment.status = status;
    }
    await payment.save();
    const becamePaid = payment.status === 'paid' && !wasPaid;
    if (becamePaid) {
      await applyPaymentSuccess(payment);
    }
    const out = {
      id: payment._id.toString(),
      memberId: payment.member.toString(),
      memberName: payment.memberName,
      amount: payment.amount,
      type: payment.type,
      status: payment.status,
      date: payment.date ? payment.date.toISOString() : null,
      dueDate: payment.dueDate ? payment.dueDate.toISOString() : null,
      invoiceNumber: payment.invoiceNumber,
      createdAt: payment.createdAt ? payment.createdAt.toISOString() : null,
    };
    res.json(out);
  } catch (err) {
    next(err);
  }
}

/**
 * Create order for Razorpay-style checkout. Member only (pays for self).
 * Body: { amount, type, membershipPlanId?, addPersonalTraining? } — addPersonalTraining = add PT add-on (member-level) when type=membership.
 * Returns { orderId, amount, currency } for frontend to open checkout.
 * Payment is created with status 'pending'; verify will mark it paid (auto-approve for now).
 */
async function createOrder(req, res, next) {
  try {
    if (req.user.role !== 'member') {
      return res.status(403).json({ message: 'Only members can create payment orders for self' });
    }
    const { amount, type, membershipPlanId, addPersonalTraining, productId } = req.body;
    if (amount == null || Number(amount) <= 0 || !type) {
      return res.status(400).json({ message: 'amount (positive) and type are required' });
    }
    const validTypes = ['membership', 'personal_training', 'product', 'other'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid type' });
    }
    const member = await User.findById(req.user.id).lean();
    if (!member || member.role !== 'member') {
      return res.status(400).json({ message: 'Member not found' });
    }
    if (type === 'membership' && membershipPlanId) {
      const plan = await MembershipPlan.findById(membershipPlanId);
      if (!plan || !plan.isActive) {
        return res.status(400).json({ message: 'Invalid or inactive membership plan' });
      }
    }
    if (type === 'product' && productId) {
      const Product = require('../models/Product');
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(400).json({ message: 'Product not found' });
      }
    }
    const num = await getNextValue('paymentInvoice');
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(num).padStart(5, '0')}`;
    const orderId = `ord_${Date.now()}_${num}`;
    const payment = await Payment.create({
      member: req.user.id,
      memberName: member.name,
      amount: Number(amount),
      type,
      status: 'pending',
      invoiceNumber,
      orderId,
      ...(type === 'membership' && membershipPlanId ? { membershipPlanId } : {}),
      ...(type === 'membership' && addPersonalTraining === true ? { addPersonalTraining: true } : {}),
      ...(type === 'product' && productId ? { product: productId } : {}),
    });
    res.status(201).json({
      orderId,
      paymentId: payment._id.toString(),
      amount: payment.amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID || 'rzp_auto', // placeholder until real key
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Verify payment after checkout. Razorpay sends payment_id, order_id, signature.
 * For auto-approve: we do not verify signature; we mark the payment paid and run success logic.
 * When switching to real Razorpay, verify signature here and then mark paid.
 */
async function verify(req, res, next) {
  try {
    const { orderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' });
    }
    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (payment.status === 'paid') {
      return res.status(400).json({ message: 'Payment already completed' });
    }
    // Auto-approve: skip real Razorpay signature verification; mark as paid
    payment.status = 'paid';
    if (razorpayPaymentId) payment.razorpayPaymentId = razorpayPaymentId;
    if (razorpaySignature) payment.razorpaySignature = razorpaySignature;
    await payment.save();
    await applyPaymentSuccess(payment);
    const out = {
      id: payment._id.toString(),
      memberId: payment.member.toString(),
      memberName: payment.memberName,
      amount: payment.amount,
      type: payment.type,
      status: payment.status,
      date: payment.date ? payment.date.toISOString() : null,
      dueDate: payment.dueDate ? payment.dueDate.toISOString() : null,
      invoiceNumber: payment.invoiceNumber,
      createdAt: payment.createdAt ? payment.createdAt.toISOString() : null,
    };
    res.json({ success: true, payment: out });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, createOrder, verify };
