const bcrypt = require('bcryptjs');
const User = require('../models/User');
const MembershipPlan = require('../models/MembershipPlan');
const { getNextValue } = require('../models/Counter');
const notificationService = require('../services/notification.service');

/**
 * List all members. Admin only.
 */
async function list(req, res, next) {
  try {
    const users = await User.find({ role: 'member' })
      .populate('membershipPlan', 'name price duration')
      .populate('assignedTrainer', 'name phone')
      .sort({ createdAt: -1 })
      .lean();
    const list = users.map((u) => {
      const { _id, passwordHash, membershipPlan, assignedTrainer, ...rest } = u;
      const item = {
        ...rest,
        id: _id.toString(),
        membershipPlan: membershipPlan
          ? {
              id: membershipPlan._id.toString(),
              name: membershipPlan.name,
              price: membershipPlan.price,
              duration: membershipPlan.duration,
            }
          : null,
        assignedTrainer: assignedTrainer
          ? {
              id: assignedTrainer._id.toString(),
              name: assignedTrainer.name,
              phone: assignedTrainer.phone,
            }
          : null,
      };
      if (item.createdAt) item.createdAt = item.createdAt.toISOString();
      if (item.updatedAt) item.updatedAt = item.updatedAt.toISOString();
      if (item.lastLogin) item.lastLogin = item.lastLogin.toISOString();
      if (item.membershipExpiry) item.membershipExpiry = item.membershipExpiry.toISOString();
      if (item.joinDate) item.joinDate = item.joinDate.toISOString();
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
      .populate('assignedTrainer', 'name phone')
      .lean();
    if (!user) {
      return res.status(404).json({ message: 'Member not found' });
    }
    const { passwordHash, _id, membershipPlan, assignedTrainer, ...rest } = user;
    const out = {
      ...rest,
      id: _id.toString(),
      membershipPlan: membershipPlan
        ? {
            id: membershipPlan._id.toString(),
            name: membershipPlan.name,
            price: membershipPlan.price,
            duration: membershipPlan.duration,
          }
        : null,
      assignedTrainer: assignedTrainer
        ? {
            id: assignedTrainer._id.toString(),
            name: assignedTrainer.name,
            phone: assignedTrainer.phone,
          }
        : null,
    };
    if (out.createdAt) out.createdAt = out.createdAt.toISOString();
    if (out.updatedAt) out.updatedAt = out.updatedAt.toISOString();
    if (out.lastLogin) out.lastLogin = out.lastLogin.toISOString();
    if (out.membershipExpiry) out.membershipExpiry = out.membershipExpiry.toISOString();
    if (out.joinDate) out.joinDate = out.joinDate.toISOString();
    res.json(out);
  } catch (err) {
    next(err);
  }
}

/**
 * Create member. Admin only.
 * Body: name, phone, password, membershipPlanId (optional), hasPersonalTraining (optional), assignedTrainerId (optional).
 */
async function create(req, res, next) {
  try {
    const { name, phone, password, membershipPlanId, hasPersonalTraining, assignedTrainerId } = req.body;
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
    let assignedTrainer = null;
    if (assignedTrainerId) {
      const trainer = await User.findOne({ _id: assignedTrainerId, role: 'trainer', status: 'active' });
      if (!trainer) {
        return res.status(400).json({ message: 'Trainer not found or inactive' });
      }
      assignedTrainer = trainer._id;
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
      assignedTrainer,
      isOnboarded: false,
    });
    // Update trainer's clients array with the new member
    if (assignedTrainer) {
      const trainer = await User.findById(assignedTrainer);
      if (trainer) {
        trainer.clients = trainer.clients || [];
        if (!trainer.clients.some((id) => id.toString() === user._id.toString())) {
          trainer.clients.push(user._id);
          await trainer.save();
        }
      }
    }
    const created = await User.findById(user._id)
      .populate('membershipPlan', 'name price duration')
      .populate('assignedTrainer', 'name phone')
      .lean();
    // Notify admins: new member
    notificationService.notifyAdmins({
      title: 'New Member Registration',
      message: `${name.trim()} has joined${created.membershipPlan ? ` with ${created.membershipPlan.name}` : ''}.`,
      type: 'info',
      kind: 'membership',
      link: `/admin/members/${user._id}`,
      metadata: { memberId: user._id.toString() },
    }).catch((err) => console.error('Notification notifyAdmins:', err));
    // Notify member: trainer assigned
    if (assignedTrainer) {
      const trainer = await User.findById(assignedTrainer).select('name').lean();
      notificationService.notifyMember(user._id.toString(), {
        title: 'Trainer Assigned',
        message: trainer ? `You have been assigned to ${trainer.name} as your personal trainer.` : 'A personal trainer has been assigned to you.',
        type: 'success',
        kind: 'assignment',
        metadata: { trainerId: assignedTrainer.toString() },
      }).catch((err) => console.error('Notification notifyMember:', err));
      notificationService.notifyTrainer(assignedTrainer.toString(), {
        title: 'New Client Assigned',
        message: `${name.trim()} has been assigned to you.`,
        type: 'info',
        kind: 'assignment',
        link: '/trainer/dashboard',
        metadata: { memberId: user._id.toString() },
      }).catch((err) => console.error('Notification notifyTrainer:', err));
    }
    const { _id, membershipPlan: mp, assignedTrainer: at, passwordHash: ph, ...rest } = created;
    const out = {
      ...rest,
      id: _id.toString(),
      membershipPlan: mp
        ? {
            id: mp._id.toString(),
            name: mp.name,
            price: mp.price,
            duration: mp.duration,
          }
        : null,
      assignedTrainer: at
        ? {
            id: at._id.toString(),
            name: at.name,
            phone: at.phone,
          }
        : null,
    };
    if (out.membershipExpiry) out.membershipExpiry = out.membershipExpiry.toISOString();
    if (out.joinDate) out.joinDate = out.joinDate.toISOString();
    res.status(201).json(out);
  } catch (err) {
    next(err);
  }
}

/**
 * Update member. Admin only.
 * Body: name?, phone?, status?, membershipPlanId?, hasPersonalTraining?, assignedTrainerId?, membershipExpiry?.
 */
async function update(req, res, next) {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'member' });
    if (!user) {
      return res.status(404).json({ message: 'Member not found' });
    }
    const { name, phone, status, membershipPlanId, hasPersonalTraining, assignedTrainerId, membershipExpiry } = req.body;
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
    // Handle trainer assignment
    if (assignedTrainerId !== undefined) {
      const oldTrainerId = user.assignedTrainer?.toString();
      if (assignedTrainerId) {
        // Verify trainer exists and is active
        const trainer = await User.findOne({ _id: assignedTrainerId, role: 'trainer', status: 'active' });
        if (!trainer) {
          return res.status(400).json({ message: 'Trainer not found or inactive' });
        }
        user.assignedTrainer = trainer._id;
        // Add member to trainer's clients if not already there
        if (!trainer.clients || !trainer.clients.some((id) => id.toString() === user._id.toString())) {
          trainer.clients = trainer.clients || [];
          trainer.clients.push(user._id);
          await trainer.save();
        }
        // Remove from old trainer's clients if different
        if (oldTrainerId && oldTrainerId !== assignedTrainerId) {
          const oldTrainer = await User.findById(oldTrainerId);
          if (oldTrainer && oldTrainer.clients) {
            oldTrainer.clients = oldTrainer.clients.filter((id) => id.toString() !== user._id.toString());
            await oldTrainer.save();
          }
        }
      } else {
        // Remove trainer assignment
        user.assignedTrainer = null;
        // Remove from old trainer's clients
        if (oldTrainerId) {
          const oldTrainer = await User.findById(oldTrainerId);
          if (oldTrainer && oldTrainer.clients) {
            oldTrainer.clients = oldTrainer.clients.filter((id) => id.toString() !== user._id.toString());
            await oldTrainer.save();
          }
        }
      }
    }
    await user.save();
    const updated = await User.findById(user._id)
      .populate('membershipPlan', 'name price duration')
      .populate('assignedTrainer', 'name phone')
      .lean();
    // Notify member and trainer when trainer assignment changed
    if (assignedTrainerId !== undefined) {
      const memberName = updated.name || user.name;
      if (assignedTrainerId) {
        const trainer = await User.findById(assignedTrainerId).select('name').lean();
        notificationService.notifyMember(user._id.toString(), {
          title: 'Trainer Assigned',
          message: trainer ? `You have been assigned to ${trainer.name} as your personal trainer.` : 'A personal trainer has been assigned to you.',
          type: 'success',
          kind: 'assignment',
          metadata: { trainerId: assignedTrainerId },
        }).catch((err) => console.error('Notification notifyMember:', err));
        notificationService.notifyTrainer(assignedTrainerId, {
          title: 'New Client Assigned',
          message: `${memberName} has been assigned to you.`,
          type: 'info',
          kind: 'assignment',
          link: '/trainer/dashboard',
          metadata: { memberId: user._id.toString() },
        }).catch((err) => console.error('Notification notifyTrainer:', err));
      }
    }
    // Notify member if membership expires in the next 7 days
    if (updated.membershipExpiry) {
      const expiry = new Date(updated.membershipExpiry);
      const now = new Date();
      const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      if (daysLeft >= 0 && daysLeft <= 7) {
        notificationService.notifyMember(user._id.toString(), {
          title: 'Membership Expiring Soon',
          message: `Your membership expires in ${daysLeft} day(s) (${expiry.toLocaleDateString()}). Renew to continue access.`,
          type: 'warning',
          kind: 'membership',
          link: '/member/membership',
          metadata: { memberId: user._id.toString(), expiry: expiry.toISOString() },
        }).catch((err) => console.error('Notification membership expiry:', err));
      }
    }
    const { _id, membershipPlan, assignedTrainer, passwordHash, ...rest } = updated;
    const out = {
      ...rest,
      id: _id.toString(),
      membershipPlan: membershipPlan
        ? {
            id: membershipPlan._id.toString(),
            name: membershipPlan.name,
            price: membershipPlan.price,
            duration: membershipPlan.duration,
          }
        : null,
      assignedTrainer: assignedTrainer
        ? {
            id: assignedTrainer._id.toString(),
            name: assignedTrainer.name,
            phone: assignedTrainer.phone,
          }
        : null,
    };
    if (out.membershipExpiry) out.membershipExpiry = out.membershipExpiry.toISOString();
    if (out.joinDate) out.joinDate = out.joinDate.toISOString();
    res.json(out);
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
