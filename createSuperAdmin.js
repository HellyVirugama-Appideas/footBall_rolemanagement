/**
 * One-off CLI script to create a Super Admin account.
 *
 * Usage:
 *   node createSuperAdmin.js "Full Name" "email@example.com" "password123"
 *
 * Notes:
 *   - If you already had an admin account before this RBAC update, you
 *     don't need this — server.js automatically promotes any pre-existing
 *     admin (no role, no createdBy) to Super Admin on first boot.
 *   - Use this only for a brand new database, or to add an additional
 *     Super Admin.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/adminModel');

async function run() {
  const [, , name, email, password] = process.argv;

  if (!name || !email || !password) {
    console.log('Usage: node createSuperAdmin.js "Full Name" "email@example.com" "password123"');
    process.exit(1);
  }

  const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);
  await mongoose.connect(DB);

  const existing = await Admin.findOne({ email });
  if (existing) {
    existing.isSuperAdmin = true;
    existing.status = 'active';
    await existing.save({ validateModifiedOnly: true });
    console.log(`Existing admin "${email}" promoted to Super Admin.`);
  } else {
    await Admin.create({
      name,
      email,
      password,
      passwordConfirm: password,
      isSuperAdmin: true,
      status: 'active',
    });
    console.log(`Super Admin "${email}" created successfully.`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Failed to create Super Admin:', err.message);
  process.exit(1);
});
