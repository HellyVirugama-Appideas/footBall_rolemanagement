const router = require('express').Router();
const cvController = require('../../controllers/admin/cvUploadController');
const { authorize, superAdminOnly } = require('../../middleware/auth');

// Upload page
router.get('/cv-upload', authorize('cvUpload', 'view'), cvController.getUploadPage);
router.post('/cv-upload', authorize('cvUpload', 'add'), cvController.cvUploader, cvController.postUploadCVs);

// Search & List
router.get('/cv-search', authorize('cvSearch', 'view'), cvController.searchCVs);

// View single CV
router.get('/cv-view/:id', authorize('cvSearch', 'view'), cvController.viewCV);

// Edit CV
router.get('/cv-edit/:id', authorize('cvSearch', 'edit'), cvController.getEditCV);
router.post('/cv-edit/:id', authorize('cvSearch', 'edit'), cvController.postEditCV);

// Delete CV — Super Admin ONLY, no exceptions
router.get('/cv-delete/:id', superAdminOnly, cvController.deleteCV);

// Download CV (single file — treated as part of "view", allowed to Sub Admin
// with view permission on their own country's CVs)
router.get('/cv-download/:id', authorize('cvSearch', 'view'), cvController.downloadCV);

// Stats AJAX
router.get('/cv-stats', authorize('cvUpload', 'view'), cvController.getStats);

module.exports = router;
