import mongoose from 'mongoose';

const internSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    university: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    image: {
      type: String, // Cloudinary URL
      required: true,
    },
    year: {
        type: String,
        trim: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const Intern = mongoose.model('Intern', internSchema);

export default Intern;
