// src/routes/categoryRoutes.js
import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import * as categoryController from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', requireAuth, categoryController.list);
router.get('/create', requireAuth, requireAdmin, categoryController.showCreate);
router.post('/create', requireAuth, requireAdmin, categoryController.create);
router.get('/edit/:id', requireAuth, requireAdmin, categoryController.showEdit);
router.post('/edit/:id', requireAuth, requireAdmin, categoryController.edit);
router.get('/:id', requireAuth, categoryController.show);

export default router;
