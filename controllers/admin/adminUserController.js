const Admin = require('../../models/adminModel');
const Role = require('../../models/roleModel');

exports.getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().populate('role').sort('-_id');
    res.render('admin_user', { admins });
  } catch (error) {
    req.flash('red', error.message);
    res.redirect('/');
  }
};

exports.getAddAdmin = async (req, res) => {
  try {
    const roles = await Role.find({ status: 'active' }).sort('name');
    
    console.log("Active Roles:", roles.length); // Debug

    res.render('admin_user_add', { 
      roles,
      isSuperAdmin: req.admin.isSuperAdmin 
    });
  } catch (error) {
    console.error(error);
    req.flash('red', error.message);
    res.redirect('/admins');
  }
};

exports.postAddAdmin = async (req, res) => {
  try {
    const { name, email, password, passwordConfirm, role, countries, status, isSuperAdmin } = req.body;

    // Only Super Admin can create Super Admin
    const makeSuperAdmin = (isSuperAdmin === 'on' || isSuperAdmin === true) && req.admin.isSuperAdmin;

    const assignedCountries = (countries || '')
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    if (!makeSuperAdmin && !role) {
      req.flash('red', 'Please select a role for this Sub Admin.');
      return res.redirect('/admins/add');
    }

    await Admin.create({
      name,
      email,
      password,
      passwordConfirm,
      isSuperAdmin: makeSuperAdmin,
      role: makeSuperAdmin ? null : role,
      assignedCountries: makeSuperAdmin ? [] : assignedCountries,
      status: status === 'inactive' ? 'inactive' : 'active',
      createdBy: req.admin.id,
    });

    req.flash('green', 'Admin user created successfully.');
    res.redirect('/admins');

  } catch (error) {
    console.error(error);   // ← Yeh line add karo debug ke liye

    if (error.name === 'ValidationError') {
      Object.keys(error.errors).forEach((key) => req.flash('red', error.errors[key].message));
    } else if (error.code === 11000) {
      req.flash('red', 'An admin with this email already exists.');
    } else {
      req.flash('red', error.message || 'Something went wrong');
    }
    res.redirect('/admins/add');
  }
};

exports.getEditAdmin = async (req, res) => {
  try {
    const [admin, roles] = await Promise.all([
      Admin.findById(req.params.id),
      Role.find({ status: 'active' }).sort('name'),
    ]);
    if (!admin) {
      req.flash('red', 'Admin not found!');
      return res.redirect('/admins');
    }
    res.render('admin_user_edit', { editAdmin: admin, roles });
  } catch (error) {
    if (error.name === 'CastError') req.flash('red', 'Admin not found!');
    else req.flash('red', error.message);
    res.redirect('/admins');
  }
};

exports.postEditAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      req.flash('red', 'Admin not found!');
      return res.redirect('/admins');
    }

    // A Sub Admin (even one with "admins" edit permission) may never edit
    // a Super Admin account.
    if (admin.isSuperAdmin && !req.admin.isSuperAdmin) {
      req.flash('red', 'Only a Super Admin can edit another Super Admin.');
      return res.redirect('/admins');
    }

    const { name, email, role, countries, status, password, passwordConfirm } = req.body;

    const updateFields = {
      name,
      email,
      status: status === 'inactive' ? 'inactive' : 'active',
    };

    if (!admin.isSuperAdmin) {
      updateFields.role = role || null;
      updateFields.assignedCountries = (countries || '')
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
    }

    // Update basic fields first (runValidators only checks the fields we're
    // actually setting, so it's safe even though passwordConfirm isn't
    // persisted on this document).
    await Admin.findByIdAndUpdate(admin._id, updateFields, {
      runValidators: true,
      context: 'query',
    });

    // Password change goes through .save() separately so the pre-save hash
    // hook fires correctly.
    if (password) {
      const freshAdmin = await Admin.findById(admin._id);
      freshAdmin.password = password;
      freshAdmin.passwordConfirm = passwordConfirm;
      await freshAdmin.save();
    }

    req.flash('green', 'Admin user updated successfully.');
    res.redirect('/admins');
  } catch (error) {
    if (error.name === 'ValidationError') {
      Object.keys(error.errors).forEach((key) => req.flash('red', error.errors[key].message));
    } else {
      req.flash('red', error.message);
    }
    res.redirect(`/admins/edit/${req.params.id}`);
  }
};

exports.getDeleteAdmin = async (req, res) => {
  try {
    if (req.params.id === req.admin.id.toString()) {
      req.flash('red', 'You cannot delete your own account.');
      return res.redirect('/admins');
    }

    const target = await Admin.findById(req.params.id);
    if (!target) {
      req.flash('red', 'Admin not found!');
      return res.redirect('/admins');
    }

    if (target.isSuperAdmin && !req.admin.isSuperAdmin) {
      req.flash('red', 'Only a Super Admin can delete another Super Admin.');
      return res.redirect('/admins');
    }

    if (target.isSuperAdmin) {
      const superAdminCount = await Admin.countDocuments({ isSuperAdmin: true });
      if (superAdminCount <= 1) {
        req.flash('red', 'Cannot delete the last remaining Super Admin.');
        return res.redirect('/admins');
      }
    }

    await Admin.findByIdAndDelete(req.params.id);
    req.flash('green', 'Admin user deleted successfully.');
    res.redirect('/admins');
  } catch (error) {
    if (error.name === 'CastError') req.flash('red', 'Admin not found!');
    else req.flash('red', error.message);
    res.redirect('/admins');
  }
};

exports.toggleAdminStatus = async (req, res) => {
  try {
    if (req.params.id === req.admin.id.toString()) {
      req.flash('red', 'You cannot deactivate your own account.');
      return res.redirect('/admins');
    }

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      req.flash('red', 'Admin not found!');
      return res.redirect('/admins');
    }

    if (admin.isSuperAdmin && !req.admin.isSuperAdmin) {
      req.flash('red', 'Only a Super Admin can change another Super Admin.');
      return res.redirect('/admins');
    }

    admin.status = admin.status === 'active' ? 'inactive' : 'active';
    await admin.save();

    req.flash('green', `Admin ${admin.status === 'active' ? 'activated' : 'deactivated'} successfully.`);
    res.redirect('/admins');
  } catch (error) {
    req.flash('red', error.message);
    res.redirect('/admins');
  }
};
