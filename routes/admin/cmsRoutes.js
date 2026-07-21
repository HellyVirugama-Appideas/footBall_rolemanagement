const router = require('express').Router();

const cmsController = require('../../controllers/admin/cmsController');
const { upload } = require('../../controllers/uploadController');
const { authorize } = require('../../middleware/auth');

const M = 'cms';

router.use(authorize(M, 'view'));

router
  .route('/whoWeAre')
  .get(cmsController.getWhoWeAre)
  .post(authorize(M, 'edit'), upload.single('image'), cmsController.postWhoWeAre);

router
  .route('/privacy')
  .get(cmsController.getPrivacy)
  .post(authorize(M, 'edit'), upload.single('image'), cmsController.postPrivacy);

router
  .route('/terms')
  .get(cmsController.getTermsCondi)
  .post(authorize(M, 'edit'), upload.single('image'), cmsController.postTermsCondi);

module.exports = router;
