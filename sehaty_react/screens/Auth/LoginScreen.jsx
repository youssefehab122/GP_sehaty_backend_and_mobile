import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import Checkbox from "expo-checkbox";
import sehatyLogo from "../../assets/sehaty_logo.png";
import googleLogin from "../../assets/social/google.png";
import facebookLogin from "../../assets/social/facebook.png";
import twitterLogin from "../../assets/social/twitter.png";
import linkedinLogin from "../../assets/social/linkedin.png";
import * as Animatable from "react-native-animatable";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { login, clearAuthState, clearValidationErrors } from "../../store/slices/authSlice";

// Import Heroicons
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "react-native-heroicons/outline";
import { FontAwesome } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { isLoading, error, validationErrors } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearAuthState());
    setApiError(null);
  }, [dispatch]);

  const handleSubmit = async (values) => {
    try {
      
      setApiError(null);
      
      const result = await dispatch(
        login({
          email: values.email,
          password: values.password,
          remember,
        })
      ).unwrap();
      
      
      
      // Show success message
      Alert.alert(
        "Success",
        "Login successful!",
        [{ text: "OK" }]
      );
      
    } catch (error) {
      
      //   message: error.message,
      //   response: error.response?.data,
      //   status: error.response?.status,
      //   headers: error.response?.headers,
      //   config: error.config
      // });
      
      let errorMessage = 'Login failed. ';
      
      if (error.response) {
        // Handle specific error cases
        
        
        switch (error.response.status) {
          case 400:
            errorMessage = 'Invalid email or password format.';
            break;
          case 401:
            errorMessage = 'Invalid email or password.';
            break;
          case 403:
            errorMessage = 'Your account has been blocked. Please contact support.';
            break;
          case 404:
            errorMessage = 'Account not found. Please check your email.';
            break;
          case 429:
            errorMessage = 'Too many login attempts. Please try again later.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = error.response.data?.message || 'An error occurred during login.';
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your internet connection.';
      } else {
        errorMessage = error.message;
      }
      
      setApiError(errorMessage);
      
      // Show error alert
      Alert.alert(
        "Login Error",
        errorMessage,
        [{ text: "OK" }]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Animatable.Image
        animation="bounceIn"
        duration={1500}
        source={sehatyLogo}
        style={styles.logo}
      />

      {/* Titles */}
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>
        Log in to continue shopping with Sehaty
      </Text>

      <Animatable.View animation="fadeInUp" delay={300}>
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
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
            <>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <EnvelopeIcon
                  size={20}
                  color="#A9A9A9"
                  style={styles.iconLeft}
                />
                <TextInput
                  placeholder="Enter your email"
                  style={styles.input}
                  keyboardType="email-address"
                  placeholderTextColor="#A9A9A9"
                  autoCapitalize="none"
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  value={values.email}
                />
              </View>
              {touched.email && errors.email && (
                <Text style={styles.error}>{errors.email}</Text>
              )}

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <LockClosedIcon
                  size={20}
                  color="#A9A9A9"
                  style={styles.iconLeft}
                />
                <TextInput
                  placeholder="Password"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#A9A9A9"
                  autoCapitalize="none"
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  value={values.password}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <View style={styles.iconRight}>
                    {showPassword ? (
                      <EyeIcon size={20} color="#A9A9A9" />
                    ) : (
                      <EyeSlashIcon size={20} color="#A9A9A9" />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
              {touched.password && errors.password && (
                <Text style={styles.error}>{errors.password}</Text>
              )}

              {/* Error Display */}
              {apiError && (
                <View style={styles.errorContainer}>
                  <Text style={styles.apiError}>{apiError}</Text>
                </View>
              )}

              {/* Remember me & Forgot Password */}
              <View style={styles.otherLoginOptions}>
                <View style={styles.checkboxContainer}>
                  <Checkbox
                    value={remember}
                    onValueChange={setRemember}
                    style={styles.checkbox}
                    color="#A9A9A9"
                  />
                  <Text style={styles.checkboxText}>Remember me</Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate("ForgotPassword")}
                >
                  <Text style={styles.forgotPasswordText}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Submit */}
              <TouchableOpacity 
                style={styles.button} 
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                {/* <View style={styles.dividerLine} /> */}
                {/* <Text style={styles.dividerText}>Or Login with </Text> */}
                {/* <View style={styles.dividerLine} /> */}
              </View>

              {/* Social Icons */}
              <View style={styles.socialContainer}>
            
              </View>

              {/* Footer */}
              <Text style={styles.footer}>
                Don't have an account?{" "}
                <Text
                  style={styles.signup}
                  onPress={() => navigation.navigate("Register")}
                >
                  Sign up
                </Text>
              </Text>
            </>
          )}
        </Formik>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    width: width,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginBottom: 0,
  },
  title: {
    fontSize: 22,
    color: "#000000",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 50,
    color: "#606060",
  },
  inputContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#D6D6D6",
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 14,
    marginBottom: 12,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  error: {
    color: "red",
    marginBottom: 10,
    marginLeft: 5,
    fontSize: 14,
  },
  checkbox: {
    borderWidth: 1,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  checkboxText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#A9A9A9",
  },
  otherLoginOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  forgotPasswordText: {
    color: "#1B794B",
    fontSize: 14,
    textAlign: "right",
    flex: 1,
    paddingLeft: 10,
  },
  button: {
    backgroundColor: "#1B794B",
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#A9A9A9",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#A9A9A9",
  },
  footer: {
    textAlign: "center",
    color: "#000000",
    fontSize: 14,
  },
  signup: {
    color: "#1B794B",
    fontWeight: "bold",
    fontSize: 16,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 20,
  },
  socialIcon: {
    width: 40,
    height: 40,
    marginHorizontal: -20,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  apiError: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
  },
});
