const router = require('express').Router();

const titleController = require('../../controllers/admin/jobTitleController');
const { authorize } = require('../../middleware/auth');

const M = 'jobTitles';

router.use('/title', authorize(M, 'view'));

router.get('/title', titleController.getTitles);
router
  .route('/title/add')
  .get(authorize(M, 'add'), titleController.getAddTitle)
  .post(authorize(M, 'add'), titleController.postAddTitle);
router
  .route('/title/edit/:id')
  .get(authorize(M, 'edit'), titleController.getEditTitle)
  .post(authorize(M, 'edit'), titleController.postEditTitle);
router.get('/title/delete/:id', authorize(M, 'delete'), titleController.getDeleteTitle);

module.exports = router;
