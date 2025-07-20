import Project from '../models/Project.js';

// Create Project
export const createProject = async (req, res) => {
  console.log('--- Create Project Request Received ---');
  try {
    console.log('Request Body:', req.body);
    console.log('Request Files:', req.files);

    const {
      title,
      subtitle,
      location,
      projectType,
      category,
      status,
      year,
      client,
      description,
    } = req.body;

    // Safely parse JSON stringified fields from FormData
    let area, quote, keyFeatures, materialsUsed, seoTags;

    try {
        area = req.body.area ? JSON.parse(req.body.area) : undefined;
        quote = req.body.quote ? JSON.parse(req.body.quote) : undefined;
        keyFeatures = req.body.keyFeatures ? JSON.parse(req.body.keyFeatures) : [];
        materialsUsed = req.body.materialsUsed ? JSON.parse(req.body.materialsUsed) : [];
        seoTags = req.body.seoTags ? JSON.parse(req.body.seoTags) : [];
        console.log('Successfully parsed all JSON fields.');
    } catch (parseError) {
        console.error('--- ERROR PARSING JSON FROM REQUEST BODY ---', parseError);
        return res.status(400).json({ message: 'Invalid JSON format in request body.', error: parseError.message });
    }

    if (!req.files || !req.files.mainImage) {
      console.error('Validation Error: Main image is required.');
      return res.status(400).json({ message: 'Main image is required' });
    }

    console.log('Processing images...');
    const mainImageUrl = req.files.mainImage[0].path;
    const galleryImagesUrls = req.files.galleryImages
      ? req.files.galleryImages.map((f) => f.path)
      : [];
    console.log('Main Image URL:', mainImageUrl);
    console.log('Gallery Image URLs:', galleryImagesUrls);

    const projectData = {
      title,
      subtitle,
      location,
      projectType,
      category,
      status,
      year,
      area,
      client,
      description,
      keyFeatures,
      materialsUsed,
      mainImage: mainImageUrl,
      galleryImages: galleryImagesUrls,
      quote,
      seoTags,
    };

    console.log('Constructed Project Data for DB:', projectData);
    const project = new Project(projectData);

    console.log('Attempting to save project to database...');
    const created = await project.save();
    console.log('--- Project Saved Successfully to DB ---');
    console.log('Created Project:', created);
    
    console.log('--- Sending Success Response (201) ---');
    res.status(201).json(created);
    console.log('--- Success Response Sent ---');

  } catch (error) {
    console.error('--- UNHANDLED ERROR IN CREATE PROJECT ---', error);
    // Check if headers have already been sent
    if (res.headersSent) {
        console.error('Headers were already sent, cannot send error response.');
    } else {
        res.status(500).json({ message: 'Server error occurred during project creation.', error: error.message });
    }
  }
};

// Get all projects
export const getProjects = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};

    const projects = await Project.find(filter);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single project
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // If new media uploaded, update URLs
    if (req.files && req.files.mainImage) {
      project.mainImage = req.files.mainImage[0].path;
    }
    if (req.files && req.files.galleryImages) {
      project.galleryImages = req.files.galleryImages.map((f) => f.path);
    }

    // Update other fields
    const fields = [
      'title',
      'subtitle',
      'location',
      'projectType',
      'category',
      'status',
      'year',
      'area',
      'client',
      'description',
      'keyFeatures',
      'materialsUsed',
      'quote',
      'seoTags',
    ];
    
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        // Parse fields that are sent as JSON strings
        if (['area', 'quote', 'keyFeatures', 'materialsUsed', 'seoTags'].includes(field)) {
          try {
            project[field] = JSON.parse(req.body[field]);
          } catch (e) {
            // If parsing fails, it might not be a stringified JSON, so assign directly
            project[field] = req.body[field];
          }
        } else {
          project[field] = req.body[field];
        }
      }
    });

    const updated = await project.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await project.deleteOne();
    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};