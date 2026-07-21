const router = require('express').Router();

const recController = require('../../controllers/admin/recruiterController');
const { upload } = require('../../controllers/uploadController');
const { authorize } = require('../../middleware/auth');

const M = 'recruiters';

router.use('/recruiter', authorize(M, 'view'));

router.get('/recruiter', recController.getRecruiters);
router
  .route('/recruiter/add')
  .get(authorize(M, 'add'), recController.getAddRecruiters)
  .post(authorize(M, 'add'), upload.single('image'), recController.postAddRecruiters);
router
  .route('/recruiter/edit/:id')
  .get(authorize(M, 'edit'), recController.getEditRecruiters)
  .post(authorize(M, 'edit'), upload.single('image'), recController.postEditRecruiters);
router.get('/recruiter/delete/:id', authorize(M, 'delete'), recController.getDeleteRecruiters);

module.exports = router;
