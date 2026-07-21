const router = require('express').Router();

const jobController = require('../../controllers/admin/jobController');
const { authorize } = require('../../middleware/auth');

const M = 'jobs';

router.get('/job', authorize(M, 'view'), jobController.getJobs);
router
  .route('/job/add')
  .get(authorize(M, 'add'), jobController.getAddJob)
  .post(authorize(M, 'add'), jobController.postAddJob);
router.get('/job/:id', authorize(M, 'view'), jobController.viewJob);
router
  .route('/job/edit/:id')
  .get(authorize(M, 'edit'), jobController.getEditJob)
  .post(authorize(M, 'edit'), jobController.postEditJob);
router.get('/job/delete/:id', authorize(M, 'delete'), jobController.getDeleteJob);
router.post('/updateSwitchState/:jobId', authorize(M, 'edit'), jobController.updateSwitch);

module.exports = router;
