const GymSettings = require('../models/GymSettings');

/**
 * Get gym settings (single document). Returns personalTrainingPrice and other public/settings.
 * Authenticated users (member/admin) can read. Used for PT add-on price on membership page.
 */
async function getSettings(req, res, next) {
  try {
    let settings = await GymSettings.findOne().lean();
    if (!settings) {
      settings = await GymSettings.create({});
      settings = settings.toJSON ? settings.toJSON() : settings;
    }
    const out = {
      id: settings._id?.toString(),
      name: settings.name,
      address: settings.address,
      phone: settings.phone,
      logo: settings.logo,
      workingHours: settings.workingHours,
      socialLinks: settings.socialLinks,
      personalTrainingPrice: settings.personalTrainingPrice ?? 500,
    };
    res.json(out);
  } catch (err) {
    next(err);
  }
}

/**
 * Update gym settings. Admin only.
 * Body: name?, address?, phone?, logo?, workingHours?, socialLinks?, personalTrainingPrice?
 */
async function updateSettings(req, res, next) {
  try {
    let settings = await GymSettings.findOne();
    if (!settings) {
      settings = await GymSettings.create({});
    }
    const { name, address, phone, logo, workingHours, socialLinks, personalTrainingPrice } = req.body;
    if (name !== undefined) settings.name = name;
    if (address !== undefined) settings.address = address;
    if (phone !== undefined) settings.phone = phone;
    if (logo !== undefined) settings.logo = logo;
    if (workingHours !== undefined) settings.workingHours = workingHours;
    if (socialLinks !== undefined) settings.socialLinks = socialLinks;
    if (personalTrainingPrice !== undefined) settings.personalTrainingPrice = Math.max(0, Number(personalTrainingPrice));
    await settings.save();
    const out = settings.toJSON ? settings.toJSON() : settings;
    res.json(out);
  } catch (err) {
    next(err);
  }
}

module.exports = { getSettings, updateSettings };
