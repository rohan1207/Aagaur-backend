import Event from '../models/Event.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js';

// @desc    Create an event
// @route   POST /api/events
// @access  Private/Admin
export const createEvent = async (req, res) => {
  try {
    const { body, files } = req;

    if (!files || !files.mainImage) {
      return res.status(400).json({ message: 'Main image is required.' });
    }

    // Safely parse categories if it's a JSON string
    let categories = body.categories;
    if (typeof categories === 'string') {
      try {
        categories = JSON.parse(categories);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid JSON format for categories.' });
      }
    }

    // --- Parallel Cloudinary uploads ---
    const mainImageUrl = await uploadBufferToCloudinary(files.mainImage[0]);
    const galleryImageUrls = files.galleryImages ? await Promise.all(files.galleryImages.map(f => uploadBufferToCloudinary(f))) : [];

    const eventData = {
      ...body,
      categories,
      mainImage: mainImageUrl,
      galleryImages: galleryImageUrls,
    };

    const event = new Event(eventData);
    const createdEvent = await event.save();

    res.status(201).json(createdEvent);

  } catch (error) {
    console.error('--- ERROR CREATING EVENT ---', error);
    res.status(500).json({ 
      message: 'Server error while creating event.', 
      error: error.message 
    });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({});
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
export const updateEvent = async (req, res) => {
  try {
    const { title, tagline, description, date, categories } = req.body;

    const event = await Event.findById(req.params.id);

    if (event) {
      event.title = title || event.title;
      event.tagline = tagline || event.tagline;
      event.description = description || event.description;
      event.date = date || event.date;
      event.categories = categories || event.categories;

      if (req.files.mainImage) {
        event.mainImage = await uploadBufferToCloudinary(req.files.mainImage[0]);
      }

      if (req.files.galleryImages) {
        event.galleryImages = await Promise.all(req.files.galleryImages.map(file => uploadBufferToCloudinary(file)));
      }

      const updatedEvent = await event.save();
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (event) {
      await event.deleteOne(); // Corrected from remove()
      res.json({ message: 'Event removed' });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

