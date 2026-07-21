const router = require('express').Router();

const otherController = require('../../controllers/admin/otherController');
const {
  upload,
} = require('../../controllers/uploadController');
const { authorize } = require('../../middleware/auth');

// banner
router.get('/banner', authorize('banners', 'view'), otherController.getBanners);
router
  .route('/banner')
  .post(authorize('banners', 'add'), upload.single('image'), otherController.postAddBanner);

// newsletter
router.get('/newsletter', authorize('newsletter', 'view'), otherController.getNewsletterList);
router.get('/newsletter/export', authorize('newsletter', 'view'), otherController.getNewsletterExport);

// testimonial
router.get('/testimonial', authorize('testimonials', 'view'), otherController.getTestimonial);
router
  .route('/testimonial/add')
  .get(authorize('testimonials', 'add'), otherController.getAddTestimonial)
  .post(authorize('testimonials', 'add'), upload.single('image'), otherController.postAddTestimonial);
router
  .route('/testimonial/edit/:id')
  .get(authorize('testimonials', 'edit'), otherController.getEditTestimonial)
  .post(authorize('testimonials', 'edit'), upload.single('image'), otherController.postEditTestimonial);
router.get('/testimonial/delete/:id', authorize('testimonials', 'delete'), otherController.getDeleteTestimonial);

// messages & CV upload/import bits live in userRoutes.js (see there for messages module gating)

module.exports = router;
