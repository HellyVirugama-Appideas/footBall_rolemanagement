// const router = require('express').Router();

// const userController = require('../../controllers/admin/userController');
// const uploadController = require('../../controllers/admin/uploadController');
// const { authorize, superAdminOnly } = require('../../middleware/auth');

// const {csvUploader} = require("../../controllers/admin/userController")

// const M = 'candidates'; // "User Management" module

// // ── Bulk Export / Bulk Download — Super Admin ONLY, no exceptions ──
// router.post('/user/export', superAdminOnly, userController.exportUsers);
// router.get('/user/download-all-cvs', superAdminOnly, userController.downloadAllCVs);
// router.post('/user/download-selected-cvs', superAdminOnly, userController.downloadSelectedCVs);

// // user (candidate database) — view/edit allowed per role + country scope,
// // delete is Super Admin only regardless of role permissions.
// router.get('/user', authorize(M, 'view'), userController.getAllUsers);
// router.get('/user/edit/:id', authorize(M, 'edit'), userController.getEditUser);
// router.post('/user/edit/:id', authorize(M, 'edit'), userController.postEditUser);
// router.get('/user/delete/:id', superAdminOnly, userController.getDeleteUser);
// router.get('/user/:id', authorize(M, 'view'), userController.viewUser);

// // GET - Uploads Page (404 fix ke liye)
// router.get('/uploads', authorize('cvUpload', 'view'), (req, res) => {
//     res.render('uploads', { 
//         url: '/uploads'     // ye sidenav ke active class ke liye zaroori hai
//     });
// });

// router.post('/bulk-cv-upload',
//   authorize('cvUpload', 'add'),
//   uploadController.bulkCVUpload,
//   uploadController.processBulkCV
// );

// // message
// router.get('/message', authorize('messages', 'view'), userController.getAllMessages);
// router.get('/message_view/:id', authorize('messages', 'view'), userController.viewMessages);
// router.get('/message/delete/:id', authorize('messages', 'delete'), userController.getDeleteMessages);

// router.post('/user/import-csv', authorize(M, 'add'), csvUploader, userController.importUsersFromCSV);




// module.exports = router;



const router = require('express').Router();

const userController = require('../../controllers/admin/userController');
const uploadController = require('../../controllers/admin/uploadController');
const { superAdminOnly } = require('../../middleware/auth');
const {
    dynamicAuthorize,
    dynamicAuthorizeEdit,
    dynamicAuthorizeAdd
} = require('../../middleware/permission');

const { csvUploader } = require("../../controllers/admin/userController")

const USER_MODULE = 'users';

// Bulk Actions - Super Admin Only
router.post('/user/export', superAdminOnly, userController.exportUsers);
router.get('/user/download-all-cvs', superAdminOnly, userController.downloadAllCVs);
router.post('/user/download-selected-cvs', superAdminOnly, userController.downloadSelectedCVs);

// User Management Routes (Dynamic)
router.get('/user', dynamicAuthorize(USER_MODULE), userController.getAllUsers);
router.get('/user/edit/:id', dynamicAuthorizeEdit(USER_MODULE), userController.getEditUser);
router.post('/user/edit/:id', dynamicAuthorizeEdit(USER_MODULE), userController.postEditUser);
router.get('/user/delete/:id', superAdminOnly, userController.getDeleteUser);
router.get('/user/:id', dynamicAuthorize(USER_MODULE), userController.viewUser);

// CV Upload
router.get('/uploads', dynamicAuthorize('cvUpload'), (req, res) => {
    res.render('uploads', { url: '/uploads' });
});

router.post('/bulk-cv-upload', dynamicAuthorizeAdd('cvUpload'),
    dynamicAuthorizeAdd('cvUpload'),
    uploadController.bulkCVUpload,
    uploadController.processBulkCV
);

// Messages
router.get('/message', dynamicAuthorize('messages'), userController.getAllMessages);
router.get('/message_view/:id', dynamicAuthorize('messages'), userController.viewMessages);
router.get('/message/delete/:id', dynamicAuthorize('messages'), userController.getDeleteMessages); // agar delete permission dena ho

// CSV Import
router.post('/user/import-csv', dynamicAuthorizeAdd(USER_MODULE), csvUploader, userController.importUsersFromCSV);

module.exports = router;