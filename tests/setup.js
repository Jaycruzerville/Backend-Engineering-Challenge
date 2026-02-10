const mongoose = require('mongoose');

// Use a dedicated test database to avoid affecting development data
const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/onehaven_test';

beforeAll(async () => {
  try {
      // Ensure we are disconnected from any previous instances
      await mongoose.disconnect();
      
      await mongoose.connect(TEST_DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
  } catch (err) {
      console.error('Failed to connect to Test Database', err);
      process.exit(1);
  }
});

// Clear all data after every test
afterEach(async () => {
  if (mongoose.connection.readyState !== 1) return;
  
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Disconnect after all tests
afterAll(async () => {
  await mongoose.disconnect();
});
