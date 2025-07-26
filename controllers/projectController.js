import Project from '../models/Project.js';

// Create Project
export const createProject = async (req, res) => {
  try {
    const { body, files } = req;

    if (!files || !files.mainImage) {
      return res.status(400).json({ message: 'Main image is required.' });
    }

    const projectData = {
      ...body,
      mainImage: files.mainImage[0].path,
      galleryImages: files.galleryImages ? files.galleryImages.map((f) => f.path) : [],
    };

    // Safely parse fields that are expected to be JSON
    const jsonFields = ['area', 'quote', 'keyFeatures', 'materialsUsed', 'seoTags'];
    jsonFields.forEach(field => {
      if (body[field]) {
        try {
          projectData[field] = JSON.parse(body[field]);
        } catch (e) {
          return res.status(400).json({ message: `Invalid JSON format for field: ${field}` });
        }
      }
    });

    const project = new Project(projectData);
    const createdProject = await project.save();

    res.status(201).json(createdProject);

  } catch (error) {
    console.error('--- ERROR CREATING PROJECT ---', error);
    res.status(500).json({ 
      message: 'Server error while creating project.', 
      error: error.message 
    });
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