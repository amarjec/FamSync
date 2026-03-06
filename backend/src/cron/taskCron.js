const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const sendNotification = require('../utils/sendNotification');

const startTaskCronJobs = () => {
  cron.schedule('0 20 * * *', async () => {
    try {
      const pendingTasks = await Task.find({ status: 'Pending' }).select('assignedTo');
      const grouped = pendingTasks.reduce((acc, task) => {
        const userId = task.assignedTo.toString();
        acc[userId] = (acc[userId] || 0) + 1;
        return acc;
      }, {});

      const userIds = Object.keys(grouped);
      if (userIds.length === 0) {
        return;
      }

      const users = await User.find({ _id: { $in: userIds } }).select('fcmToken');

      await Promise.all(
        users.map((user) =>
          sendNotification({
            token: user.fcmToken,
            title: 'Daily Pending Task Reminder',
            body: `You have ${grouped[user._id.toString()]} pending task(s).`
          })
        )
      );

      console.log('20:00 pending reminders sent');
    } catch (error) {
      console.error('20:00 reminder cron failed:', error.message);
    }
  });

  cron.schedule('0 2 * * *', async () => {
    try {
      const result = await Task.deleteMany({ status: 'Completed' });
      console.log(`02:00 cleanup completed. Deleted ${result.deletedCount} completed task(s).`);
    } catch (error) {
      console.error('02:00 cleanup cron failed:', error.message);
    }
  });

  console.log('Task cron jobs initialized');
};

module.exports = startTaskCronJobs;
