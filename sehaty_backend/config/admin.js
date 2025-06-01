import AdminJS, { ComponentLoader } from 'adminjs';
import * as AdminJSMongoose from '@adminjs/mongoose';
import User from '../models/UserModel.js';
import Medicine from '../models/MedicineModel.js';
import Pharmacy from '../models/PharmacyModel.js';
import Order from '../models/OrderModel.js';
import Category from '../models/CategoryModel.js';
import Address from '../models/AddressModel.js';
import Cart from '../models/CartModel.js';
import Delivery from '../models/DeliveryModel.js';
import Notification from '../models/NotificationModel.js';
import PaymentMethod from '../models/PaymentMethod.js';
import PharmacyMedicine from '../models/PharmacyMedicineModel.js';
import Prescription from '../models/PrescriptionModel.js';
import PromoCode from '../models/PromoCodeModel.js';
import Reminder from '../models/Reminder.js';
import Review from '../models/ReviewModel.js';
import Stock from '../models/StockModel.js';
import Wishlist from '../models/WishlistModel.js';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import path from 'path';

// Import resource configurations
import UserResource from './resources/UserResource.js';
import MedicineResource from './resources/MedicineResource.js';
import PharmacyResource from './resources/PharmacyResource.js';
import OrderResource from './resources/OrderResource.js';
import CategoryResource from './resources/CategoryResource.js';
import AddressResource from './resources/AddressResource.js';
import CartResource from './resources/CartResource.js';
import DeliveryResource from './resources/DeliveryResource.js';
import NotificationResource from './resources/NotificationResource.js';
import PaymentMethodResource from './resources/PaymentMethodResource.js';
import PharmacyMedicineResource from './resources/PharmacyMedicineResource.js';
import PrescriptionResource from './resources/PrescriptionResource.js';
import PromoCodeResource from './resources/PromoCodeResource.js';
import ReminderResource from './resources/ReminderResource.js';
import ReviewResource from './resources/ReviewResource.js';
import StockResource from './resources/StockResource.js';
import WishlistResource from './resources/WishlistResource.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up ComponentLoader with absolute paths
const componentLoader = new ComponentLoader();

// Register components with absolute paths
const components = {
  ImageUpload: componentLoader.add('ImageUpload', path.resolve(__dirname, '../admin/components/ImageUpload.jsx')),
  ImagePreview: componentLoader.add('ImagePreview', path.resolve(__dirname, '../admin/components/ImagePreview.jsx')),
};

// Patch UserResource to add custom components
const userResourceWithComponents = {
  ...UserResource,
  options: {
    ...UserResource.options,
    properties: {
      ...UserResource.options.properties,
      image: {
        ...UserResource.options.properties.image,
        components: {
          edit: components.ImageUpload,
          list: components.ImagePreview,
          show: components.ImagePreview,
        },
      },
    },
  },
};

const adminOptions = {
  resources: [
    userResourceWithComponents,
    MedicineResource,
    PharmacyResource,
    OrderResource,
    CategoryResource,
    AddressResource,
    CartResource,
    DeliveryResource,
    NotificationResource,
    PaymentMethodResource,
    PharmacyMedicineResource,
    PrescriptionResource,
    PromoCodeResource,
    ReminderResource,
    ReviewResource,
    StockResource,
    WishlistResource,
  ],
  rootPath: '/admin',
  branding: {
    companyName: 'Sehaty Admin',
    logo: false,
    softwareBrothers: false,
  },
  auth: {
    authenticate: async (email, password) => {
      const user = await User.findOne({ email, role: 'admin' });
      if (!user) return false;
      const isMatch = await bcrypt.compare(password, user.password);
      return isMatch ? user : false;
    },
    cookieName: 'adminjs',
    cookiePassword: process.env.ADMIN_COOKIE_SECRET || 'some-secret-password-used-to-secure-cookie',
  },
  sessionOptions: {
    resave: true,
    saveUninitialized: true,
    secret: process.env.ADMIN_SESSION_SECRET || 'some-secret-password-used-to-secure-session',
    cookie: {
      httpOnly: false,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      sameSite: 'lax'
    },
    name: 'adminjs',
  },
  dashboard: {},
  debug: true,
  componentLoader,
};

export default adminOptions; 