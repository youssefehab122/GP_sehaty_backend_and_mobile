import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { authAPI } from '../../services/api';
import { setUser } from '../../store/slices/authSlice';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { updateProfile } from '../../store/slices/authSlice';
import { handleValidationError, formatValidationErrors } from '../../utils/validationErrorHandler';
import { FontAwesome } from '@expo/vector-icons';

const ProfileSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  email: Yup.string()
    .email('Please enter a valid email')
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  phone: Yup.string()
    .matches(/^[0-9]{11}$/, 'Phone number must be 11 digits')
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(/\d/, 'Password must contain at least one number')
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .when('password', {
      is: (val) => val && val.length > 0,
      then: (schema) => schema.required('Please confirm your password'),
      otherwise: (schema) => schema.nullable().transform(() => null)
    })
    .nullable()
    .transform((value) => (value === '' ? null : value)),
});

const EditProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading, error, validationErrors } = useSelector((state) => state.auth);
  console.log(user);
  const [image, setimage] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user?.image) {
      setimage(user.image);
    }
  }, [user]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setimage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setApiError(null);
      
      const formData = new FormData();
      
      // Always include all fields, but use current values for unchanged fields
      formData.append('name', values.name || user?.name || '');
      formData.append('email', values.email || user?.email || '');
      formData.append('phone', values.phone || user?.phone || '');
      
      // Only include password if it's provided and not empty
      if (values.password && values.password.trim() !== '') {
        formData.append('password', values.password);
      }
      
      // Include profile image if it's changed
      if (image && image !== user?.image) {
        formData.append('image', {
          uri: image,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
      }

      // Check if there are any changes
      const hasChanges = 
        (values.name && values.name !== user?.name) ||
        (values.email && values.email !== user?.email) ||
        (values.phone && values.phone !== user?.phone) ||
        (values.password && values.password.trim() !== '') ||
        (image && image !== user?.image);

      if (!hasChanges) {
        Alert.alert('Error', 'Please update at least one field');
        return;
      }

      const result = await dispatch(updateProfile(formData)).unwrap();
      
      Alert.alert(
        'Success',
        'Profile updated successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Profile update error:', error);
      
      if (error.validationErrors) {
        setApiError(formatValidationErrors(error.validationErrors));
      } else {
        setApiError(error.message || 'Failed to update profile');
      }
      
      Alert.alert(
        'Error',
        error.message || 'Failed to update profile. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Profile Image */}
        <View style={styles.imageSection}>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={pickImage}
          >
            {image ? (
              <Image
                source={{ uri: image }}
                style={styles.image}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <FontAwesome name="user" size={50} color="#ccc" />
              </View>
            )}
            <View style={styles.editIconContainer}>
              <FontAwesome name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.imageText}>Tap to change profile picture</Text>
        </View>

        {/* Form Fields */}
        <Formik
          initialValues={{
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            password: '',
            confirmPassword: ''
          }}
          validationSchema={ProfileSchema}
          onSubmit={handleSubmit}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  value={values.name}
                  placeholder="Enter your name"
                />
                {touched.name && errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  value={values.phone}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                />
                {touched.phone && errors.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>New Password (Optional)</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                    placeholder="Enter new password"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesome
                      name={showPassword ? 'eye-slash' : 'eye'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              {/* Confirm Password Input */}
              {values.password && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirm New Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      value={values.confirmPassword}
                      placeholder="Confirm new password"
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <FontAwesome
                        name={showConfirmPassword ? 'eye-slash' : 'eye'}
                        size={20}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                  )}
                </View>
              )}

              {apiError && (
                <View style={styles.apiErrorContainer}>
                  <Text style={styles.apiErrorText}>{apiError}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.updateButton, isLoading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.updateButtonText}>Update Profile</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#E8F5E9',
  },
  backButton: {
    width: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B794B',
  },
  imageSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1B794B',
    padding: 8,
    borderRadius: 20,
  },
  imageText: {
    fontSize: 14,
    color: '#606060',
  },
  form: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#606060',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  updateButton: {
    backgroundColor: '#1B794B',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  apiErrorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  apiErrorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 12,
  },
});

export default EditProfileScreen; 