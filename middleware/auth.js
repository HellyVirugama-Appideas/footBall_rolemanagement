const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
const modules = require('../config/modules');

/**
 * Populates req.admin (with role populated) and a handful of res.locals
 * helpers used both in controllers and directly inside EJS views:
 *
 *   res.locals.can(moduleKey, action)   -> boolean
 *   res.locals.isSuperAdmin             -> boolean
 *   res.locals.visibleModules           -> modules[] this admin can view (sidebar)
 *
 * Must run AFTER the public auth routes (/login, /forgot, /reset) so it
 * never blocks the login page itself.
 */
// exports.authenticate = async (req, res, next) => {
//   try {
//     const token = req.cookies['jwtAdmin'];
//     if (!token) {
//       req.flash('red', 'Please login as admin first!');
//       return res.redirect('/login');
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const admin = await Admin.findById(decoded._id).populate('role');

//     if (!admin) {
//       req.flash('red', 'Please login as admin first!');
//       return res.redirect('/login');
//     }

//     if (admin.status === 'inactive') {
//       res.clearCookie('jwtAdmin');
//       req.flash('red', 'Your account has been deactivated. Please contact the Super Admin.');
//       return res.redirect('/login');
//     }

//     req.admin = admin;
//     res.locals.photo = admin.photo;
//     res.locals.currentAdmin = admin;
//     res.locals.isSuperAdmin = !!admin.isSuperAdmin;

//     res.locals.can = (moduleKey, action = 'view') => {
//       if (admin.isSuperAdmin) return true;
//       if (!admin.role || admin.role.status !== 'active') return false;
//       return typeof admin.role.can === 'function'
//         ? admin.role.can(moduleKey, action)
//         : false;
//     };

//     res.locals.visibleModules = modules.filter((m) => res.locals.can(m.key, 'view'));

//     next();
//   } catch (error) {
//     if (error.message === 'invalid signature')
//       req.flash('red', 'Invalid token! Please login again.');
//     else req.flash('red', error.message);
//     res.redirect('/login');
//   }
// };

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.cookies['jwtAdmin'];
    if (!token) {
      req.flash('red', 'Please login as admin first!');
      return res.redirect('/login');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ←←← Yeh line important hai
    const admin = await Admin.findById(decoded._id).populate({
      path: 'role',
      select: 'name permissions status'
    });

    if (!admin) {
      req.flash('red', 'Please login as admin first!');
      return res.redirect('/login');
    }

    if (admin.status === 'inactive') {
      res.clearCookie('jwtAdmin');
      req.flash('red', 'Your account has been deactivated.');
      return res.redirect('/login');
    }

    req.admin = admin;
    res.locals.photo = admin.photo;
    res.locals.currentAdmin = admin;
    res.locals.isSuperAdmin = !!admin.isSuperAdmin;

    // Can function
    res.locals.can = (moduleKey, action = 'view') => {
      if (admin.isSuperAdmin) return true;
      if (!admin.role || admin.role.status !== 'active') return false;

      const perm = admin.role.permissions.find(p => p.module === moduleKey);
      return perm ? !!perm[action] : false;
    };

    next();
  } catch (error) {
    console.error(error);
    req.flash('red', 'Session expired. Please login again.');
    res.redirect('/login');
  }
};

/**
 * Route-level permission gate. Super Admin always passes.
 * Usage: router.get('/roles', authorize('roles', 'view'), ctrl.list)
 */
exports.authorize = (moduleKey, action = 'view') => {
  return (req, res, next) => {
    if (!req.admin) {
      req.flash('red', 'Please login first.');
      return res.redirect('/login');
    }

    if (req.admin.isSuperAdmin) return next();

    if (!req.admin.role || req.admin.role.status !== 'active') {
      req.flash('red', "You don't have permission to access that.");
      return res.redirect('/');
    }

    const perm = req.admin.role.permissions.find(p => p.module === moduleKey);
    
    if (perm && perm[action] === true) {
      return next();
    }

    req.flash('red', "You don't have permission to access that.");
    return res.redirect('/');
  };
};

/**
 * Hard business rule: Delete & Export (bulk) are Super-Admin-only, no
 * matter what a role's permissions say. Use this in addition to (not
 * instead of) authorize() on delete/export routes for candidates & CVs.
 */
exports.superAdminOnly = (req, res, next) => {
  if (req.admin && req.admin.isSuperAdmin) return next();
  req.flash('red', 'Only the Super Admin can delete or export records.');
  return res.redirect(req.get('Referrer') || '/');
};

/**
 * Builds a Mongo filter object that restricts a query to the countries a
 * Sub Admin has been assigned. Super Admins get no restriction ({}).
 * A Sub Admin with no assigned countries sees nothing (safe default),
 * rather than accidentally seeing everything.
 */
exports.countryFilter = (req, field = 'country') => {
  if (!req.admin || req.admin.isSuperAdmin) return {};
  const countries = (req.admin.assignedCountries || []).filter(Boolean);
  if (countries.length === 0) return { _id: null };
  const regexes = countries.map((c) => new RegExp(`^${escapeRegex(c.trim())}$`, 'i'));
  return { [field]: { $in: regexes } };
};

/**
 * Returns true if this admin is allowed to see/act on a record belonging
 * to the given country. Super Admin -> always true.
 */
exports.canAccessCountry = (req, country) => {
  if (!req.admin || req.admin.isSuperAdmin) return true;
  const list = (req.admin.assignedCountries || []).map((c) => c.trim().toLowerCase());
  return list.includes((country || '').trim().toLowerCase());
};

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
