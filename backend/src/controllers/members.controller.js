const bcrypt = require('bcryptjs');
const User = require('../models/User');
const MembershipPlan = require('../models/MembershipPlan');
const { getNextValue } = require('../models/Counter');

/**
 * List all members. Admin only.
 */
async function list(req, res, next) {
  try {
    const users = await User.find({ role: 'member' })
      .populate('membershipPlan', 'name price duration')
      .sort({ createdAt: -1 })
      .lean();
    const list = users.map((u) => {
      const { _id, passwordHash, ...rest } = u;
      const item = { ...rest, id: _id.toString() };
      if (item.createdAt) item.createdAt = item.createdAt.toISOString();
      if (item.updatedAt) item.updatedAt = item.updatedAt.toISOString();
      if (item.lastLogin) item.lastLogin = item.lastLogin.toISOString();
      if (item.membershipExpiry) item.membershipExpiry = item.membershipExpiry.toISOString();
      if (item.joinDate) item.joinDate = item.joinDate.toISOString();
      if (item.membershipPlan && item.membershipPlan._id) {
        item.membershipPlan = {
          id: item.membershipPlan._id.toString(),
          name: item.membershipPlan.name,
          price: item.membershipPlan.price,
          duration: item.membershipPlan.duration,
        };
      }
      return item;
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
}

/**
 * Get one member by id. Admin only.
 */
async function getById(req, res, next) {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'member' })
      .populate('membershipPlan', 'name price duration')
      .lean();
    if (!user) {
      return res.status(404).json({ message: 'Member not found' });
    }
    const { passwordHash, _id, ...rest } = user;
    const out = { ...rest, id: _id.toString() };
    if (out.createdAt) out.createdAt = out.createdAt.toISOString();
    if (out.updatedAt) out.updatedAt = out.updatedAt.toISOString();
    if (out.lastLogin) out.lastLogin = out.lastLogin.toISOString();
    if (out.membershipExpiry) out.membershipExpiry = out.membershipExpiry.toISOString();
    if (out.joinDate) out.joinDate = out.joinDate.toISOString();
    if (out.membershipPlan && out.membershipPlan._id) {
      out.membershipPlan = {
        id: out.membershipPlan._id.toString(),
        name: out.membershipPlan.name,
        price: out.membershipPlan.price,
        duration: out.membershipPlan.duration,
      };
    }
    res.json(out);
  } catch (err) {
    next(err);
  }
}

/**
 * Create member. Admin only.
 * Body: name, phone, password, membershipPlanId (optional), hasPersonalTraining (optional).
 */
async function create(req, res, next) {
  try {
    const { name, phone, password, membershipPlanId, hasPersonalTraining } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'Name, phone and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const existing = await User.findOne({ phone: phone.trim() });
    if (existing) {
      return res.status(400).json({ message: 'A user with this phone number already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const memberId = await getNextValue('memberId');
    const membershipId = `mem-${String(memberId).padStart(3, '0')}`;
    const now = new Date();
    let membershipExpiry = null;
    let membershipType = null;
    let membershipPlan = null;
    if (membershipPlanId) {
      const plan = await MembershipPlan.findById(membershipPlanId);
      if (!plan) {
        return res.status(400).json({ message: 'Membership plan not found' });
      }
      membershipPlan = plan._id;
      membershipType = plan.name;
      const expiryDate = new Date(now);
      expiryDate.setMonth(expiryDate.getMonth() + plan.duration);
      membershipExpiry = expiryDate;
    }
    const user = await User.create({
      name: name.trim(),
      phone: phone.trim(),
      passwordHash,
      role: 'member',
      status: 'active',
      membershipId,
      membershipPlan,
      membershipType,
      membershipExpiry,
      joinDate: now,
      hasPersonalTraining: hasPersonalTraining === true,
      isOnboarded: false,
    });
    res.status(201).json(user.toJSON());
  } catch (err) {
    next(err);
  }
}

/**
 * Update member. Admin only.
 * Body: name?, phone?, status?, membershipPlanId?, hasPersonalTraining?, membershipExpiry?.
 */
async function update(req, res, next) {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'member' });
    if (!user) {
      return res.status(404).json({ message: 'Member not found' });
    }
    const { name, phone, status, membershipPlanId, hasPersonalTraining, membershipExpiry } = req.body;
    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined && phone.trim() !== user.phone) {
      const existing = await User.findOne({ phone: phone.trim() });
      if (existing) {
        return res.status(400).json({ message: 'A user with this phone number already exists' });
      }
      user.phone = phone.trim();
    }
    if (status !== undefined && ['active', 'inactive', 'suspended'].includes(status)) {
      user.status = status;
    }
    if (membershipPlanId !== undefined) {
      if (membershipPlanId) {
        const plan = await MembershipPlan.findById(membershipPlanId);
        if (!plan) {
          return res.status(400).json({ message: 'Membership plan not found' });
        }
        user.membershipPlan = plan._id;
        user.membershipType = plan.name;
        if (!membershipExpiry) {
          const now = new Date();
          const expiryDate = new Date(now);
          expiryDate.setMonth(expiryDate.getMonth() + plan.duration);
          user.membershipExpiry = expiryDate;
        }
      } else {
        user.membershipPlan = null;
        user.membershipType = null;
        user.membershipExpiry = null;
      }
    }
    if (membershipExpiry !== undefined && membershipExpiry) {
      user.membershipExpiry = new Date(membershipExpiry);
    }
    if (hasPersonalTraining !== undefined) {
      user.hasPersonalTraining = hasPersonalTraining === true;
    }
    await user.save();
    res.json(user.toJSON());
  } catch (err) {
    next(err);
  }
}


/**
 * Delete member. Admin only.
 */
async function deleteMember(req, res, next) {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'member' });
    if (!user) {
      return res.status(404).json({ message: 'Member not found' });
    }
    await User.deleteOne({ _id: user._id });
    res.json({ message: 'Member deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, deleteMember };
