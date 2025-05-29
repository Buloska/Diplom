const express = require('express');
const router = express.Router();
const { createProject, getProjects, updateProject, getProjectById, deleteProject } = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');
const { addMember, removeMember, updateMemberRole, getProjectMembers } = require('../controllers/projectMemberController');
const checkProjectRole = require('../middleware/checkProjectRole');


router.get('/', authMiddleware, getProjects);
router.put('/:id', authMiddleware, updateProject);
router.delete('/:id', authMiddleware, checkProjectRole(['owner']), deleteProject);
router.get('/:id', authMiddleware, getProjectById);
router.get('/', authMiddleware, getProjects);
router.get('/:id', authMiddleware, getProjectById);
router.post('/', authMiddleware, createProject);
router.post('/:projectId/members', authMiddleware, addMember);
router.put('/:projectId', checkProjectRole(['owner']), updateProject);
router.delete('/:projectId/members/:userId', authMiddleware, removeMember);

router.put('/:projectId/members/:userId', authMiddleware, updateMemberRole);

router.get('/:projectId/members', authMiddleware, getProjectMembers);

module.exports = router;
