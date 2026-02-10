const Payment = require('../models/Payment');
const User = require('../models/User');
const { getNextValue } = require('../models/Counter');
const notificationService = require('../services/notification.service');

/**
 * List payments. Admin: all; Member: own only.
 */
async function list(req, res, next) {
  try {
    const filter = req.user.role === 'admin' ? {} : { member: req.user.id };
    const payments = await Payment.find(filter)
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
    }));
    res.json(list);
  } catch (err) {
    next(err);
  }
}

/**
 * Create payment. Admin only.
 * Body: memberId (user id), memberName, amount, type, status?, dueDate?
 * When status is 'paid', notifies all admins and the member.
 */
async function create(req, res, next) {
  try {
    const { memberId, memberName, amount, type, status = 'pending', dueDate } = req.body;
    if (!memberId || !memberName || amount == null || !type) {
      return res.status(400).json({ message: 'memberId, memberName, amount and type are required' });
    }
    const member = await User.findOne({ _id: memberId, role: 'member' });
    if (!member) {
      return res.status(400).json({ message: 'Member not found' });
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
    });
    const isPaid = payment.status === 'paid';
    if (isPaid) {
      notificationService.notifyAdmins({
        title: 'Payment Received',
        message: `Payment of ₹${payment.amount} received from ${payment.memberName} (${payment.invoiceNumber}).`,
        type: 'success',
        kind: 'payment',
        metadata: { paymentId: payment._id.toString(), memberId },
      }).catch((err) => console.error('Notification notifyAdmins:', err));
      notificationService.notifyMember(memberId, {
        title: 'Payment Received',
        message: `Your payment of ₹${payment.amount} has been received (${payment.invoiceNumber}). Thank you!`,
        type: 'success',
        kind: 'payment',
        link: '/member/payments',
        metadata: { paymentId: payment._id.toString() },
      }).catch((err) => console.error('Notification notifyMember:', err));
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
      notificationService.notifyAdmins({
        title: 'Payment Received',
        message: `Payment of ₹${payment.amount} from ${payment.memberName} (${payment.invoiceNumber}) marked as paid.`,
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

module.exports = { list, create, update };
