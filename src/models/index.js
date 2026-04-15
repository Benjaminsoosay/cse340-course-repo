// models/index.js
import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Sequelize with PostgreSQL
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',   // Using PostgreSQL
  logging: false
});

// Import model factory functions (adjust paths as needed)
import UserFactory from './User.js';
import OrganizationFactory from './Organization.js';
import ProjectFactory from './Project.js';
import CategoryFactory from './Category.js';
import ProjectCategoryFactory from './ProjectCategory.js';

// Initialize models
const User = UserFactory(sequelize, DataTypes);
const Organization = OrganizationFactory(sequelize, DataTypes);
const Project = ProjectFactory(sequelize, DataTypes);
const Category = CategoryFactory(sequelize, DataTypes);
const ProjectCategory = ProjectCategoryFactory(sequelize, DataTypes);

// ========== ASSOCIATIONS ==========
// Organization ↔ Project (one-to-many)
Organization.hasMany(Project, { foreignKey: 'organization_id' });
Project.belongsTo(Organization, { foreignKey: 'organization_id' });

// Project ↔ Category (many-to-many through ProjectCategory)
Project.belongsToMany(Category, { through: ProjectCategory, foreignKey: 'project_id' });
Category.belongsToMany(Project, { through: ProjectCategory, foreignKey: 'category_id' });

// If any model has its own `associate` method, call it here (optional)
if (User.associate) User.associate(db);
if (Organization.associate) Organization.associate(db);
if (Project.associate) Project.associate(db);
if (Category.associate) Category.associate(db);
if (ProjectCategory.associate) ProjectCategory.associate(db);

// Export all models and the sequelize instance
const db = {
  sequelize,
  Sequelize,
  User,
  Organization,
  Project,
  Category,
  ProjectCategory
};

export default db;