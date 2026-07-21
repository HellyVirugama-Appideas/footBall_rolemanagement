const mongoose = require('mongoose');

/**
 * Permission sub-document — one entry per module.
 * view/add/edit/delete flags control what a role can do on that module.
 */
const permissionSchema = new mongoose.Schema(
  {
    module: { type: String, required: true }, // module key, see config/modules.js
    view: { type: Boolean, default: false },
    add: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  { _id: false }
);

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a role name.'],
      trim: true,
      unique: true,
    },
    description: { type: String, trim: true, default: '' },
    permissions: [permissionSchema],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    // Super Admin's own implicit role is not stored here; this flags
    // system-protected roles that should not be deleted (none by default,
    // reserved for future use).
    isSystem: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

// Helper: does this role have a given permission on a module?
roleSchema.methods.can = function (moduleKey, action) {
  const perm = this.permissions.find((p) => p.module === moduleKey);
  if (!perm) return false;
  return !!perm[action];
};

module.exports = mongoose.model('Role', roleSchema);
