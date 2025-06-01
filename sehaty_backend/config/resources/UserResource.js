import bcrypt from 'bcrypt';
import User from '../../models/UserModel.js';
import { fileURLToPath } from 'url';
import path from 'path';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  }
}).single('image');

const UserResource = {
  resource: User,
  options: {
    navigation: {
      name: 'User Management',
      icon: 'User',
    },
    properties: {
      image: {
        isVisible: {
          list: true,
          edit: true,
          filter: false,
          show: true,
        },
        type: 'string',
      },
      password: {
        isVisible: {
          list: false,
          edit: true,
          filter: false,
          show: false,
        },
        type: 'password',
      },
      passwordHistory: {
        type: 'mixed',
        isVisible: {
          list: false,
          edit: false,
          filter: false,
          show: true,
        },
      },
      addresses: {
        reference: 'Address',
        isArray: true,
        type: 'reference',
      },
      reminders: {
        reference: 'Reminder',
        isArray: true,
        type: 'reference',
      },
      cart: {
        reference: 'Cart',
        type: 'reference',
      },
      wishlists: {
        reference: 'Wishlist',
        isArray: true,
        type: 'reference',
      },
      orders: {
        reference: 'Order',
        isArray: true,
        type: 'reference',
      },
      favoritePharmacies: {
        reference: 'Pharmacy',
        isArray: true,
        type: 'reference',
      },
      createdAt: {
        isVisible: {
          list: true,
          edit: false,
          filter: true,
          show: true,
        },
      },
      updatedAt: {
        isVisible: {
          list: true,
          edit: false,
          filter: true,
          show: true,
        },
      },
    },
    actions: {
      new: {
        before: async (request) => {
          if (request.payload.password) {
            request.payload = {
              ...request.payload,
              password: await bcrypt.hash(request.payload.password, 10),
            };
          }
          return request;
        },
      },
      edit: {
        before: async (request) => {
          if (request.payload.password) {
            request.payload = {
              ...request.payload,
              password: await bcrypt.hash(request.payload.password, 10),
            };
          }
          return request;
        },
      },
      upload: {
        actionType: 'resource',
        handler: async (request, response, context) => {
          return new Promise((resolve, reject) => {
            upload(request, response, (err) => {
              if (err) {
                reject(err);
                return;
              }
              
              if (!request.file) {
                reject(new Error('No file uploaded'));
                return;
              }

              const fileUrl = `/uploads/${request.file.filename}`;
              resolve({
                data: {
                  url: fileUrl
                }
              });
            });
          });
        },
      },
    },
  },
};

export default UserResource; 