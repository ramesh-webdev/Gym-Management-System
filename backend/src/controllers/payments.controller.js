const crypto = require('crypto');
const Payment = require('../models/Payment');
const User = require('../models/User');
const MembershipPlan = require('../models/MembershipPlan');
const GymSettings = require('../models/GymSettings');
const { getNextValue } = require('../models/Counter');
const notificationService = require('../services/notification.service');
const config = require('../config/env');

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
      if (status === 'paid') payment.date = new Date();
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
 * Create order for Razorpay checkout. Member only (pays for self).
 * Body: { amount, type, membershipPlanId?, addPersonalTraining?, productId? }.
 * Amount is server-computed when type is membership (plan/renewal), product, or personal_training;
 * for type 'other' client amount is used. Prevents underpayment by trusting plan/product/settings.
 */
async function createOrder(req, res, next) {
  try {
    if (req.user.role !== 'member') {
      return res.status(403).json({ message: 'Only members can create payment orders for self' });
    }
    const { amount: clientAmount, type, membershipPlanId, addPersonalTraining, productId } = req.body;
    if (!type) {
      return res.status(400).json({ message: 'type is required' });
    }
    const validTypes = ['membership', 'personal_training', 'product', 'other'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid type' });
    }
    const member = await User.findById(req.user.id).lean();
    if (!member || member.role !== 'member') {
      return res.status(400).json({ message: 'Member not found' });
    }

    let amountRupees;
    if (type === 'membership') {
      let plan = null;
      if (membershipPlanId) {
        plan = await MembershipPlan.findById(membershipPlanId).lean();
        if (!plan || !plan.isActive) {
          return res.status(400).json({ message: 'Invalid or inactive membership plan' });
        }
      } else {
        const populated = await User.findById(req.user.id).populate('membershipPlan').lean();
        plan = populated?.membershipPlan || null;
      }
      if (!plan) {
        return res.status(400).json({ message: 'Membership plan required for membership payment' });
      }
      amountRupees = plan.price || 0;
      if (addPersonalTraining === true) {
        const settings = await GymSettings.findOne().lean();
        const ptPrice = settings?.personalTrainingPrice ?? 500;
        amountRupees += ptPrice;
      }
    } else if (type === 'product') {
      if (!productId) {
        return res.status(400).json({ message: 'productId is required for product payment' });
      }
      const Product = require('../models/Product');
      const product = await Product.findById(productId).lean();
      if (!product) {
        return res.status(400).json({ message: 'Product not found' });
      }
      amountRupees = Number(product.price) || 0;
    } else if (type === 'personal_training') {
      const settings = await GymSettings.findOne().lean();
      amountRupees = settings?.personalTrainingPrice ?? 500;
    } else {
      if (clientAmount == null || Number(clientAmount) <= 0) {
        return res.status(400).json({ message: 'amount (positive) is required for type "other"' });
      }
      amountRupees = Number(clientAmount);
    }

    if (amountRupees <= 0) {
      return res.status(400).json({ message: 'Computed amount must be positive' });
    }

    const num = await getNextValue('paymentInvoice');
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(num).padStart(5, '0')}`;
    const amountPaise = Math.round(amountRupees * 100);

    let orderId;
    const useRazorpay = config.razorpayKeyId && config.razorpayKeySecret;

    if (useRazorpay) {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: config.razorpayKeyId,
        key_secret: config.razorpayKeySecret,
      });
      const order = await razorpay.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt: invoiceNumber,
      });
      orderId = order.id;
    } else {
      orderId = `ord_${Date.now()}_${num}`;
    }

    const payment = await Payment.create({
      member: req.user.id,
      memberName: member.name,
      amount: amountRupees,
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
      amount: amountPaise,
      currency: 'INR',
      key: config.razorpayKeyId || '',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Verify payment after Razorpay checkout.
 * Body: orderId, razorpayPaymentId, razorpaySignature (from Razorpay success handler).
 * Verifies signature when Razorpay key secret is set; otherwise allows test mode (no signature).
 */
function verifyRazorpaySignature(orderId, paymentId, signature) {
  if (!config.razorpayKeySecret || !paymentId || !signature) return false;
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac('sha256', config.razorpayKeySecret).update(body).digest('hex');
  return expected === signature;
}

async function verify(req, res, next) {
  try {
    const { orderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' });
    }
    const payment = await Payment.findOne({ orderId }).lean();
    if (!payment) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (payment.status === 'paid') {
      return res.status(400).json({ message: 'Payment already completed' });
    }
    if (payment.member.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only verify your own payment' });
    }
    const useRazorpay = !!config.razorpayKeySecret;
    if (useRazorpay) {
      if (!razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ message: 'razorpayPaymentId and razorpaySignature are required' });
      }
      if (!verifyRazorpaySignature(orderId, razorpayPaymentId, razorpaySignature)) {
        return res.status(400).json({ message: 'Payment verification failed' });
      }
    }
    const updated = await Payment.findOneAndUpdate(
      { orderId, status: 'pending' },
      {
        $set: {
          status: 'paid',
          date: new Date(),
          ...(razorpayPaymentId && { razorpayPaymentId }),
          ...(razorpaySignature && { razorpaySignature }),
        },
      },
      { new: true }
    );
    if (!updated) {
      return res.status(400).json({ message: 'Payment already completed or order not found' });
    }
    await applyPaymentSuccess(updated);
    const out = {
      id: updated._id.toString(),
      memberId: updated.member.toString(),
      memberName: updated.memberName,
      amount: updated.amount,
      type: updated.type,
      status: updated.status,
      date: updated.date ? updated.date.toISOString() : null,
      dueDate: updated.dueDate ? updated.dueDate.toISOString() : null,
      invoiceNumber: updated.invoiceNumber,
      createdAt: updated.createdAt ? updated.createdAt.toISOString() : null,
    };
    res.json({ success: true, payment: out });
  } catch (err) {
    next(err);
  }
}

/**
 * Cancel a pending order (e.g. user opened Razorpay and closed without paying).
 * Body: { orderId }. Member only; only the payment owner can cancel; only pending payments.
 */
async function cancelOrder(req, res, next) {
  try {
    if (req.user.role !== 'member') {
      return res.status(403).json({ message: 'Only members can cancel their own orders' });
    }
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' });
    }
    const updated = await Payment.findOneAndUpdate(
      { orderId, status: 'pending', member: req.user.id },
      { $set: { status: 'cancelled' } },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({
        message: 'Order not found, already completed, or you do not own this order',
      });
    }
    res.json({
      success: true,
      message: 'Order cancelled',
      paymentId: updated._id.toString(),
      status: updated.status,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, createOrder, verify, cancelOrder };
