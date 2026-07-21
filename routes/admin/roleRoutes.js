const router = require('express').Router();
const roleController = require('../../controllers/admin/roleController');
const { authorize } = require('../../middleware/auth');

router.get('/roles', authorize('roles', 'view'), roleController.getRoles);
router.get('/roles/add', authorize('roles', 'add'), roleController.getAddRole);
router.post('/roles/add', authorize('roles', 'add'), roleController.postAddRole);
router.get('/roles/edit/:id', authorize('roles', 'edit'), roleController.getEditRole);
router.post('/roles/edit/:id', authorize('roles', 'edit'), roleController.postEditRole);
router.get('/roles/status/:id', authorize('roles', 'edit'), roleController.toggleRoleStatus);
router.get('/roles/delete/:id', authorize('roles', 'delete'), roleController.getDeleteRole);

module.exports = router;
