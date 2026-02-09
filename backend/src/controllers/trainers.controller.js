const bcrypt = require('bcryptjs');
const User = require('../models/User');
const DietPlan = require('../models/DietPlan');

/**
 * List all trainers. Admin only.
 * Query params: status? (default: all)
 */
async function list(req, res, next) {
  try {
    const { status } = req.query;
    const filter = { role: 'trainer' };
    if (status && status !== 'all') {
      filter.status = status;
    }
    const trainers = await User.find(filter)
      .select('name phone avatar specialization experience bio rating status clients')
      .sort({ createdAt: -1 })
      .lean();
    const list = trainers.map((t) => {
      const { _id, clients, ...rest } = t;
      return {
        ...rest,
        id: _id.toString(),
        clientsCount: clients ? clients.length : 0,
      };
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
}

/**
 * Get trainer by id. Admin only.
 */
async function getById(req, res, next) {
  try {
    const trainer = await User.findOne({ _id: req.params.id, role: 'trainer' })
      .select('-passwordHash')
      .lean();
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    const { _id, clients, ...rest } = trainer;
    const out = {
      ...rest,
      id: _id.toString(),
      clientsCount: clients ? clients.length : 0,
    };
    if (out.createdAt) out.createdAt = out.createdAt.toISOString();
    if (out.updatedAt) out.updatedAt = out.updatedAt.toISOString();
    if (out.lastLogin) out.lastLogin = out.lastLogin.toISOString();
    res.json(out);
  } catch (err) {
    next(err);
  }
}

/**
 * Create trainer. Admin only.
 * Body: name, phone, password, specialization[], experience?, bio?.
 */
async function create(req, res, next) {
  try {
    const { name, phone, password, specialization, experience, bio } = req.body;
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
    const trainer = await User.create({
      name: name.trim(),
      phone: phone.trim(),
      passwordHash,
      role: 'trainer',
      status: 'active',
      specialization: Array.isArray(specialization) ? specialization : [],
      experience: experience ? Number(experience) : 0,
      bio: bio?.trim() || '',
      rating: 0,
      clients: [],
      isOnboarded: true,
    });
    const { _id, passwordHash: ph, ...rest } = trainer.toJSON();
    res.status(201).json({ ...rest, id: _id });
  } catch (err) {
    next(err);
  }
}

/**
 * Update trainer. Admin only.
 * Body: name?, phone?, status?, specialization?, experience?, bio?, newPassword?.
 */
async function update(req, res, next) {
  try {
    const trainer = await User.findOne({ _id: req.params.id, role: 'trainer' });
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    const { name, phone, status, specialization, experience, bio, newPassword } = req.body;
    if (name !== undefined) trainer.name = name.trim();
    if (phone !== undefined && phone.trim() !== trainer.phone) {
      const existing = await User.findOne({ phone: phone.trim() });
      if (existing) {
        return res.status(400).json({ message: 'A user with this phone number already exists' });
      }
      trainer.phone = phone.trim();
    }
    if (status !== undefined && ['active', 'inactive', 'suspended'].includes(status)) {
      trainer.status = status;
    }
    if (specialization !== undefined && Array.isArray(specialization)) {
      trainer.specialization = specialization;
    }
    if (experience !== undefined) trainer.experience = Number(experience) || 0;
    if (bio !== undefined) trainer.bio = bio.trim();
    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      trainer.passwordHash = await bcrypt.hash(newPassword, 10);
    }
    await trainer.save();
    const { _id, passwordHash, clients, ...rest } = trainer.toJSON();
    const out = {
      ...rest,
      id: _id,
      clientsCount: trainer.clients ? trainer.clients.length : 0,
    };
    res.json(out);
  } catch (err) {
    next(err);
  }
}

/**
 * Delete trainer. Admin only.
 * Note: This will also remove trainer assignment from members.
 */
async function remove(req, res, next) {
  try {
    const trainer = await User.findOne({ _id: req.params.id, role: 'trainer' });
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    // Remove trainer assignment from all members
    await User.updateMany(
      { assignedTrainer: trainer._id },
      { $unset: { assignedTrainer: '' } }
    );
    // Delete trainer
    await User.findByIdAndDelete(trainer._id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

/**
 * Get my clients (for authenticated trainer).
 */
async function getMyClients(req, res, next) {
  try {
    const trainer = await User.findById(req.user.id)
      .populate({
        path: 'clients',
        select: 'name phone avatar status membershipId membershipType membershipExpiry hasPersonalTraining onboardingData',
        populate: {
          path: 'membershipPlan',
          select: 'name price duration',
        },
      })
      .lean();
    if (!trainer || trainer.role !== 'trainer') {
      return res.status(403).json({ message: 'Trainer access required' });
    }
    const clients = (trainer.clients || []).map((c) => {
      const { _id, membershipPlan, ...rest } = c;
      const client = {
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
      };
      if (client.membershipExpiry) client.membershipExpiry = client.membershipExpiry.toISOString();
      if (client.joinDate) client.joinDate = client.joinDate.toISOString();
      return client;
    });
    res.json(clients);
  } catch (err) {
    next(err);
  }
}

/**
 * Get client details including diet plan. Trainer only.
 */
async function getClientDetails(req, res, next) {
  try {
    const trainer = await User.findById(req.user.id).lean();
    if (!trainer || trainer.role !== 'trainer') {
      return res.status(403).json({ message: 'Trainer access required' });
    }
    const clientId = req.params.clientId;
    const client = await User.findOne({ _id: clientId, role: 'member' })
      .populate('membershipPlan', 'name price duration')
      .populate('assignedTrainer', 'name phone')
      .lean();
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    // Verify trainer has access to this client
    if (!trainer.clients || !trainer.clients.some((id) => id.toString() === clientId)) {
      return res.status(403).json({ message: 'Access denied to this client' });
    }
    // Get client's diet plan
    let dietPlan = null;
    if (client.hasPersonalTraining) {
      const plan = await DietPlan.findOne({ memberId: clientId })
        .populate('nutritionist', 'name')
        .sort({ createdAt: -1 })
        .lean();
      if (plan) {
        const { _id, member, nutritionist, ...rest } = plan;
        dietPlan = {
          ...rest,
          id: _id.toString(),
          memberId: member?._id?.toString() || member || '',
          memberName: member?.name,
          nutritionistId: nutritionist?._id?.toString() || nutritionist || '',
          nutritionistName: nutritionist?.name,
        };
        if (dietPlan.createdAt) dietPlan.createdAt = dietPlan.createdAt.toISOString();
        if (dietPlan.updatedAt) dietPlan.updatedAt = dietPlan.updatedAt.toISOString();
      }
    }
    const { _id, membershipPlan, assignedTrainer, ...rest } = client;
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
      dietPlan,
    };
    if (out.membershipExpiry) out.membershipExpiry = out.membershipExpiry.toISOString();
    if (out.joinDate) out.joinDate = out.joinDate.toISOString();
    res.json(out);
  } catch (err) {
    next(err);
  }
}

/**
 * Get diet plans for all my clients. Trainer only.
 */
async function getMyClientsDietPlans(req, res, next) {
  try {
    const trainer = await User.findById(req.user.id).lean();
    if (!trainer || trainer.role !== 'trainer') {
      return res.status(403).json({ message: 'Trainer access required' });
    }
    const clientIds = (trainer.clients || []).map((id) => id.toString());
    if (clientIds.length === 0) {
      return res.json([]);
    }
    const plans = await DietPlan.find({ member: { $in: trainer.clients } })
      .populate('member', 'name')
      .populate('nutritionist', 'name')
      .sort({ updatedAt: -1 })
      .lean();
    const list = plans.map((p) => {
      const { _id, member, nutritionist, ...rest } = p;
      return {
        id: _id.toString(),
        clientId: member?._id?.toString() || member?.toString?.() || '',
        clientName: member?.name || '',
        nutritionistName: nutritionist?.name || '',
        ...rest,
        createdAt: p.createdAt?.toISOString?.(),
        updatedAt: p.updatedAt?.toISOString?.(),
      };
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
}

/**
 * Get my profile (for authenticated trainer).
 */
async function getMyProfile(req, res, next) {
  try {
    const trainer = await User.findById(req.user.id)
      .select('-passwordHash')
      .lean();
    if (!trainer || trainer.role !== 'trainer') {
      return res.status(403).json({ message: 'Trainer access required' });
    }
    const { _id, ...rest } = trainer;
    const out = {
      ...rest,
      id: _id.toString(),
      clientsCount: trainer.clients ? trainer.clients.length : 0,
    };
    if (out.createdAt) out.createdAt = out.createdAt.toISOString();
    if (out.updatedAt) out.updatedAt = out.updatedAt.toISOString();
    if (out.lastLogin) out.lastLogin = out.lastLogin.toISOString();
    res.json(out);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove, getMyClients, getClientDetails, getMyClientsDietPlans, getMyProfile };
