const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const approvedMiddleware = require('../middleware/approvedMiddleware');
const Task = require('../models/Task');
const User = require('../models/User');
const sendNotification = require('../utils/sendNotification');

const router = express.Router();

router.use(authMiddleware);
router.use(approvedMiddleware);

router.post('/', async (req, res) => {
  try {
    const { title, assignedTo, isPriority = false } = req.body;

    if (!title || !assignedTo) {
      return res.status(400).json({ message: 'title and assignedTo are required' });
    }

    if (!req.user.familyId) {
      return res.status(400).json({ message: 'User is not linked to a family' });
    }

    const assignee = await User.findOne({
      _id: assignedTo,
      familyId: req.user.familyId,
      isApproved: true
    });

    if (!assignee) {
      return res.status(404).json({ message: 'Assignee not found in approved family members' });
    }

    const task = await Task.create({
      title,
      familyId: req.user.familyId,
      assignedBy: req.user._id,
      assignedTo,
      isPriority
    });

    const populatedTask = await task.populate([
      { path: 'assignedBy', select: 'name' },
      { path: 'assignedTo', select: 'name' }
    ]);

    if (isPriority) {
      await sendNotification({
        token: assignee.fcmToken,
        title: 'High Priority Task Assigned',
        body: `"${task.title}" was assigned to you as high priority.`
      });
    }

    return res.status(201).json({ task: populatedTask });
  } catch (error) {
    return res.status(500).json({ message: 'Task creation failed', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    if (!req.user.familyId) {
      return res.json({ tasks: [] });
    }

    const tasks = await Task.find({ familyId: req.user.familyId })
      .sort({ createdAt: -1 })
      .populate('assignedBy', 'name')
      .populate('assignedTo', 'name');

    return res.json({ tasks });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
});

router.put('/:id/complete', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      familyId: req.user.familyId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only assignee can mark as complete' });
    }

    task.status = 'Completed';
    await task.save();

    const assigner = await User.findById(task.assignedBy);
    await sendNotification({
      token: assigner?.fcmToken,
      title: 'Task Completed',
      body: `Your assigned task "${task.title}" was marked Completed.`
    });

    const populatedTask = await task.populate([
      { path: 'assignedBy', select: 'name' },
      { path: 'assignedTo', select: 'name' }
    ]);

    return res.json({ task: populatedTask });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to complete task', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      familyId: req.user.familyId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.assignedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only assigner can delete task' });
    }

    await task.deleteOne();
    return res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
});

module.exports = router;
