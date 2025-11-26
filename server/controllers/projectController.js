import Project from '../models/Project.js';
import User from '../models/user.model.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

// @desc Creating a new project
export const createProject = asyncHandler(async(req,res)=>{
    const { name, description } = req.body;
    if (!name){
        res.status(400);
        throw new Error("Project name is required");
    }
    const project = new Project({
        name,
        description: description || '',
        projectCreator: req.user.id,
        teamMembers: [req.user.id],
    });
    const createdProject = await project.save();
    res.status(201).json(createdProject);
});

// @desc Get all projects (Admin sees all, User sees theirs)
// @route GET /api/projects
export const getMyProjects = asyncHandler(async(req,res)=>{
    console.log(`User: ${req.user.name}, Role: ${req.user.role}`);
    
    let query;

    // --- ADMIN CHECK ---
    if (req.user.role === 'admin') {
        console.log('Admin detected. Fetching ALL projects.');
        query = {}; 
    } else {
        console.log('User detected. Fetching assigned projects.');
        query = {
            $or:[
                { projectCreator: req.user.id },
                { teamMembers: req.user.id },
            ],
        };
    }

    const projects = await Project.find(query)
    .populate('projectCreator','name email')
    .populate('teamMembers','name email');  
    
    console.log(`Projects found: ${projects.length}`);
    res.status(200).json(projects);
});

export const getProjectById=asyncHandler(async(req,res)=>{
    const project = await Project.findById(req.project._id)
    .populate('projectCreator','name email')
    .populate('teamMembers','name email');
    if (project){
        res.status(200).json(project);
    } else {
        res.status(404);
        throw new Error("Project not found");
    }
});

export const updateProject=asyncHandler(async(req,res)=>{
    const project = req.project;
    const { name,description } = req.body;
    if (name) project.name = name;
    if (description) project.description=description;
    const updatedProject=await project.save();
    res.status(200).json(updatedProject);
});

export const deleteProject= asyncHandler(async (req,res)=>{
    await Project.deleteOne({_id:req.project._id});
    res.status(200).json({message:"Project deleted successfully."});
});

export const addMember=asyncHandler(async(req,res)=>{
    const { email } = req.body;
    const project = req.project;
    const user=await User.findOne({ email });
    if (!user){
        res.status(400);
        throw new Error("User not found with given email");
    }
    const isMember=project.teamMembers.some(
        (memberId)=>memberId.toString()=== user._id.toString()
    );
    if (isMember){
        res.status(400);
        throw new Error("User is already member");
    }
    project.teamMembers.push(user._id);
    await project.save();
    res.status(200).json({message:`${user.name} added to the project successfully.`});
});

export const removeMember=asyncHandler(async(req,res)=>{
    const { userId }=req.params;
    const project = req.project;
    if (project.projectCreator.toString()==userId){
        res.status(400);
        throw new Error("Project creator cannot be removed");
    }
    project.teamMembers.pull(userId);
    await project.save();
    res.status(200).json({message:"${userId} removed from the project successfully."});
});