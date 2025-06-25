const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  addMember,
  removeMember,
  updateMemberRole,
  getProjectMembers
} = require('../controllers/projectMemberController');
const checkProjectRole = require('../middleware/checkProjectRole');



router.use(authMiddleware);

router.post('/:projectId', addMember); 
router.delete('/:projectId/:userId', removeMember);
router.put('/:projectId/:userId', updateMemberRole);
router.get('/:projectId', getProjectMembers);
router.get('/:projectId/members', authMiddleware, checkProjectRole(['owner', 'manager', 'member']), getProjectMembers);

router.post('/:projectId', checkProjectRole(['owner']), addMember);
router.put('/:projectId/:userId', checkProjectRole(['owner']), updateMemberRole);
router.delete('/:projectId/:userId', checkProjectRole(['owner']), removeMember);

router.get('/:projectId', authMiddleware, getProjectMembers);

module.exports = router;
