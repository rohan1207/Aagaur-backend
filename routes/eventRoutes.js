import express from 'express';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

const uploadFields = upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'galleryImages' },
]);

router.route('/')
  .get(getEvents)
  .post(protect, uploadFields, createEvent);

router.route('/:id')
  .get(getEventById)
  .put(protect, uploadFields, updateEvent)
  .delete(protect, deleteEvent);

export { router as eventRoutes };