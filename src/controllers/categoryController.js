const Category = require('../models/Category');
const Project = require('../models/Project');

exports.show = async (req, res) => {
  const id = req.params.id;
  const category = await Category.findByPk(id, {
    include: Project
  });
  if (!category) return res.status(404).render('404');
  res.render('categories/show', { category });
};