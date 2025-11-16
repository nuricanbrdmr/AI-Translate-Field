import express from "express";
import { createAProject, listProject, removeProject, updateProject } from "../controllers/projectController.js";
const router = express.Router();


router.post('/add', createAProject);
router.get('/list', listProject);
router.delete('/remove/:id', removeProject)
router.put('/update/:id', updateProject)


export default router;