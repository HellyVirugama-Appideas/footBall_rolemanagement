// const router = require('express').Router();
// const adminUserController = require('../../controllers/admin/adminUserController');
// const { authorize } = require('../../middleware/auth');

// router.get('/admins', authorize('admins', 'view'), adminUserController.getAdmins);
// router.get('/admins/add', authorize('admins', 'add'), adminUserController.getAddAdmin);
// router.post('/admins/add', authorize('admins', 'add'), adminUserController.postAddAdmin);
// router.get('/admins/edit/:id', authorize('admins', 'edit'), adminUserController.getEditAdmin);
// router.post('/admins/edit/:id', authorize('admins', 'edit'), adminUserController.postEditAdmin);
// router.get('/admins/status/:id', authorize('admins', 'edit'), adminUserController.toggleAdminStatus);
// router.get('/admins/delete/:id', authorize('admins', 'delete'), adminUserController.getDeleteAdmin);

// module.exports = router;

const router = require('express').Router();

const adminUserController = require('../../controllers/admin/adminUserController');
const { superAdminOnly } = require('../../middleware/auth');
const { 
  dynamicAuthorize, 
  dynamicAuthorizeEdit, 
  dynamicAuthorizeAdd 
} = require('../../middleware/permission');

const ADMIN_MODULE = 'admins';

// Admin Management Routes
router.get('/admins', dynamicAuthorize(ADMIN_MODULE), adminUserController.getAdmins);
router.get('/admins/add', dynamicAuthorizeAdd(ADMIN_MODULE), adminUserController.getAddAdmin);
router.post('/admins/add', dynamicAuthorizeAdd(ADMIN_MODULE), adminUserController.postAddAdmin);
router.get('/admins/edit/:id', dynamicAuthorizeEdit(ADMIN_MODULE), adminUserController.getEditAdmin);
router.post('/admins/edit/:id', dynamicAuthorizeEdit(ADMIN_MODULE), adminUserController.postEditAdmin);
router.get('/admins/status/:id', dynamicAuthorizeEdit(ADMIN_MODULE), adminUserController.toggleAdminStatus);
router.get('/admins/delete/:id', superAdminOnly, adminUserController.getDeleteAdmin); // Delete Super Admin only

module.exports = router;