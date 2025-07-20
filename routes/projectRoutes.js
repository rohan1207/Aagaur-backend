import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Upload config: mainImage (single), galleryImages (multiple)
const uploadFields = upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'galleryImages' },
]);

router.route('/').get(getProjects).post(uploadFields, createProject);
router
  .route('/:id')
  .get(getProjectById)
  .put(uploadFields, updateProject)
  .delete(deleteProject);

export default router;
