import Project from '../models/Project.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js';

// Create Project
export const createProject = async (req, res) => {
  console.log('[createProject] Received request.');
  try {
    const { body, files } = req;
    console.log('[createProject] Request body and files destructured.');

    if (!files || !files.mainImage) {
      return res.status(400).json({ message: 'Main image is required.' });
    }

    // With CloudinaryStorage, files are already uploaded. We just get the paths.
    const mainImageUrl = files.mainImage[0].path;
    const galleryImageUrls = files.galleryImages ? files.galleryImages.map(f => f.path) : [];

    const projectData = {
      ...body,
      mainImage: mainImageUrl,
      galleryImages: galleryImageUrls,
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
    console.log('[createProject] Attempting to save project to database...');
    const createdProject = await project.save();
    console.log('[createProject] Project saved successfully.');

    console.log('[createProject] Sending success response.');
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

    // --- Handle any newly uploaded images ---
    // With CloudinaryStorage, the path property on the file object contains the URL.
    if (req.files && req.files.mainImage) {
      console.log('[updateProject] New mainImage uploaded, updating path');
      project.mainImage = req.files.mainImage[0].path;
    }
    if (req.files && req.files.galleryImages) {
      console.log('[updateProject] New galleryImages uploaded, updating paths');
      // Combine existing images with new ones if necessary, or replace.
      // For simplicity, this example replaces the gallery. 
      // If you need to add to existing, logic would be: project.galleryImages.push(...newImageUrls);
      project.galleryImages = req.files.galleryImages.map(f => f.path);
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