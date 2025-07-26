import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Automatically configures using CLOUDINARY_URL env var, but we can explicitly set values if desired.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dldr8qqxu',
  api_key: process.env.CLOUDINARY_API_KEY || '731146445771635',
  api_secret: process.env.CLOUDINARY_API_SECRET || undefined, // Keep secret in .env
});

// Storage for images/videos
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'Aagaur/projects',
    resource_type: 'auto',
  },
});

console.log('[CLOUDINARY] Storage configuration created successfully');

const upload = multer({
  storage,
  limits: { fileSize: 1000 * 1024 * 1024 }, // 1GB limit
  onError: (err, next) => {
    console.error('[MULTER] Error occurred:', err);
    next(err);
  },
});

console.log('[CLOUDINARY] Multer upload middleware configured');

export { cloudinary, upload };