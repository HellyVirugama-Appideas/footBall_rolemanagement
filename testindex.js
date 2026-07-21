const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://gennaro:OqT19Tw9qxOqtcwu@cluster0.ihqjnk1.mongodb.net/footballrecruitment?retryWrites=true&w=majority';
// Atlas use kar rahi ho to apna Atlas connection string yaha daalo

async function findDuplicateNames() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log('MongoDB Connected');

    const users = await mongoose.connection.db
      .collection('cvuploads')
      .aggregate([
        {
          $group: {
            _id: '$name',
            count: { $sum: 1 },
            users: { $push: '$$ROOT' }
          }
        },
        {
          $match: {
            count: { $gt: 1 }
          }
        }
      ])
      .toArray();

    console.log(JSON.stringify(users, null, 2));

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

findDuplicateNames();