// // middleware/permission.js
// const { authorize } = require('./auth'); // apna purana auth file

// /**
//  * Dynamic Route Permission
//  * Example: router.get('/user', dynamicAuthorize('users'), controller);
//  */
// exports.dynamicAuthorize = (moduleKey) => {
//   return (req, res, next) => {
//     // Agar Super Admin hai toh full access
//     if (req.admin && req.admin.isSuperAdmin) return next();

//     // Normal role check
//     return authorize(moduleKey, 'view')(req, res, next);
//   };
// };

// /**
//  * Edit permission ke liye
//  */
// exports.dynamicAuthorizeEdit = (moduleKey) => {
//   return (req, res, next) => {
//     if (req.admin && req.admin.isSuperAdmin) return next();
//     return authorize(moduleKey, 'edit')(req, res, next);
//   };
// };

// /**
//  * Add permission ke liye
//  */
// exports.dynamicAuthorizeAdd = (moduleKey) => {
//   return (req, res, next) => {
//     if (req.admin && req.admin.isSuperAdmin) return next();
//     return authorize(moduleKey, 'add')(req, res, next);
//   };
// };

const { authorize } = require('./auth');

exports.dynamicAuthorize = (moduleKey) => {
  return (req, res, next) => {
    if (req.admin?.isSuperAdmin) return next();
    if (!req.admin?.role) {
      req.flash('red', "You don't have permission.");
      return res.redirect('/');
    }
    return authorize(moduleKey, 'view')(req, res, next);
  };
};

exports.dynamicAuthorizeAdd = (moduleKey) => {
  return (req, res, next) => {
    if (req.admin?.isSuperAdmin) return next();
    if (!req.admin?.role) {
      req.flash('red', "You don't have permission.");
      return res.redirect('/');
    }
    return authorize(moduleKey, 'add')(req, res, next);
  };
};

exports.dynamicAuthorizeEdit = (moduleKey) => {
  return (req, res, next) => {
    if (req.admin?.isSuperAdmin) return next();
    if (!req.admin?.role) {
      req.flash('red', "You don't have permission.");
      return res.redirect('/');
    }
    return authorize(moduleKey, 'edit')(req, res, next);
  };
};