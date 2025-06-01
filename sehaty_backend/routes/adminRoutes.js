import express from 'express';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import session from 'express-session';
import adminOptions from '../config/admin.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create admin instance
const admin = new AdminJS(adminOptions);

// Create admin router with authentication
const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  admin,
  {
    authenticate: async (email, password) => {
      // Find admin user
      const user = await User.findOne({ email, role: 'admin' });
      if (!user) return false;

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return false;

      return user;
    },
    cookieName: 'adminjs',
    cookiePassword: process.env.ADMIN_COOKIE_SECRET || 'some-secret-password-used-to-secure-cookie',
  },
  null,
  {
    store: new session.MemoryStore(),
    resave: true,
    saveUninitialized: true,
    secret: process.env.ADMIN_SESSION_SECRET || 'some-secret-password-used-to-secure-session',
    cookie: {
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
    },
    name: 'adminjs',
  }
);

// Mount admin routes
router.use('/admin', adminRouter);

export default router; 