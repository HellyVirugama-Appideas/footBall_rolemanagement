const router = require('express').Router();

const categoryController = require('../../controllers/admin/categoryController');
const { authorize } = require('../../middleware/auth');

const M = 'categories';

router.use('/category', authorize(M, 'view'));

router.get('/category', categoryController.getCategories);
router
  .route('/category/add')
  .get(authorize(M, 'add'), categoryController.getAddCategory)
  .post(authorize(M, 'add'), categoryController.postAddCategory);
router
  .route('/category/edit/:id')
  .get(authorize(M, 'edit'), categoryController.getEditCategory)
  .post(authorize(M, 'edit'), categoryController.postEditCategory);
router.get('/category/delete/:id', authorize(M, 'delete'), categoryController.getDeleteCategory);

module.exports = router;
