import User from "../models/user.js";
import dotenv from "dotenv";
import Subject from "../models/subjects.js";
dotenv.config();

export const createSubject = async (req, res,next) => {
    const { subjectName, subjectDescription, subjectImage, subjectPrice, subjectBoard, subjectGrade } = req.body;

    if (!subjectName || !subjectDescription || !subjectImage || !subjectPrice || !subjectBoard || !subjectGrade) {
        return res.status(400).json({ message: "Please enter all fields" });
    }

    try{
        if( req.isTeacher === true ){

            const newSubject = new Subject({
                ...req.body,
                subjectPrice: parseInt(subjectPrice),
                subjectGrade: parseInt(subjectGrade),
                user: req.userId
            });
            const savedSubject = await newSubject.save();
            const updateUser = await User.findById(req.userId);
            updateUser.subjects.push(savedSubject._id);
            await updateUser.save();
    
    
    
            res.status(202).json({ message: "Subject Created", savedSubject });
        }
        else{
            res.status(400).json({ message: "Only teachers can create subjects" });
        }

        
    }
    catch(err){
        console.log(err,'Error in createSubject api');
        next(err);
    }
}

export const getAllSubjects = async (req, res,next) => {
    try {
        
        const subjects = await Subject.find({subjectVerification:true});
        res.status(200).json(subjects);
    }
    catch (err) {
        console.log(err);
        next(err);
    }
}

export const getSubjectsToVerify = async (req, res,next) => {

    try{
        if(!isAdmin){
            return res.status(400).json({message:"Only admin can Verify Subjects"});
        }
        const subjects = await Subject.find({subjectVerification:false});
        res.status(200).json(subjects);
    }
    catch(err){
        console.log(err);
        next(err);
    }
}


export const getOneSubject = async (req, res, next) => {
    try {
        const subject = await Subject.findById(req.params.subjectId).populate('user', '-password');
        if (!subject) {
            return res.status(400).json({ message: "Subject not found" });
        }
        res.status(200).json(subject);
    }
    catch (err) {
        console.log(err);
        next(err);
    }
}

export const updateSubject = async (req, res, next) => {
    try {
        if(!req.isTeacher){
            return res.status(400).json({message:"Only teachers can view subjects"});
        }
        const user = await User.findById(req.userId);
        if (!(user.subjects.includes(req.params.subjectId))) {
            return res.status(400).json({ message: "You are not authorized to Edit this subject" });

        }
        const subject = await Subject.findById(req.params.subjectId);
        if (!subject) {
            return res.status(400).json({ message: "Subject not found" });
        }
        const updatedSubject = await Subject.findByIdAndUpdate(req.params.subjectId, req.body, { new: true });
        res.status(200).json({ message: "Subject Updated", updatedSubject });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
}

export const deleteSubject = async (req, res, next) => {
    try {
        if(!req.isTeacher){
            return res.status(400).json({message:"Only teachers can view subjects"});
        }
        const user = await User.findById(req.userId);
        if (!(user.subjects.includes(req.params.subjectId))) {
            return res.status(400).json({ message: "You are not authorized to Edit this subject" });

        }
        const subject = await Subject.findById(req.params.subjectId);
        if (!subject) {
            return res.status(400).json({ message: "Subject not found" });
        }
        await Subject.findByIdAndDelete(req.params.subjectId);
        res.status(200).json({ message: "Subject Deleted" });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
}