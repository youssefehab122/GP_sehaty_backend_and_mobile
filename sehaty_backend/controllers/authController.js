import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';
import { sendOtpEmail } from '../utils/emailService.js';

// Register new user
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Log the received data for debugging
    console.log('Register request:', { 
      name, 
      email, 
      phone, 
      hasFile: !!req.file,
      fileDetails: req.file ? {
        fieldname: req.file.fieldname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null
    });

    // Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        validationErrors: {
          name: !name ? 'Name is required' : null,
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null,
          phone: !phone ? 'Phone is required' : null
        }
      });
    }
    
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists',
        receivedData: {
          email,
          hasFile: !!req.file
        }
      });
    }

    // Create new user (password will be hashed by the model)
    user = new User({
      name,
      email,
      password, // Pass the plain password, model will hash it
      phone,
      role: 'user',
      image: req.file ? `/uploads/${req.file.filename}` : undefined
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        validationErrors: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {})
      });
    }

    res.status(500).json({ 
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        name: error.name
      } : undefined
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password, remember } = req.body;
    console.log('Login attempt:', { email, remember });
    
    // Find user
    const user = await User.findOne({ email, isDeleted: false });
    console.log('User found:', user ? {
      id: user._id,
      email: user.email,
      hasPassword: !!user.password,
      passwordLength: user.password?.length
    } : 'No');
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isLocked()) {
      console.log('Account is locked');
      return res.status(403).json({
        message: 'Account is locked. Please try again later.',
        lockUntil: user.lockUntil
      });
    }

    // Check password
    console.log('Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      console.log('Password mismatch, incrementing failed attempts');
      // Increment failed login attempts
      await user.incrementFailedLoginAttempts();
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if password is expired
    if (user.isPasswordExpired()) {
      console.log('Password is expired');
      return res.status(403).json({
        message: 'Password has expired. Please reset your password.',
        requiresPasswordReset: true
      });
    }

    // Reset failed login attempts on successful login
    await user.resetFailedLoginAttempts();

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token with longer expiry if remember is true
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: remember ? '30d' : '7d' }
    );

    console.log('Login successful, generating token');
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('addresses');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const userId = req.user._id;

    // Get current user data
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prepare update data with current values as fallback
    const updateData = {
      name: name || currentUser.name,
      email: email || currentUser.email,
      phone: phone || currentUser.phone,
    };

    // Check if email is being changed and if it's already taken
    if (email && email !== currentUser.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken',
        });
      }
    }

    // Handle profile image upload
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    // Handle password update if provided
    if (password) {
      // Check if password was used before
      const wasUsed = await currentUser.wasPasswordUsed(password);
      if (wasUsed) {
        return res.status(400).json({
          success: false,
          message: 'This password was used recently. Please choose a different password.'
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Add password-related fields to update data
      updateData.password = hashedPassword;
      updateData.lastPasswordChange = new Date();
      updateData.passwordExpiryDate = new Date(+new Date() + 90*24*60*60*1000); // 90 days from now

      // Add to password history
      updateData.$push = {
        passwordHistory: {
          password: hashedPassword
        }
      };

      // Keep only last 5 passwords
      if (currentUser.passwordHistory.length >= 5) {
        updateData.$pop = { passwordHistory: -1 }; // Remove oldest password
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-password' }
    );

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Check if password was used before
    const wasUsed = await req.user.wasPasswordUsed(newPassword);
    if (wasUsed) {
      return res.status(400).json({
        message: 'This password was used recently. Please choose a different password.'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, req.user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    req.user.password = await bcrypt.hash(newPassword, salt);
    req.user.lastPasswordChange = new Date();
    req.user.passwordExpiryDate = new Date(+new Date() + 90*24*60*60*1000); // 90 days from now

    // Add to password history
    req.user.passwordHistory.push({
      password: req.user.password
    });

    // Keep only last 5 passwords
    if (req.user.passwordHistory.length > 5) {
      req.user.passwordHistory.shift();
    }

    await req.user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send OTP via email
    const emailSent = await sendOtpEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.json({
      message: 'OTP sent to your email',
      // Remove OTP from response in production
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { email, password, token } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Check if password was used before
    const wasUsed = await user.wasPasswordUsed(password);
    if (wasUsed) {
      return res.status(400).json({
        message: 'This password was used recently. Please choose a different password.'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.lastPasswordChange = new Date();
    user.passwordExpiryDate = new Date(+new Date() + 90*24*60*60*1000); // 90 days from now

    // Add to password history
    user.passwordHistory.push({
      password: user.password
    });

    // Keep only last 5 passwords
    if (user.passwordHistory.length > 5) {
      user.passwordHistory.shift();
    }

    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user
    const user = await User.findOne({
      email,
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    // Get the token from the request header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Update user's last logout time
    await User.findByIdAndUpdate(req.user._id, {
      lastLogout: new Date()
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('addresses')
      .populate('favoritePharmacies');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Resend OTP
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send new OTP via email
    const emailSent = await sendOtpEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.json({
      message: 'New OTP sent to your email',
      // Remove OTP from response in production
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 