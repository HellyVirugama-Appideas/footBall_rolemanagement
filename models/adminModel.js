// const mongoose = require('mongoose');
// const validator = require('validator');
// const createError = require('http-errors');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// const adminSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     trim: true,
//   },
//   email: {
//     type: String,
//     required: [true, 'Please provide your email.'],
//     unique: true,
//     lowercase: true,
//     validate: [validator.isEmail, 'Please provide a valid email.'],
//   },
//   photo: {
//     type: String,
//     default: '/uploads/default_user.jpg',
//   },
//   password: {
//     type: String,
//     required: [true, 'Please provide a password.'],
//     minlength: [8, 'Password should be minimum 8 characters long.'],
//   },
//   passwordConfirm: {
//     type: String,
//     required: [true, 'Please confirm your password.'],
//     validate: {
//       // This only works on CREATE and SAVE!!!
//       validator: function (el) {
//         return el === this.password;
//       },
//       message: 'New password and confirm password do not match!',
//     },
//   },
//   // ── RBAC fields ──
//   // The very first/original admin(s) in the system remain Super Admins with
//   // full, unrestricted access (including Delete & Export). Everyone else is
//   // a Sub Admin created by a Super Admin, bound to a Role + (optionally)
//   // specific countries.
//   isSuperAdmin: {
//     type: Boolean,
//     default: false,
//   },
//   role: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Role',
//     default: null,
//   },
//   // Countries this Sub Admin is allowed to see candidate/CV data for.
//   // Empty array = no restriction applied is NOT assumed; a Sub Admin with an
//   // empty list simply sees no candidates until assigned. Super Admins ignore
//   // this field entirely.
//   assignedCountries: {
//     type: [String],
//     default: [],
//   },
//   status: {
//     type: String,
//     enum: ['active', 'inactive'],
//     default: 'active',
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Admin',
//     default: null,
//   },
// });

// // Generate auth token
// adminSchema.methods.generateAuthToken = async function () {
//   try {
//     return jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET, {
//       expiresIn: '90d',
//     });
//   } catch (error) {
//     throw createError.BadRequest(error);
//   }
// };

// adminSchema.pre('save', async function (next) {
//   // Only run this function if password was actually modified
//   if (!this.isModified('password')) return next();

//  try {
//     this.password = await bcrypt.hash(this.password, 12);
//     this.passwordConfirm = undefined;
//     next();
//   } catch (err) {
//     next(err);   // ← Yeh line important hai
//   }
// });

// adminSchema.methods.correctPassword = async function (
//   candidatePassword,
//   adminPassword
// ) {
//   return await bcrypt.compare(candidatePassword, adminPassword);
// };

// module.exports = new mongoose.model('Admin', adminSchema);
const mongoose = require('mongoose');
const validator = require('validator');
const createError = require('http-errors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: {
    type: String,
    required: [true, 'Please provide your email.'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email.'],
  },
  photo: { type: String, default: '/uploads/default_user.jpg' },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    minlength: [8, 'Password should be minimum 8 characters long.'],
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password.'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'New password and confirm password do not match!',
    },
  },
  isSuperAdmin: { type: Boolean, default: false },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', default: null },
  assignedCountries: { type: [String], default: [] },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
});

// Generate auth token
adminSchema.methods.generateAuthToken = async function () {
  try {
    return jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: '90d',
    });
  } catch (error) {
    throw createError.BadRequest(error);
  }
};

// ✅ Fixed Pre-Save Hook
adminSchema.pre('save', async function () {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return;

  try {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
  } catch (err) {
    throw err;   // Mongoose will catch this
  }
});

adminSchema.methods.correctPassword = async function (candidatePassword, adminPassword) {
  return await bcrypt.compare(candidatePassword, adminPassword);
};

module.exports = mongoose.model('Admin', adminSchema);