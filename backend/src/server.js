const dotenv = require('dotenv');
const app = require('./app');
const connectDB = require('./config/db');
const startTaskCronJobs = require('./cron/taskCron');
const initializeFirebase = require('./config/firebase');

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  initializeFirebase();
  startTaskCronJobs();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
