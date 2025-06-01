import cron from 'node-cron';
import Reminder from '../models/Reminder.js';
import admin from '../utils/firebase.js'; // Your initialized firebase-admin
import User from '../models/UserModel.js'; // Assuming user has a `fcmToken` field

// Run every minute
cron.schedule('* * * * *', async () => {
  const now = new Date();
  const roundedNow = new Date(Math.floor(now.getTime() / 60000) * 60000); // rounded to minute

  try {
    const reminders = await Reminder.find({
      isDeleted: false,
      status: 'active',
      'notificationPreferences.push': true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      time: {
        $lte: new Date(roundedNow.getTime() + 60000), // within next minute
        $gte: new Date(roundedNow.getTime() - 60000), // within previous minute
      }
    }).populate('user');

    for (const reminder of reminders) {
      const user = reminder.user;
      if (!user || !user.fcm_token) continue;

      const message = {
        notification: {
          title: `Time to take ${reminder.product}`,
          body: reminder.description || 'Reminder for your medicine.',
        },
        token: user.fcm_token
      };

      try {
        const response = await admin.messaging().send(message);
        console.log(`✅ Sent to ${user._id}: ${response}`);
      } catch (err) {
        console.error(`❌ Failed for ${user._id}:`, err);
      }
    }
  } catch (err) {
    console.error("🔁 Cron job error:", err);
  }
});
