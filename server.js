// require('dotenv').config();
// const mongoose = require('mongoose');

// process.on('uncaughtException', (err) => {
//   console.log(err);
//   console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
//   process.exit(1);
// });

// // dotenv.config();
// const app = require('./app');

// const DB = process.env.DATABASE.replace(
//   '<password>',
//   process.env.DATABASE_PASSWORD
// );

// mongoose.set('strictQuery', false);
// mongoose
//   .connect(DB, { useNewUrlParser: true })
//   .then(() => console.log('DB connection successful!'));

// const port = process.env.PORT || 5000;
// const server = app.listen(port, () => {
//   console.log(`App running on port ${port}...`);
// });

// process.on('unhandledRejection', (err) => {
//   console.log('UNHANDLED REJECTION! 💥 Shutting down...');
//   console.log(err);
//   server.close(() => {
//     process.exit(1);
//   });
// });

// // process.on('SIGTERM', () => {

// //     console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
// //     server.close(() => {
// //         console.log('💥 Process terminated!');
// //     });
// // });


require('dotenv').config();
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log(err);
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  process.exit(1);
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose.set('strictQuery', false);

mongoose
  .connect(DB)
  .then(async () => {
    console.log('DB connection successful!');
    try {
      const Admin = require('./models/adminModel');
      // One-time migration: any admin created BEFORE this RBAC feature
      // (no role, no createdBy, not already flagged) is a legacy account —
      // promote it to Super Admin so nobody gets locked out after upgrade.
      const result = await Admin.updateMany(
        { isSuperAdmin: { $ne: true }, role: null, createdBy: null },
        { $set: { isSuperAdmin: true, status: 'active' } }
      );
      if (result.modifiedCount > 0) {
        console.log(`RBAC migration: promoted ${result.modifiedCount} legacy admin(s) to Super Admin.`);
      }
    } catch (migrationErr) {
      console.log('RBAC migration skipped/failed:', migrationErr.message);
    }
  })
  .catch((err) => {
    console.log(err);
  });

const port = process.env.PORT || 7000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err);

  server.close(() => {
    process.exit(1);
  });
});