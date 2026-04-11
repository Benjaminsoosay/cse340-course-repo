const Organization = require('../models/Organization'); // adjust path

exports.index = async (req, res) => {
  const organizations = await Organization.findAll();
  res.render('organizations/index', { organizations });
};

// NEW: detail page
exports.show = async (req, res) => {
  const id = req.params.id;
  const organization = await Organization.findByPk(id); // or findById
  if (!organization) {
    return res.status(404).render('404', { message: 'Organization not found' });
  }
  res.render('organizations/show', { organization });
};