const router = require('express').Router();

const skillController = require('../../controllers/admin/jobSkillController');
const { authorize } = require('../../middleware/auth');

const M = 'jobSkills';

router.use('/skill', authorize(M, 'view'));

router.get('/skill', skillController.getSkills);
router
  .route('/skill/add')
  .get(authorize(M, 'add'), skillController.getAddSkill)
  .post(authorize(M, 'add'), skillController.postAddSkill);
router
  .route('/skill/edit/:id')
  .get(authorize(M, 'edit'), skillController.getEditSkill)
  .post(authorize(M, 'edit'), skillController.postEditSkill);
router.get('/skill/delete/:id', authorize(M, 'delete'), skillController.getDeleteSkill);

module.exports = router;
