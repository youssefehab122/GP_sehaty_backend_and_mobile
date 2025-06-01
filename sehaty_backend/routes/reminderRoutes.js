import express from 'express';
import {
  createReminder,
  getUserReminders,
  getReminder,
  updateReminder,
  deleteReminder,
  markReminderAsTaken,
  getRemindersByDate
} from '../controllers/reminderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create a new reminder
router.post('/', createReminder);

// Get all reminders for the authenticated user
router.get('/', getUserReminders);

// Get reminders for a specific date
router.get('/date/:date', getRemindersByDate);

// Get a single reminder
router.get('/:id', getReminder);

// Update a reminder
router.put('/:id', updateReminder);

// Delete a reminder
router.delete('/:id', deleteReminder);

// Mark reminder as taken
router.post('/:id/mark-taken', markReminderAsTaken);

export default router;