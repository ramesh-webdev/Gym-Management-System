const GymSettings = require('../models/GymSettings');

function normalizeWorkingHours(wh) {
  if (!wh) return { entries: [{ days: 'Monday - Sunday', open: '06:00', close: '22:00' }] };
  if (wh.entries && Array.isArray(wh.entries) && wh.entries.length > 0) return wh;
  return { entries: [{ days: 'Monday - Sunday', open: wh.open || '06:00', close: wh.close || '22:00' }] };
}

/**
 * Get gym settings (single document). Authenticated users can read.
 */
async function getSettings(req, res, next) {
  try {
    let settings = await GymSettings.findOne().lean();
    if (!settings) {
      const created = await GymSettings.create({});
      settings = created.toJSON ? created.toJSON() : created;
    }
    const workingHours = normalizeWorkingHours(settings.workingHours);
    const out = {
      id: settings._id?.toString(),
      name: settings.name,
      email: settings.email || '',
      address: settings.address,
      phone: settings.phone,
      logo: settings.logo,
      workingHours,
      socialLinks: settings.socialLinks,
      personalTrainingPrice: settings.personalTrainingPrice ?? 500,
    };
    res.json(out);
  } catch (err) {
    next(err);
  }
}

/**
 * Public settings for contact section (no auth). Returns address, phone, email, workingHours only.
 */
async function getPublicSettings(req, res, next) {
  try {
    let settings = await GymSettings.findOne().lean();
    if (!settings) {
      settings = { address: '', phone: '', email: '', workingHours: { entries: [{ days: 'Monday - Sunday', open: '06:00', close: '22:00' }] } };
    } else {
      settings = {
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        workingHours: normalizeWorkingHours(settings.workingHours),
      };
    }
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

/**
 * Update gym settings. Admin only.
 * Body: name?, email?, address?, phone?, logo?, workingHours?, socialLinks?, personalTrainingPrice?
 */
async function updateSettings(req, res, next) {
  try {
    let settings = await GymSettings.findOne();
    if (!settings) {
      settings = await GymSettings.create({});
    }
    const { name, email, address, phone, logo, workingHours, socialLinks, personalTrainingPrice } = req.body;
    if (name !== undefined) settings.name = name;
    if (email !== undefined) settings.email = email;
    if (address !== undefined) settings.address = address;
    if (phone !== undefined) settings.phone = phone;
    if (logo !== undefined) settings.logo = logo;
    if (workingHours !== undefined) settings.workingHours = normalizeWorkingHours(workingHours);
    if (socialLinks !== undefined) settings.socialLinks = socialLinks;
    if (personalTrainingPrice !== undefined) settings.personalTrainingPrice = Math.max(0, Number(personalTrainingPrice));
    await settings.save();
    const out = settings.toJSON ? settings.toJSON() : settings;
    res.json(out);
  } catch (err) {
    next(err);
  }
}

module.exports = { getSettings, getPublicSettings, updateSettings };
