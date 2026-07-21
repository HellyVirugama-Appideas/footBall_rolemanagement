const Role = require('../../models/roleModel');
const Admin = require('../../models/adminModel');
const modules = require('../../config/modules');

// Build permissions from form checkboxes
function buildPermissions(body) {
  return modules.map((m) => ({
    module: m.key,
    view: body[`perm_${m.key}_view`] === 'on',
    add: body[`perm_${m.key}_add`] === 'on',
    edit: body[`perm_${m.key}_edit`] === 'on',
    delete: m.countryScoped ? false : (body[`perm_${m.key}_delete`] === 'on'),
  }));
}

exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort('-createdAt');
    res.render('role', { roles });
  } catch (error) {
    req.flash('red', error.message);
    res.redirect('/');
  }
};

exports.getAddRole = (req, res) => {
  try {
    const modules = require('../../config/modules');
    
    // console.log("Modules Loaded:", modules.length); // Debug ke liye

    if (!modules || modules.length === 0) {
      req.flash('red', 'No modules found in config!');
    }

    res.render('role_add', { 
      modules: modules || [],
      title: 'Add Role'
    });
  } catch (error) {
    console.error("Modules Error:", error);
    req.flash('red', 'Error loading modules configuration');
    res.redirect('/roles');
  }
};

exports.postAddRole = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      req.flash('red', 'Role name is required.');
      return res.redirect('/roles/add');
    }

    await Role.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      permissions: buildPermissions(req.body),
      createdBy: req.admin.id,
      status: 'active'
    });

    req.flash('green', 'Role created successfully.');
    res.redirect('/roles');
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      req.flash('red', 'A role with this name already exists.');
    } else if (error.name === 'ValidationError') {
      Object.keys(error.errors).forEach(key => req.flash('red', error.errors[key].message));
    } else {
      req.flash('red', error.message);
    }
    res.redirect('/roles/add');
  }
};

exports.getEditRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      req.flash('red', 'Role not found!');
      return res.redirect('/roles');
    }

    // Merge current permissions for checkbox state
    const permMap = {};
    role.permissions.forEach((p) => (permMap[p.module] = p));

    const modulesWithPerms = modules.map((m) => ({
      ...m,
      perm: permMap[m.key] || { view: false, add: false, edit: false, delete: false },
    }));

    res.render('role_edit', { role, modules: modulesWithPerms });
  } catch (error) {
    console.error(error);
    if (error.name === 'CastError') req.flash('red', 'Role not found!');
    else req.flash('red', error.message);
    res.redirect('/roles');
  }
};

exports.postEditRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      req.flash('red', 'Role not found!');
      return res.redirect('/roles');
    }

    if (role.isSystem) {
      req.flash('red', 'System roles cannot be edited.');
      return res.redirect('/roles');
    }

    const { name, description } = req.body;

    role.name = name.trim();
    role.description = description ? description.trim() : '';
    role.permissions = buildPermissions(req.body);

    await role.save();

    req.flash('green', 'Role updated successfully.');
    res.redirect('/roles');
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      req.flash('red', 'A role with this name already exists.');
    } else {
      req.flash('red', error.message);
    }
    res.redirect(`/roles/edit/${req.params.id}`);
  }
};

exports.getDeleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      req.flash('red', 'Role not found!');
      return res.redirect('/roles');
    }

    if (role.isSystem) {
      req.flash('red', 'System roles cannot be deleted.');
      return res.redirect('/roles');
    }

    const inUse = await Admin.countDocuments({ role: req.params.id });
    if (inUse > 0) {
      req.flash('red', `Cannot delete: ${inUse} admin(s) are using this role.`);
      return res.redirect('/roles');
    }

    await Role.findByIdAndDelete(req.params.id);
    req.flash('green', 'Role deleted successfully.');
    res.redirect('/roles');
  } catch (error) {
    console.error(error);
    if (error.name === 'CastError') req.flash('red', 'Role not found!');
    else req.flash('red', error.message);
    res.redirect('/roles');
  }
};

exports.toggleRoleStatus = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      req.flash('red', 'Role not found!');
      return res.redirect('/roles');
    }

    if (role.isSystem) {
      req.flash('red', 'System roles status cannot be changed.');
      return res.redirect('/roles');
    }

    role.status = role.status === 'active' ? 'inactive' : 'active';
    await role.save();

    req.flash('green', `Role ${role.status === 'active' ? 'activated' : 'deactivated'} successfully.`);
    res.redirect('/roles');
  } catch (error) {
    console.error(error);
    req.flash('red', error.message);
    res.redirect('/roles');
  }
};