import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOtp, resendOtp } from '../../store/slices/authSlice';
import { handleValidationError, formatValidationErrors } from '../../utils/validationErrorHandler';

const OtpSchema = Yup.object().shape({
  otp: Yup.string()
    .matches(/^[0-9]{6}$/, 'OTP must be 6 digits')
    .required('OTP is required'),
});

const OtpVerificationScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [apiError, setApiError] = useState(null);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { email, purpose } = route.params;
  const otpInputRef = useRef(null);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmit = async (values) => {
    try {
      setApiError(null);
      
      const result = await dispatch(verifyOtp({
        email,
        otp: values.otp,
        purpose,
      })).unwrap();
      
      Alert.alert(
        'Success',
        'OTP verified successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (purpose === 'reset_password') {
                navigation.navigate('ResetPassword', { email, otp: values.otp });
              } else if (purpose === 'verify_email') {
                navigation.navigate('Login');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('OTP verification error:', error);
      
      if (error.validationErrors) {
        setApiError(formatValidationErrors(error.validationErrors));
      } else {
        setApiError(error.message || 'Failed to verify OTP');
      }
      
      Alert.alert(
        'Error',
        error.message || 'Failed to verify OTP. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleResendOtp = async () => {
    try {
      setApiError(null);
      setCanResend(false);
      setTimer(60);
      
      const result = await dispatch(resendOtp({ email, purpose })).unwrap();
      
      Alert.alert(
        'Success',
        'New OTP has been sent to your email.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Resend OTP error:', error);
      setCanResend(true);
      
      Alert.alert(
        'Error',
        error.message || 'Failed to resend OTP. Please try again.',
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
          <Text style={styles.headerTitle}>Verify OTP</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.subtitle}>
            We have sent a verification code to your email address.
          </Text>

          <Formik
            initialValues={{ otp: '' }}
            validationSchema={OtpSchema}
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
                  <Text style={styles.label}>Verification Code</Text>
                  <TextInput
                    ref={otpInputRef}
                    style={styles.input}
                    onChangeText={handleChange('otp')}
                    onBlur={handleBlur('otp')}
                    value={values.otp}
                    placeholder="Enter 6-digit code"
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  {touched.otp && errors.otp && (
                    <Text style={styles.errorText}>{errors.otp}</Text>
                  )}
                </View>

                {apiError && (
                  <View style={styles.apiErrorContainer}>
                    <Text style={styles.apiErrorText}>{apiError}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.disabledButton]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Verify</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>
                    Didn't receive the code?{' '}
                    {canResend ? (
                      <Text
                        style={styles.resendLink}
                        onPress={handleResendOtp}
                      >
                        Resend
                      </Text>
                    ) : (
                      <Text style={styles.timerText}>
                        Resend in {timer}s
                      </Text>
                    )}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.backToLogin}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.backToLoginText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </View>
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
    flexGrow: 1,
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
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    letterSpacing: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
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
  button: {
    backgroundColor: '#1B794B',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
  resendLink: {
    color: '#1B794B',
    fontWeight: 'bold',
  },
  timerText: {
    color: '#999',
  },
  backToLogin: {
    marginTop: 16,
    alignItems: 'center',
  },
  backToLoginText: {
    color: '#1B794B',
    fontSize: 16,
  },
});

export default OtpVerificationScreen;
